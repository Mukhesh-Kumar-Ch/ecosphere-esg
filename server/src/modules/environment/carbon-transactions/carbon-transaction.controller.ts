import type { Request, Response } from "express";
import { sendSuccess } from "../../../utils/response.js";
import {
  createCarbonTransactionRecord,
  getCarbonTransaction,
  listCarbonTransactions,
} from "./carbon-transaction.service.js";
import type { SourceType } from "@prisma/client";

export async function listCarbonTransactionsController(request: Request, response: Response) {
  const departmentId = request.query["departmentId"] as string | undefined;
  const sourceType = request.query["sourceType"] as SourceType | undefined;
  const emissionFactorId = request.query["emissionFactorId"] as string | undefined;

  const filters: any = {};
  if (departmentId) filters.departmentId = departmentId;
  if (sourceType) filters.sourceType = sourceType;
  if (emissionFactorId) filters.emissionFactorId = emissionFactorId;

  const carbonTransactions = await listCarbonTransactions(filters);

  return sendSuccess(response, "Carbon transactions retrieved successfully.", { carbonTransactions });
}

export async function getCarbonTransactionController(request: Request, response: Response) {
  const transactionId = request.params["id"] as string;
  const carbonTransaction = await getCarbonTransaction(transactionId);
  return sendSuccess(response, "Carbon transaction retrieved successfully.", { carbonTransaction });
}

export async function createCarbonTransactionController(request: Request, response: Response) {
  const userId = request.user!.id; // from authenticate middleware
  const carbonTransaction = await createCarbonTransactionRecord(request.body, userId);
  return sendSuccess(response, "Carbon transaction created successfully.", { carbonTransaction }, 201);
}
