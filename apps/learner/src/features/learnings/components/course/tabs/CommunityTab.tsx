"use client";

import {useRef, useState, useEffect} from "react";
import {Button} from "@mcc/ui";
import {Flag} from "lucide-react";
import {useCommunityPosts, useCreatePost, useReportPost} from "@/src/features/learnings/hooks/useCommunity";
import {ApiPost} from "@/src/features/learnings/services/community.service";

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Real course discussion board (course_posts). The backend only exposes
 * top-level posts with a reply_count -- there's no thread-fetch endpoint
 * yet, so replies can't be listed inline (the old demo UI's upvote/downvote
 * and inline comment thread had no real data behind them either and are
 * gone here).
 */
export default function CommunityTab({courseId}: {courseId: string}) {
  const {posts, isLoading} = useCommunityPosts(courseId);
  const createPost = useCreatePost(courseId);
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handlePost = () => {
    if (!value.trim() || createPost.isPending) return;
    createPost.mutate(value.trim(), {onSuccess: () => setValue("")});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
  };

  return (
    <section className="mx-auto w-full md:w-[75%]">
      <div className="w-full rounded-2xl border border-gray-200 bg-white px-4 pt-3 pb-3 shadow-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to talk about?"
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none leading-relaxed"
        />
        <div className="flex justify-end pt-1">
          <Button
            onClick={handlePost}
            disabled={!value.trim() || createPost.isPending}
            width="fit"
            className="rounded-full bg-blue-500! px-5 py-2 text-sm font-medium text-white transition-opacity hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {createPost.isPending ? "Posting…" : "Post"}
          </Button>
        </div>
      </div>

      <div className="w-full py-8">
        {isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading discussion…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No posts yet. Start the discussion!
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.post_id} post={post} courseId={courseId} />)
        )}
      </div>
    </section>
  );
}

function Avatar({name, src}: {name: string; src?: string | null}) {
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const colors = [
    "bg-violet-200 text-violet-700",
    "bg-sky-200 text-sky-700",
    "bg-emerald-200 text-emerald-700",
    "bg-amber-200 text-amber-700",
    "bg-rose-200 text-rose-700",
  ];
  const color = colors[(name || "?").charCodeAt(0) % colors.length];

  if (src) {
    return <img src={src} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

function PostCard({post, courseId}: {post: ApiPost; courseId: string}) {
  const report = useReportPost(courseId);
  const [reported, setReported] = useState(false);
  const name = post.author.full_name || "A student";

  return (
    <div className="flex gap-3 py-5 border-b border-gray-100 last:border-none">
      <Avatar name={name} src={post.author.profile_photo_url} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">{name}</span>
          <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.body}</p>

        <div className="flex items-center gap-4 text-sm flex-wrap">
          {post.reply_count > 0 && (
            <span className="text-gray-400 text-xs">
              {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
            </span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            disabled={reported || report.isPending}
            onClick={() =>
              report.mutate(
                {postId: post.post_id, reason: "Reported from the course discussion"},
                {onSuccess: () => setReported(true)},
              )
            }
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
          >
            <Flag className="w-4 h-4" />
            <span>{reported ? "Reported" : "Flag"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
