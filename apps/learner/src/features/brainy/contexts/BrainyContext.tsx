"use client";

import React, {createContext, useContext, useState, useCallback} from "react";

export type BrainyMode = "research" | "assignment" | "exam";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  file?: File[];
  timestamp: Date;
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
  createNewSession: (
    title: string,
    mode: BrainyMode,
    subject?: string,
    initialMessages?: ChatMessage[],
  ) => string;
  addMessageToActiveSession: (
    sender: "user" | "ai",
    text: string,
    files?: File[],
  ) => void;
}

const BrainyContext = createContext<BrainyContextType | undefined>(undefined);

export function BrainyProvider({children}: {children: React.ReactNode}) {
  const [mode, setMode] = useState<BrainyMode>("research");
  const [subject, setSubject] = useState("general");
  const [files, setFiles] = useState<File[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
    (
      title: string,
      sessionMode: BrainyMode,
      sessionSubject?: string,
      initialMessages?: ChatMessage[],
    ) => {
      const newSessionId = Math.random().toString(36).substring(7);
      const newSession: StudySession = {
        id: newSessionId,
        title,
        mode: sessionMode,
        subject: sessionSubject,
        messages: initialMessages || [],
        createdAt: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      clearFiles();
      return newSessionId;
    },
    [clearFiles],
  );

  const addMessageToActiveSession = useCallback(
    (sender: "user" | "ai", text: string, files?: File[]) => {
      if (!activeSessionId) return;
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                {
                  id: Math.random().toString(36).substring(7),
                  sender,
                  text,
                  timestamp: new Date(),
                  file: files,
                },
              ],
            };
          }
          return session;
        }),
      );
    },
    [activeSessionId],
  );

  return (
    <BrainyContext.Provider
      value={{
        mode,
        setMode,
        subject,
        setSubject,
        files,
        setFiles,
        addFiles,
        removeFile,
        clearFiles,
        sessions,
        activeSessionId,
        setActiveSessionId,
        createNewSession,
        addMessageToActiveSession,
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
