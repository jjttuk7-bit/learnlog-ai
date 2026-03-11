"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // If user doesn't exist, try sign up
      if (error.message.includes("Invalid login")) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          toast.error(signUpError.message);
          setLoading(false);
          return;
        }
        // If email confirmation is off, user is auto-logged in
        if (data.session) {
          toast.success("가입 완료!");
          router.push("/");
          router.refresh();
          return;
        }
        toast.success("가입 완료! 이메일을 확인해주세요.");
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">🧠 LearnLog AI</h1>
          <p className="text-slate-400 mt-2 text-sm">
            던지면 AI가 정리하고, AI가 물으면 내가 성장한다
          </p>
        </div>
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인 / 가입"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-2 text-slate-500">또는</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          Google로 로그인
        </Button>
      </div>
    </div>
  );
}
