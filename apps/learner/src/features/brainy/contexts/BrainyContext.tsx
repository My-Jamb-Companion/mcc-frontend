"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {
  ApiSession,
  createSession as createSessionApi,
  getSession as getSessionApi,
} from "../services/brainy.service";
import {SESSIONS_QUERY_KEY, useSessions} from "../hooks/useBrainyChat";

export type BrainyMode = "research" | "assignment" | "exam";

/**
 * Must match AI_UNAVAILABLE_MESSAGE in the backend's brainy/service.py --
 * stored exchanges carry no "did this succeed" flag, so the text is the only
 * way to recognise a failed turn when replaying a thread from the server.
 */
const AI_UNAVAILABLE_MESSAGE = "My brain is fuzzy right now. Please try again.";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  file?: File[];
  timestamp: Date;
  /**
   * True when the backend returned `generated: false` -- Brainy never got a
   * real answer (provider busy, rate-limited, or out of token budget). Shown
   * as a recoverable prompt rather than passed off as a tutor's reply.
   */
  degraded?: boolean;
}

export interface StudySession {
  id: string;
  title: string;
  mode: BrainyMode;
  subject?: string;
  messages: ChatMessage[];
  createdAt: Date;
}

interface BrainyContextType {
  mode: BrainyMode;
  setMode: (mode: BrainyMode) => void;
  isMobile: boolean;
  subject: string;
  setSubject: (subject: string) => void;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  sessions: StudySession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  /**
   * Creates the thread server-side and returns its real session_id.
   * Async because the id has to come from the server -- a client-minted id
   * could never be reloaded after a refresh or on another device.
   */
  createNewSession: (
    title: string,
    mode: BrainyMode,
    subject?: string,
    initialMessages?: ChatMessage[],
  ) => Promise<string>;
  /** Pulls a thread's messages from the server into context (refresh / deep link). */
  loadSessionMessages: (sessionId: string) => Promise<void>;
  sessionsLoading: boolean;
  addMessageToActiveSession: (
    sender: "user" | "ai",
    text: string,
    files?: File[],
  ) => void;
  addMessageToSession: (
    sessionId: string,
    sender: "user" | "ai",
    text: string,
    files?: File[],
    degraded?: boolean,
  ) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
}

const BrainyContext = createContext<BrainyContextType | undefined>(undefined);

export function BrainyProvider({children}: {children: React.ReactNode}) {
  const [mode, setMode] = useState<BrainyMode>("research");
  const [subject, setSubject] = useState("general");
  const [files, setFiles] = useState<File[]>([]);
  // Threads created in this tab, until the sessions query catches up.
  const [localSessions, setLocalSessions] = useState<StudySession[]>([]);
  // Messages keyed by session id -- the server owns thread metadata, this owns
  // the conversation bodies (live ones and any hydrated from the server).
  const [messagesBySession, setMessagesBySession] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const queryClient = useQueryClient();
  const {sessions: remoteSessions, isLoading: sessionsLoading} = useSessions();

  // Threads come from the server (which is what makes them survive logout,
  // a refresh, or a different device); messages live in a local map keyed by
  // session id. Deriving the combined list rather than copying the server's
  // response into state avoids a sync effect that could blank live messages
  // on every refetch.
  //
  // localSessions only holds a thread in the gap between creating it here and
  // the sessions query refetching, so it can't flicker out of the sidebar.
  const sessions = React.useMemo<StudySession[]>(() => {
    const remoteIds = new Set(remoteSessions.map((s: ApiSession) => s.session_id));
    const fromRemote = remoteSessions.map((remote: ApiSession) => ({
      id: remote.session_id,
      title: remote.title,
      mode: remote.mode as BrainyMode,
      subject: remote.subject ?? undefined,
      messages: messagesBySession[remote.session_id] ?? [],
      createdAt: new Date(remote.created_at),
    }));
    const localOnly = localSessions
      .filter((s) => !remoteIds.has(s.id))
      .map((s) => ({...s, messages: messagesBySession[s.id] ?? s.messages}));
    return [...localOnly, ...fromRemote];
  }, [remoteSessions, localSessions, messagesBySession]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);
  const createNewSession = useCallback(
    async (
      title: string,
      sessionMode: BrainyMode,
      sessionSubject?: string,
      initialMessages?: ChatMessage[],
    ) => {
      // The id comes from the server, not Math.random(), so the thread can be
      // reopened after a refresh or from another device.
      const remote = await createSessionApi({
        title,
        mode: sessionMode,
        subject: sessionSubject,
      });

      const newSession: StudySession = {
        id: remote.session_id,
        title: remote.title,
        mode: remote.mode as BrainyMode,
        subject: remote.subject ?? undefined,
        messages: initialMessages || [],
        createdAt: new Date(remote.created_at),
      };
      setLocalSessions((prev) => [newSession, ...prev]);
      if (initialMessages?.length) {
        setMessagesBySession((prev) => ({
          ...prev,
          [remote.session_id]: initialMessages,
        }));
      }
      setActiveSessionId(remote.session_id);
      clearFiles();
      queryClient.invalidateQueries({queryKey: SESSIONS_QUERY_KEY});
      return remote.session_id;
    },
    [clearFiles, queryClient],
  );

  const loadSessionMessages = useCallback(async (sessionId: string) => {
    const detail = await getSessionApi(sessionId);

    // Each stored row is one exchange, so it expands into two chat bubbles.
    const messages: ChatMessage[] = [];
    for (const row of detail.messages) {
      messages.push({
        id: `${row.chat_id}-q`,
        sender: "user",
        text: row.user_message,
        timestamp: new Date(row.timestamp),
      });
      if (row.ai_response) {
        messages.push({
          id: `${row.chat_id}-a`,
          sender: "ai",
          text: row.ai_response,
          timestamp: new Date(row.timestamp),
          // A failure stored on a previous visit should still offer a retry
          // rather than sitting in the thread looking like a real answer.
          degraded: row.ai_response === AI_UNAVAILABLE_MESSAGE,
        });
      }
    }

    setMessagesBySession((prev) => ({...prev, [sessionId]: messages}));

    // Covers the gap where the sessions list hasn't landed yet (deep link
    // straight into a thread) -- the derived list needs its metadata from
    // somewhere until the query resolves.
    setLocalSessions((prev) =>
      prev.some((s) => s.id === sessionId)
        ? prev
        : [
            {
              id: detail.session_id,
              title: detail.title,
              mode: detail.mode as BrainyMode,
              subject: detail.subject ?? undefined,
              messages,
              createdAt: new Date(detail.created_at),
            },
            ...prev,
          ],
    );
  }, []);
  // Takes the target session id explicitly rather than reading
  // activeSessionId from this closure -- a callback handed to an async
  // mutation's onSuccess (e.g. after POST /brainy/chats resolves) closes
  // over activeSessionId as it was at *creation* time, which for a
  // brand-new session is still null (createNewSession's setActiveSessionId
  // hasn't taken effect on this render yet) -- so the guarded
  // addMessageToActiveSession below silently no-ops for exactly the reply
  // that matters most, the first one.
  const addMessageToSession = useCallback(
    (
      sessionId: string,
      sender: "user" | "ai",
      text: string,
      files?: File[],
      degraded?: boolean,
    ) => {
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionId]: [
          ...(prev[sessionId] ?? []),
          {
            id: Math.random().toString(36).substring(7),
            sender,
            text,
            timestamp: new Date(),
            file: files,
            degraded,
          },
        ],
      }));
    },
    [],
  );

  const addMessageToActiveSession = useCallback(
    (sender: "user" | "ai", text: string, files?: File[]) => {
      if (!activeSessionId) return;
      addMessageToSession(activeSessionId, sender, text, files);
    },
    [activeSessionId, addMessageToSession],
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const prevIsMobile = useRef(isMobile);
  useEffect(() => {
    if (prevIsMobile.current !== isMobile) {
      setIsSidebarOpen(!isMobile);
      prevIsMobile.current = isMobile;
    }
  }, [isMobile]);

  return (
    <BrainyContext.Provider
      value={{
        mode,
        setMode,
        subject,
        setSubject,
        isMobile,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        files,
        setFiles,
        addFiles,
        removeFile,
        clearFiles,
        sessions,
        activeSessionId,
        setActiveSessionId,
        createNewSession,
        loadSessionMessages,
        sessionsLoading,
        addMessageToActiveSession,
        addMessageToSession,
      }}
    >
      {children}
    </BrainyContext.Provider>
  );
}

export function useBrainy() {
  const context = useContext(BrainyContext);
  if (context === undefined) {
    throw new Error("useBrainy must be used within a BrainyProvider");
  }
  return context;
}
