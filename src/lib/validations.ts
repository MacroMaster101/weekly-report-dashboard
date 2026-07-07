import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["TEAM_MEMBER", "MANAGER", "ADMIN"]).default("TEAM_MEMBER"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const reportSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  weekStartDate: z.string().min(1, "Week start date is required"),
  weekEndDate: z.string().min(1, "Week end date is required"),
  tasksCompleted: z.string().min(1, "Tasks completed is required"),
  tasksPlanned: z.string().min(1, "Tasks planned is required"),
  blockers: z.string().optional(),
  hoursWorked: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0).optional(),
  ),
  notes: z.string().optional(),
}).refine((data) => new Date(data.weekStartDate) <= new Date(data.weekEndDate), {
  // Cross-field check must live in .refine (top-level z.object fields can't see each other).
  path: ["weekEndDate"],
  message: "Week end date must be after the start date",
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
