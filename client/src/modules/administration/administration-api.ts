import { request } from "@/services/api";

export type DepartmentStatus = "ACTIVE" | "INACTIVE";
export type CategoryStatus = "ACTIVE" | "INACTIVE";
export type CategoryType = "CSR_ACTIVITY" | "CHALLENGE" | "TRAINING" | "GENERAL";

export type Department = {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  headUserId: string | null;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parentDepartment?: { id: string; name: string; code: string } | null;
  headUser?: { id: string; name: string; email: string; departmentId: string } | null;
};

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
};

export type Setting = {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedById: string | null;
  updatedAt: string;
  updatedBy?: { id: string; name: string; email: string } | null;
};

type ListResponse<T> = { [key: string]: T[] };

export type DepartmentInput = {
  name: string;
  code: string;
  parentDepartmentId?: string | null;
  status?: DepartmentStatus;
};

export type DepartmentUpdateInput = Partial<DepartmentInput>;

export type CategoryInput = {
  name: string;
  type: CategoryType;
  status?: CategoryStatus;
};

export type CategoryUpdateInput = Partial<CategoryInput>;

export type SettingInput = {
  key: string;
  value: string;
  description?: string | null;
};

export const administrationApi = {
  getDepartments: () => request<{ departments: Department[] }>("/departments"),
  createDepartment: (input: DepartmentInput) =>
    request<{ department: Department }>("/departments", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateDepartment: (id: string, input: DepartmentUpdateInput) =>
    request<{ department: Department }>(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteDepartment: (id: string) =>
    request<{ department: Department }>(`/departments/${id}`, {
      method: "DELETE",
    }),

  getCategories: () => request<{ categories: Category[] }>("/categories"),
  createCategory: (input: CategoryInput) =>
    request<{ category: Category }>("/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateCategory: (id: string, input: CategoryUpdateInput) =>
    request<{ category: Category }>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteCategory: (id: string) =>
    request<{ category: Category }>(`/categories/${id}`, {
      method: "DELETE",
    }),

  getSettings: () => request<{ settings: Setting[] }>("/settings"),
  updateSettings: (settings: SettingInput[]) =>
    request<{ settings: Setting[] }>("/settings", {
      method: "PATCH",
      body: JSON.stringify({ settings }),
    }),
};