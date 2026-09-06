export interface Comment {
  id: string;
  text: string;
  userName: string;
  status: 'Allowed' | "Blocked";
  timestamp: Date;
  blockedBy?: string;
  blockedAt?: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  avatar?: string;
}

export interface DashboardStats {
  totalComments: number;
  blockedComments: number;
  blockedPercentage: number;
  blockedLast5: number;
  totalLast5: number;
  latestBlocked: Comment[];
}
