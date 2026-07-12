import { request } from "@/services/api";

export type ActivityStatus = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type ChallengeStatus = "DRAFT" | "ACTIVE" | "UNDER_REVIEW" | "COMPLETED" | "ARCHIVED";
export type RedemptionStatus = "PENDING" | "SUCCESS" | "FAILED";
export type TrainingStatus = "ASSIGNED" | "COMPLETED";

export interface CsrActivity {
  id: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  createdById: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    participants: number;
  };
  participants?: CsrParticipation[];
  createdAt: string;
}

export interface CsrParticipation {
  id: string;
  activityId: string;
  activity: CsrActivity;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  proofFile: string | null;
  approvalStatus: ApprovalStatus;
  completionDate: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface Challenge {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  title: string;
  description: string | null;
  difficulty: DifficultyLevel;
  xpReward: number;
  deadline: string;
  evidenceRequired: boolean;
  status: ChallengeStatus;
  _count?: {
    participants: number;
  };
  createdAt: string;
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  challenge: Challenge;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  progress: number;
  proofFile: string | null;
  approvalStatus: ApprovalStatus;
  completedAt: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  unlockRule: string;
  icon: string | null;
  status: string;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  badge: Badge;
  userId: string;
  awardedAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
  stock: number;
  status: string;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  reward: Reward;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  redeemedAt: string;
  status: RedemptionStatus;
}

export interface EmployeeTraining {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string | null;
  status: TrainingStatus;
  progress: number;
  completionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiversityMetric {
  id: string;
  category: string;
  label: string;
  value: string;
  updatedAt: string;
}

export interface SocialReport {
  csr: {
    totalActivities: number;
    activeActivities: number;
    totalParticipations: number;
    approvedParticipations: number;
    csrParticipationRate: number;
  };
  participation: {
    totalParticipations: number;
    approvedParticipations: number;
  };
  training: {
    totalTrainings: number;
    completedTrainings: number;
    trainingCompletionRate: number;
  };
  challenges: {
    totalChallenges: number;
    activeChallenges: number;
    totalChallengeParticipations: number;
    completedChallengeParticipations: number;
    challengeCompletionRate: number;
  };
  xp: {
    totalXpAwarded: number;
  };
  rewards: {
    totalRedemptions: number;
    availableStock: number;
  };
  diversity: DiversityMetric[];
  socialScore: number;
}

export const socialApi = {
  // CSR Activities
  getActivities(filters?: {
    search?: string;
    status?: ActivityStatus;
    departmentId?: string;
    categoryId?: string;
  }): Promise<{ activities: CsrActivity[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.departmentId) params.set("departmentId", filters.departmentId);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ activities: CsrActivity[] }>(`/csr/activities${query}`);
  },

  getActivityById(id: string): Promise<{ activity: CsrActivity }> {
    return request<{ activity: CsrActivity }>(`/csr/activities/${id}`);
  },

  createActivity(input: {
    title: string;
    description?: string | null;
    departmentId: string;
    categoryId: string;
    startDate: string;
    endDate: string;
    status?: ActivityStatus;
  }): Promise<{ activity: CsrActivity }> {
    return request<{ activity: CsrActivity }>("/csr/activities", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateActivity(id: string, input: Partial<{
    title: string;
    description: string | null;
    departmentId: string;
    categoryId: string;
    startDate: string;
    endDate: string;
    status: ActivityStatus;
  }>): Promise<{ activity: CsrActivity }> {
    return request<{ activity: CsrActivity }>(`/csr/activities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteActivity(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/csr/activities/${id}`, {
      method: "DELETE",
    });
  },

  joinActivity(id: string): Promise<{ participation: CsrParticipation }> {
    return request<{ participation: CsrParticipation }>(`/csr/activities/${id}/join`, {
      method: "POST",
    });
  },

  submitProof(id: string, proofFile: string): Promise<{ participation: CsrParticipation }> {
    return request<{ participation: CsrParticipation }>(`/csr/activities/${id}/proof`, {
      method: "POST",
      body: JSON.stringify({ proofFile }),
    });
  },

  getParticipations(filters?: {
    userId?: string;
    activityId?: string;
    approvalStatus?: ApprovalStatus;
  }): Promise<{ participations: CsrParticipation[] }> {
    const params = new URLSearchParams();
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.activityId) params.set("activityId", filters.activityId);
    if (filters?.approvalStatus) params.set("approvalStatus", filters.approvalStatus);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ participations: CsrParticipation[] }>(`/csr/participations${query}`);
  },

  approveParticipation(id: string, approvalStatus: ApprovalStatus): Promise<{ participation: CsrParticipation }> {
    return request<{ participation: CsrParticipation }>(`/csr/activities/participations/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ approvalStatus }),
    });
  },

  // Challenges
  getChallenges(filters?: {
    search?: string;
    status?: ChallengeStatus;
    categoryId?: string;
  }): Promise<{ challenges: Challenge[] }> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ challenges: Challenge[] }>(`/challenges${query}`);
  },

  getChallengeById(id: string): Promise<{ challenge: Challenge }> {
    return request<{ challenge: Challenge }>(`/challenges/${id}`);
  },

  createChallenge(input: {
    title: string;
    description?: string | null;
    categoryId: string;
    difficulty: DifficultyLevel;
    xpReward: number;
    deadline: string;
    evidenceRequired?: boolean;
    status?: ChallengeStatus;
  }): Promise<{ challenge: Challenge }> {
    return request<{ challenge: Challenge }>("/challenges", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateChallenge(id: string, input: Partial<{
    title: string;
    description: string | null;
    categoryId: string;
    difficulty: DifficultyLevel;
    xpReward: number;
    deadline: string;
    evidenceRequired: boolean;
    status: ChallengeStatus;
  }>): Promise<{ challenge: Challenge }> {
    return request<{ challenge: Challenge }>(`/challenges/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteChallenge(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/challenges/${id}`, {
      method: "DELETE",
    });
  },

  joinChallenge(id: string): Promise<{ participation: ChallengeParticipation }> {
    return request<{ participation: ChallengeParticipation }>(`/challenges/${id}/join`, {
      method: "POST",
    });
  },

  updateChallengeProgress(id: string, progress: number, proofFile?: string): Promise<{ participation: ChallengeParticipation }> {
    return request<{ participation: ChallengeParticipation }>(`/challenges/${id}/progress`, {
      method: "POST",
      body: JSON.stringify({ progress, proofFile }),
    });
  },

  getChallengeParticipations(filters?: {
    userId?: string;
    challengeId?: string;
    approvalStatus?: ApprovalStatus;
  }): Promise<{ participations: ChallengeParticipation[] }> {
    const params = new URLSearchParams();
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.challengeId) params.set("challengeId", filters.challengeId);
    if (filters?.approvalStatus) params.set("approvalStatus", filters.approvalStatus);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ participations: ChallengeParticipation[] }>(`/challenges/participations/all${query}`);
  },

  approveChallengeParticipation(id: string, approvalStatus: ApprovalStatus): Promise<{ participation: ChallengeParticipation }> {
    return request<{ participation: ChallengeParticipation }>(`/challenges/participations/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ approvalStatus }),
    });
  },

  // Gamification & Rewards
  getBadges(): Promise<{ badges: Badge[] }> {
    return request<{ badges: Badge[] }>("/gamification/badges");
  },

  getMyBadges(): Promise<{ badges: UserBadge[] }> {
    return request<{ badges: UserBadge[] }>("/gamification/my-badges");
  },

  getMyXp(): Promise<{ balance: number; history: any[] }> {
    return request<{ balance: number; history: any[] }>("/gamification/my-xp");
  },

  getRewards(): Promise<{ rewards: Reward[] }> {
    return request<{ rewards: Reward[] }>("/gamification/rewards");
  },

  createReward(input: {
    name: string;
    description?: string | null;
    pointsRequired: number;
    stock: number;
  }): Promise<{ reward: Reward }> {
    return request<{ reward: Reward }>("/gamification/rewards", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateReward(id: string, input: Partial<{
    name: string;
    description: string | null;
    pointsRequired: number;
    stock: number;
    status: string;
  }>): Promise<{ reward: Reward }> {
    return request<{ reward: Reward }>(`/gamification/rewards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteReward(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/gamification/rewards/${id}`, {
      method: "DELETE",
    });
  },

  redeemReward(id: string): Promise<{ redemption: RewardRedemption }> {
    return request<{ redemption: RewardRedemption }>(`/gamification/rewards/${id}/redeem`, {
      method: "POST",
    });
  },

  getRedemptions(): Promise<{ redemptions: RewardRedemption[] }> {
    return request<{ redemptions: RewardRedemption[] }>("/gamification/redemptions");
  },

  getLeaderboard(): Promise<{ leaderboard: any[] }> {
    return request<{ leaderboard: any[] }>("/gamification/leaderboard");
  },

  // Diversity Metrics
  getDiversityMetrics(): Promise<{ metrics: DiversityMetric[] }> {
    return request<{ metrics: DiversityMetric[] }>("/diversity");
  },

  setDiversityMetric(input: {
    category: string;
    label: string;
    value: number;
  }): Promise<{ metric: DiversityMetric }> {
    return request<{ metric: DiversityMetric }>("/diversity", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteDiversityMetric(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/diversity/${id}`, {
      method: "DELETE",
    });
  },

  // Trainings
  getTrainings(filters?: { userId?: string; status?: TrainingStatus }): Promise<{ trainings: EmployeeTraining[] }> {
    const params = new URLSearchParams();
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.status) params.set("status", filters.status);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ trainings: EmployeeTraining[] }>(`/training${query}`);
  },

  createTraining(input: { userId: string; title: string; description?: string | null }): Promise<{ training: EmployeeTraining }> {
    return request<{ training: EmployeeTraining }>("/training", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateTrainingProgress(id: string, progress: number): Promise<{ training: EmployeeTraining }> {
    return request<{ training: EmployeeTraining }>(`/training/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ progress }),
    });
  },

  deleteTraining(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/training/${id}`, {
      method: "DELETE",
    });
  },

  // Reports
  getSocialReport(): Promise<SocialReport> {
    return request<SocialReport>("/social");
  },
};
export default socialApi;
