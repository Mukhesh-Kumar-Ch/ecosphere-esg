import { HttpError } from "../../../utils/http-error.js";
import { findDepartmentById } from "../../organization/departments/department.repository.js";
import { findEmissionFactorById } from "../emission-factors/emission-factor.repository.js";
import {
  createCarbonTransaction,
  findCarbonTransactionById,
  findCarbonTransactions,
} from "./carbon-transaction.repository.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import type { CarbonTransactionInput } from "./carbon-transaction.types.js";
import type { SourceType } from "@prisma/client";

export async function listCarbonTransactions(filters?: {
  departmentId?: string;
  sourceType?: SourceType;
  emissionFactorId?: string;
}) {
  return findCarbonTransactions(filters);
}

export async function getCarbonTransaction(id: string) {
  const transaction = await findCarbonTransactionById(id);

  if (!transaction) {
    throw new HttpError(404, "Carbon transaction not found.", "TRANSACTION_NOT_FOUND");
  }

  return transaction;
}

export async function createCarbonTransactionRecord(input: CarbonTransactionInput, userId: string) {
  // Validate department exists
  const dept = await findDepartmentById(input.departmentId);
  if (!dept) {
    throw new HttpError(404, "Department not found.", "DEPARTMENT_NOT_FOUND");
  }

  // Validate emission factor exists and is active
  const factorRecord = await findEmissionFactorById(input.emissionFactorId);
  if (!factorRecord) {
    throw new HttpError(404, "Emission factor not found.", "EMISSION_FACTOR_NOT_FOUND");
  }

  if (factorRecord.status !== "ACTIVE") {
    throw new HttpError(400, "Selected emission factor is inactive.", "EMISSION_FACTOR_INACTIVE");
  }

  // Calculate emissions: Quantity × Emission Factor (BR-ENV-002)
  const factorValue = Number(factorRecord.factor);
  const calculatedEmission = input.quantity * factorValue;

  const transaction = await createCarbonTransaction({
    departmentId: input.departmentId,
    emissionFactorId: input.emissionFactorId,
    sourceType: input.sourceType,
    referenceNumber: input.referenceNumber ?? null,
    quantity: input.quantity,
    calculatedEmission,
    createdById: userId,
    transactionDate: new Date(input.transactionDate),
  });

  // Activity Log (BR-006: every create operation must generate an Activity Log)
  // Using DEPARTMENT entity type since carbon transactions belong to a department
  await ActivityLogService.log(
    userId,
    "DEPARTMENT",
    transaction.departmentId,
    "CREATE",
    null,
    {
      transactionId: transaction.id,
      sourceType: transaction.sourceType,
      quantity: Number(transaction.quantity),
      calculatedEmission: Number(transaction.calculatedEmission),
    }
  );

  // Notify the department creator that a carbon transaction has been recorded (BR-NOT-001)
  await NotificationService.create(
    userId,
    "Carbon Transaction Recorded",
    `A new carbon transaction has been recorded for ${dept.name}: ${Number(calculatedEmission).toFixed(2)} kg CO₂ (${input.sourceType}).`,
    "SYSTEM"
  );

  return transaction;
}
