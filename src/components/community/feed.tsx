"use client";

import { ShareCard, CommunityPost } from "./share-card";

interface FeedProps {
  posts: CommunityPost[];
  currentUserId?: string;
  likedPostIds: Set<string>;
  onLikeToggle: (postId: string, liked: boolean) => void;
  loading?: boolean;
}

export function Feed({
  posts,
  currentUserId,
  likedPostIds,
  onLikeToggle,
  loading,
}: FeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 p-4 space-y-3 animate-pulse"
          >
            <div className="flex justify-between">
              <div className="h-5 w-20 bg-slate-800 rounded-full" />
              <div className="h-4 w-12 bg-slate-800 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-4/5" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 w-16 bg-slate-800 rounded" />
              <div className="h-6 w-12 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-sm">아직 공유된 학습 내용이 없습니다.</p>
        <p className="text-xs mt-1">첫 번째로 학습 내용을 공유해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <ShareCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          likedPostIds={likedPostIds}
          onLikeToggle={onLikeToggle}
        />
      ))}
    </div>
  );
}
