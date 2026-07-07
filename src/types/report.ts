export type ReportStatus = "DRAFT" | "SUBMITTED" | "LATE";

export interface ReportDTO {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  weekStartDate: string;
  weekEndDate: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string | null;
  hoursWorked: number | null;
  notes: string | null;
  status: ReportStatus;
  submittedAt: string | null;
}
