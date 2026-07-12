import { HttpError } from "../../../utils/http-error.js";
import {
  countActiveDepartmentUsers,
  createDepartment,
  findDepartmentByCode,
  findDepartments,
  findDepartmentById,
  findHeadUserById,
  softDeleteDepartment,
  updateDepartment,
} from "./department.repository.js";
import type { DepartmentInput, DepartmentUpdateInput } from "./department.types.js";

export async function listDepartments() {
  return findDepartments();
}

export async function getDepartment(id: string) {
  const department = await findDepartmentById(id);

  if (!department) {
    throw new HttpError(404, "Department not found.", "DEPARTMENT_NOT_FOUND");
  }

  return department;
}

export async function createDepartmentRecord(input: DepartmentInput) {
  const normalizedCode = input.code.trim();
  const existingDepartment = await findDepartmentByCode(normalizedCode);

  if (existingDepartment) {
    throw new HttpError(409, "Department code already exists.", "DEPARTMENT_CODE_EXISTS");
  }

  if (input.parentDepartmentId) {
    const parentDepartment = await findDepartmentById(input.parentDepartmentId);

    if (!parentDepartment) {
      throw new HttpError(404, "Parent department not found.", "PARENT_DEPARTMENT_NOT_FOUND");
    }
  }

  if (input.headUserId) {
    throw new HttpError(
      400,
      "Department head can only be assigned after the department exists.",
      "INVALID_DEPARTMENT_HEAD",
    );
  }

  const createData: Parameters<typeof createDepartment>[0] = {
    name: input.name.trim(),
    code: normalizedCode,
  };

  if (input.parentDepartmentId !== undefined) {
    createData.parentDepartmentId = input.parentDepartmentId;
  }

  if (input.status !== undefined) {
    createData.status = input.status;
  }

  return createDepartment(createData);
}

export async function updateDepartmentRecord(id: string, input: DepartmentUpdateInput) {
  const existingDepartment = await findDepartmentById(id);

  if (!existingDepartment) {
    throw new HttpError(404, "Department not found.", "DEPARTMENT_NOT_FOUND");
  }

  if (input.code) {
    const duplicateDepartment = await findDepartmentByCode(input.code.trim());

    if (duplicateDepartment && duplicateDepartment.id !== id) {
      throw new HttpError(409, "Department code already exists.", "DEPARTMENT_CODE_EXISTS");
    }
  }

  if (input.parentDepartmentId) {
    if (input.parentDepartmentId === id) {
      throw new HttpError(400, "A department cannot be its own parent.", "INVALID_PARENT_DEPARTMENT");
    }

    const parentDepartment = await findDepartmentById(input.parentDepartmentId);

    if (!parentDepartment) {
      throw new HttpError(404, "Parent department not found.", "PARENT_DEPARTMENT_NOT_FOUND");
    }
  }

  if (input.headUserId) {
    const headUser = await findHeadUserById(input.headUserId);

    if (!headUser) {
      throw new HttpError(404, "Department head user not found.", "HEAD_USER_NOT_FOUND");
    }

    if (headUser.departmentId !== id) {
      throw new HttpError(
        400,
        "Department head must belong to the same department.",
        "INVALID_DEPARTMENT_HEAD",
      );
    }
  }

  const updateData: Parameters<typeof updateDepartment>[1] = {};

  if (input.name !== undefined) {
    updateData.name = input.name.trim();
  }

  if (input.code !== undefined) {
    updateData.code = input.code.trim();
  }

  if (input.parentDepartmentId !== undefined) {
    updateData.parentDepartmentId = input.parentDepartmentId;
  }

  if (input.headUserId !== undefined) {
    updateData.headUserId = input.headUserId;
  }

  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  return updateDepartment(id, updateData);
}

export async function deleteDepartmentRecord(id: string) {
  const existingDepartment = await findDepartmentById(id);

  if (!existingDepartment) {
    throw new HttpError(404, "Department not found.", "DEPARTMENT_NOT_FOUND");
  }

  const employeeCount = await countActiveDepartmentUsers(id);

  if (employeeCount > 0) {
    throw new HttpError(409, "Departments with employees cannot be deleted.", "DEPARTMENT_IN_USE");
  }

  return softDeleteDepartment(id);
}