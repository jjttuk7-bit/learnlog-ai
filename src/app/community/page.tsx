"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ShareForm } from "@/components/community/share-form";
import { Feed } from "@/components/community/feed";
import { CommunityPost, PostType } from "@/components/community/share-card";

type TabFilter = "all" | PostType;

const TABS: { value: TabFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "concept", label: "핵심 개념" },
  { value: "struggle", label: "어려웠던 것" },
  { value: "tip", label: "팁" },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [curatedPosts, setCuratedPosts] = useState<CommunityPost[] | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [loading, setLoading] = useState(true);
  const [curating, setCurating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setCuratedPosts(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("post_type", activeTab);
      const res = await fetch(`/api/community?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);

      if (currentUserId) {
        const supabase = createClient();
        const { data: likes } = await supabase
          .from("community_likes")
          .select("post_id")
          .eq("user_id", currentUserId);
        if (likes) {
          setLikedPostIds(new Set(likes.map((l: { post_id: string }) => l.post_id)));
        }
      }
    } catch {
      toast.error("게시글을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!curating) fetchPosts();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPosts, curating]);

  function handleLikeToggle(postId: string, liked: boolean) {
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (liked) next.add(postId);
      else next.delete(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes_count: p.likes_count + (liked ? 1 : -1) }
          : p
      )
    );
    if (curatedPosts) {
      setCuratedPosts((prev) =>
        prev
          ? prev.map((p) =>
              p.id === postId
                ? { ...p, likes_count: p.likes_count + (liked ? 1 : -1) }
                : p
            )
          : prev
      );
    }
  }

  async function handleCurate() {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다");
      return;
    }
    setCurating(true);
    setCuratedPosts(null);
    try {
      const res = await fetch("/api/community/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weak_points: "최근 학습한 AI/ML 개념 중 어려운 부분" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCuratedPosts(data.posts ?? []);
      toast.success("AI가 관련 게시글을 추천했습니다");
    } catch {
      toast.error("AI 추천을 불러오는데 실패했습니다");
    } finally {
      setCurating(false);
    }
  }

  const displayPosts = curatedPosts ?? posts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">커뮤니티</h1>
          <p className="text-slate-400 mt-1 text-sm">동료의 학습을 함께 나눠요</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleCurate}
            disabled={curating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {curating ? "추천 중..." : "AI 추천"}
          </button>
        </div>
      </div>

      <ShareForm onPostCreated={fetchPosts} />

      {curatedPosts && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-purple-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI가 추천한 게시글 ({curatedPosts.length}개)
            </p>
            <button
              onClick={() => setCuratedPosts(null)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              전체 보기
            </button>
          </div>
        </div>
      )}

      {!curatedPosts && (
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.value
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <Feed
        posts={displayPosts}
        currentUserId={currentUserId}
        likedPostIds={likedPostIds}
        onLikeToggle={handleLikeToggle}
        loading={loading}
      />
    </div>
  );
}
