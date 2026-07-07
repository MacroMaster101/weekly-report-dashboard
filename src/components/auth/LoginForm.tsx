"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      if (res.error === "PendingApproval") {
        setError("Your account is awaiting admin approval before you can sign in.");
      } else if (res.error === "AccessRejected") {
        setError("Your account request was not approved. Contact an admin for details.");
      } else {
        setError("Invalid email or password");
      }
      return;
    }
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    router.push(role === "TEAM_MEMBER" ? "/member/reports" : "/manager/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="rounded-lg bg-[var(--status-late-bg)] px-3 py-2 text-sm font-medium text-[var(--status-late-fg)]">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        <LogIn size={16} />
        {loading ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}
