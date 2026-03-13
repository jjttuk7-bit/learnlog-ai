import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications: { id: string; type: string; message: string; action?: string }[] = [];
  const now = new Date();

  // Check last capture time
  const { data: lastCapture } = await supabase
    .from("captures")
    .select("created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastCapture) {
    const hoursSince = (now.getTime() - new Date(lastCapture.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSince > 24) {
      notifications.push({
        id: "capture-reminder",
        type: "reminder",
        message: `${Math.floor(hoursSince / 24)}일 동안 캡처가 없어요. 오늘 배운 것을 기록해보세요!`,
        action: "/capture",
      });
    }
  } else {
    notifications.push({
      id: "first-capture",
      type: "tip",
      message: "첫 학습 캡처를 시작해보세요!",
      action: "/capture",
    });
  }

  // Check glossary terms count
  const { count: termCount } = await supabase
    .from("glossary_terms")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((termCount || 0) >= 5) {
    // Check if Feynman was used recently
    notifications.push({
      id: "feynman-review",
      type: "suggestion",
      message: `${termCount}개 용어를 학습했어요. 파인만 모드로 복습해보세요!`,
      action: "/glossary",
    });
  }

  // Check diary streak
  const { data: lastDiary } = await supabase
    .from("diary_entries")
    .select("created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastDiary) {
    const daysSince = (now.getTime() - new Date(lastDiary.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 3) {
      notifications.push({
        id: "diary-reminder",
        type: "reminder",
        message: "학습 일기를 작성한 지 며칠 됐어요. 오늘의 학습을 돌아보세요!",
        action: "/diary",
      });
    }
  }

  // Business ideas without insights
  const { data: ideasWithout } = await supabase
    .from("business_ideas")
    .select("id, title, business_insights(count)")
    .eq("user_id", user.id)
    .neq("status", "paused");

  if (ideasWithout) {
    const noInsights = ideasWithout.filter((i) => {
      const cnt = (i.business_insights as unknown as { count: number }[])?.[0]?.count || 0;
      return cnt === 0;
    });
    if (noInsights.length > 0) {
      notifications.push({
        id: "business-insight",
        type: "suggestion",
        message: `"${noInsights[0].title}" 아이디어에 학습 인사이트를 연결해보세요!`,
        action: `/business/${noInsights[0].id}`,
      });
    }
  }

  return NextResponse.json({ notifications: notifications.slice(0, 5) });
}
