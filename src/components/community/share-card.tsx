"use client";

import { useState } from "react";
import { Heart, User, Lightbulb, AlertCircle, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type PostType = "concept" | "struggle" | "tip";

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  is_anonymous: boolean;
  display_name: string | null;
  likes_count: number;
  created_at: string;
  curriculum_id?: number | null;
}

const postTypeConfig: Record<
  PostType,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  concept: {
    label: "핵심 개념",
    icon: BookOpen,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  struggle: {
    label: "어려웠던 것",
    icon: AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  tip: {
    label: "발견한 팁",
    icon: Lightbulb,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

interface ShareCardProps {
  post: CommunityPost;
  currentUserId?: string;
  likedPostIds: Set<string>;
  onLikeToggle: (postId: string, liked: boolean) => void;
}

export function ShareCard({
  post,
  currentUserId,
  likedPostIds,
  onLikeToggle,
}: ShareCardProps) {
  const config = postTypeConfig[post.post_type as PostType] ?? postTypeConfig.tip;
  const Icon = config.icon;
  const liked = likedPostIds.has(post.id);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      if (liked) {
        await supabase
          .from("community_likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id);
        await supabase
          .from("community_posts")
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq("id", post.id);
        onLikeToggle(post.id, false);
      } else {
        await supabase
          .from("community_likes")
          .insert({ user_id: currentUserId, post_id: post.id });
        await supabase
          .from("community_posts")
          .update({ likes_count: post.likes_count + 1 })
          .eq("id", post.id);
        onLikeToggle(post.id, true);
      }
    } catch {
      toast.error("좋아요 처리 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  const authorName = post.is_anonymous
    ? "익명"
    : post.display_name ?? "학습자";

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${config.bg} ${config.border}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 ${config.color}`}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        </div>
        <span className="text-xs text-slate-500">{timeAgo(post.created_at)}</span>
      </div>

      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User className="w-3 h-3" />
          <span>{authorName}</span>
        </div>
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors ${
            liked
              ? "text-pink-400 bg-pink-500/10"
              : "text-slate-500 hover:text-pink-400 hover:bg-pink-500/10"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-pink-400" : ""}`} />
          <span>{post.likes_count}</span>
        </button>
      </div>
    </div>
  );
}
