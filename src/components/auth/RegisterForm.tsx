"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { z } from "zod";
import { registerSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const clientRegisterSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "TEAM_MEMBER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);

  // Real-time inline validation as the user types
  const handleInputChange = (field: string, value: string) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);

    if (value === "") {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
      return;
    }

    const parsed = clientRegisterSchema.safeParse(nextForm);
    if (parsed.success) {
      setErrors({});
    } else {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const pathKey = err.path[0]?.toString();
        if (pathKey) {
          fieldErrors[pathKey] = err.message;
        }
      });
      // Update only the error for the field being edited
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field] || "",
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");

    const parsed = clientRegisterSchema.safeParse(form);
    if (!parsed.success) {
      setLoading(false);
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.error && typeof data.error === "object") {
        const backendErrors: Record<string, string> = {};
        Object.entries(data.error).forEach(([key, val]) => {
          if (Array.isArray(val) && val[0]) {
            backendErrors[key] = val[0];
          } else if (typeof val === "string") {
            backendErrors[key] = val;
          }
        });
        setErrors(backendErrors);
      } else {
        setGeneralError(typeof data.error === "string" ? data.error : "Registration failed");
      }
      return;
    }
    if (form.role !== "TEAM_MEMBER") {
      // Manager/Admin accounts need approval before they can sign in — hold
      // on this page instead of redirecting straight to a login that will fail.
      setPendingNotice(true);
      return;
    }
    router.push("/login");
  }

  if (pendingNotice) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--status-pending-fg)]/30 bg-[var(--status-pending-bg)] p-5 text-sm">
        <p className="font-bold text-[var(--status-pending-fg)]">Account request submitted</p>
        <p className="text-[var(--status-pending-fg)]/90 leading-relaxed">
          Your account has been created but needs approval from an existing admin before you can sign in, since you requested elevated access. You&apos;ll be able to log in once an admin approves the request.
        </p>
        <Button variant="secondary" onClick={() => router.push("/login")} className="w-fit">
          Back to login
        </Button>
      </div>
    );
  }

  // Evaluate password rules live for visual checklist
  const passwordRules = [
    { label: "8+ characters", met: form.password.length >= 8 },
    { label: "Lowercase letter", met: /[a-z]/.test(form.password) },
    { label: "Uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "Number digit", met: /[0-9]/.test(form.password) },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => handleInputChange("name", e.target.value)}
        error={errors.name}
        required
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        error={errors.email}
        required
      />
      <div className="flex flex-col gap-1.5 w-full">
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={errors.password}
          required
        />
        {form.password.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-1 px-1">
            {passwordRules.map((req) => (
              <div key={req.label} className="flex items-center gap-1.5 text-[10px] font-bold">
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                    req.met ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-faint"
                  }`}
                />
                <span className={req.met ? "text-emerald-500 transition-colors" : "text-faint"}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Input
        label="Confirm Password"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        required
      />
      <Select
        label="Role"
        value={form.role}
        onChange={(e) => handleInputChange("role", e.target.value)}
        error={errors.role}
      >
        <option value="TEAM_MEMBER">Team Member</option>
        <option value="MANAGER">Manager</option>
        <option value="ADMIN">Admin</option>
      </Select>
      {generalError && (
        <p className="rounded-xl bg-[var(--status-late-bg)] px-3.5 py-2.5 text-xs font-bold text-[var(--status-late-fg)] border border-transparent shadow-[var(--shadow-sm)]">
          {generalError}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full mt-2">
        <UserPlus size={16} />
        {loading ? "Creating..." : "Register"}
      </Button>
    </form>
  );
}
