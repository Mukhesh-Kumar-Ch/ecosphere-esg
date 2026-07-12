import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response.js";
import {
  createDepartmentRecord,
  deleteDepartmentRecord,
  getDepartment,
  listDepartments,
  updateDepartmentRecord,
} from "./department.service.js";

export async function listDepartmentsController(_request: Request, response: Response) {
  const departments = await listDepartments();

  return sendSuccess(response, "Departments retrieved successfully.", { departments });
}

export async function getDepartmentController(request: Request, response: Response) {
  const departmentId = request.params["id"] as string;
  const department = await getDepartment(departmentId);

  return sendSuccess(response, "Department retrieved successfully.", { department });
}

export async function createDepartmentController(request: Request, response: Response) {
  const department = await createDepartmentRecord(request.body);

  return sendSuccess(response, "Department created successfully.", { department }, 201);
}

export async function updateDepartmentController(request: Request, response: Response) {
  const departmentId = request.params["id"] as string;
  const department = await updateDepartmentRecord(departmentId, request.body);

  return sendSuccess(response, "Department updated successfully.", { department });
}

export async function deleteDepartmentController(request: Request, response: Response) {
  const departmentId = request.params["id"] as string;
  const department = await deleteDepartmentRecord(departmentId);

  return sendSuccess(response, "Department deleted successfully.", { department });
}