import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["TEAM_MEMBER", "MANAGER", "ADMIN"]).default("TEAM_MEMBER"),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const reportSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  weekStartDate: z.string().trim().min(1, "Week start date is required"),
  weekEndDate: z.string().trim().min(1, "Week end date is required"),
  tasksCompleted: z.string().trim().min(1, "Tasks completed is required"),
  tasksPlanned: z.string().trim().min(1, "Tasks planned is required"),
  blockers: optionalText,
  hoursWorked: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0).optional(),
  ),
  notes: optionalText,
}).refine((data) => new Date(data.weekStartDate) <= new Date(data.weekEndDate), {
  path: ["weekEndDate"],
  message: "Week end date must be after the start date",
});

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: optionalText,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;