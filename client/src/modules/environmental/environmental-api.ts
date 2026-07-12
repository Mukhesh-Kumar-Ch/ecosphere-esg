import { request } from "@/services/api";

export type Status = "ACTIVE" | "INACTIVE";
export type GoalStatus = "ACTIVE" | "COMPLETED";
export type SourceType = "PURCHASE" | "MANUFACTURING" | "EXPENSE" | "FLEET" | "MANUAL";

export type EmissionFactor = {
  id: string;
  name: string;
  source: string;
  unit: string;
  factor: string; // Decimal is returned as string from Prisma
  description: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

export type EnvironmentalGoal = {
  id: string;
  departmentId: string;
  department: { id: string; name: string; code: string };
  title: string;
  description: string | null;
  targetValue: string;
  deadline: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type CarbonTransaction = {
  id: string;
  departmentId: string;
  department: { id: string; name: string; code: string };
  emissionFactorId: string;
  emissionFactor: { id: string; name: string; source: string; unit: string; factor: string };
  sourceType: SourceType;
  referenceNumber: string | null;
  quantity: string;
  calculatedEmission: string;
  createdById: string;
  creator: { id: string; name: string; email: string };
  transactionDate: string;
  createdAt: string;
};

export type EnvironmentalReport = {
  summary: {
    totalEmissions: number;
    todayEmissions: number;
    monthlyEmissions: number;
  };
  charts: {
    monthlyEmissionsTrend: { name: string; emissions: number }[];
    departmentComparison: { name: string; code: string; emissions: number }[];
  };
  goalProgress: {
    id: string;
    title: string;
    departmentName: string;
    targetValue: number;
    currentEmissions: number;
    progress: number;
    deadline: string;
    status: GoalStatus;
  }[];
  departmentTracking: {
    id: string;
    name: string;
    code: string;
    totalEmissions: number;
    completedGoalsCount: number;
    totalGoalsCount: number;
    trend: number;
  }[];
};

export type EmissionFactorInput = {
  name: string;
  source: string;
  unit: string;
  factor: number;
  description?: string | null;
  status?: Status;
};

export type EnvironmentalGoalInput = {
  departmentId: string;
  title: string;
  targetValue: number;
  deadline: string;
  description?: string | null;
  status?: GoalStatus;
};

export type CarbonTransactionInput = {
  departmentId: string;
  emissionFactorId: string;
  sourceType: SourceType;
  referenceNumber?: string | null;
  quantity: number;
  transactionDate: string;
};

export const environmentalApi = {
  getEmissionFactors: () => request<{ emissionFactors: EmissionFactor[] }>("/emission-factors"),
  createEmissionFactor: (input: EmissionFactorInput) =>
    request<{ emissionFactor: EmissionFactor }>("/emission-factors", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateEmissionFactor: (id: string, input: Partial<EmissionFactorInput>) =>
    request<{ emissionFactor: EmissionFactor }>(`/emission-factors/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteEmissionFactor: (id: string) =>
    request<{ emissionFactor: EmissionFactor }>(`/emission-factors/${id}`, {
      method: "DELETE",
    }),

  getEnvironmentalGoals: () => request<{ environmentalGoals: EnvironmentalGoal[] }>("/environmental-goals"),
  createEnvironmentalGoal: (input: EnvironmentalGoalInput) =>
    request<{ environmentalGoal: EnvironmentalGoal }>("/environmental-goals", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateEnvironmentalGoal: (id: string, input: Partial<EnvironmentalGoalInput>) =>
    request<{ environmentalGoal: EnvironmentalGoal }>(`/environmental-goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteEnvironmentalGoal: (id: string) =>
    request<{ environmentalGoal: EnvironmentalGoal }>(`/environmental-goals/${id}`, {
      method: "DELETE",
    }),

  getCarbonTransactions: (filters?: { departmentId?: string; sourceType?: SourceType; emissionFactorId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.departmentId) params.append("departmentId", filters.departmentId);
    if (filters?.sourceType) params.append("sourceType", filters.sourceType);
    if (filters?.emissionFactorId) params.append("emissionFactorId", filters.emissionFactorId);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<{ carbonTransactions: CarbonTransaction[] }>(`/carbon-transactions${query}`);
  },
  createCarbonTransaction: (input: CarbonTransactionInput) =>
    request<{ carbonTransaction: CarbonTransaction }>("/carbon-transactions", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getEnvironmentReport: () => request<EnvironmentalReport>("/reports/environment"),
};
