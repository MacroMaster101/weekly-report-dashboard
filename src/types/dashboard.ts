export interface SummaryCards {
  submittedThisWeek: number;
  complianceRate: number;
  openBlockers: number;
  pendingReports: number;
}

export interface TasksTrendPoint {
  week: string;
  reports: number;
}

export interface SubmissionStatusPoint {
  member: string;
  submitted: number;
  pending: number;
  late: number;
}

export interface ProjectDistributionPoint {
  project: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  userName: string;
  projectName: string;
  status: string;
  submittedAt: string | null;
}

export interface DashboardData {
  summary: SummaryCards;
  tasksTrend: TasksTrendPoint[];
  submissionStatus: SubmissionStatusPoint[];
  projectDistribution: ProjectDistributionPoint[];
  recentActivity: ActivityItem[];
}
