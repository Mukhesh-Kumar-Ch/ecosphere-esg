import { PolicyRepository } from "./policy.repository.js";
import { ActivityLogService } from "../../shared/activity-logs/activity-log.service.js";
import { NotificationService } from "../../shared/notifications/notification.service.js";
import type { CreatePolicyInput, UpdatePolicyInput, PolicyFilter } from "./policy.types.js";
import type { PolicyStatus } from "@prisma/client";

export class PolicyService {
  static async getPolicies(filters: PolicyFilter) {
    return PolicyRepository.getPolicies(filters);
  }

  static async getPolicyById(id: string) {
    const policy = await PolicyRepository.getPolicyById(id);
    if (!policy) {
      throw new Error(`Policy with ID ${id} not found.`);
    }
    return policy;
  }

  static async createPolicy(input: CreatePolicyInput, userId: string) {
    // Check if title + version already exists
    const existing = await PolicyRepository.getPolicyByTitleAndVersion(input.title, input.version);
    if (existing) {
      throw new Error(`A policy with version ${input.version} for title "${input.title}" already exists.`);
    }

    const policy = await PolicyRepository.createPolicy({
      title: input.title,
      description: input.description || null,
      version: input.version,
      effectiveDate: new Date(input.effectiveDate),
      status: input.status ?? "ACTIVE",
      createdById: userId,
    });

    await ActivityLogService.log(
      userId,
      "POLICY",
      policy.id,
      "CREATE",
      null,
      policy
    );

    return policy;
  }

  static async updatePolicy(id: string, input: UpdatePolicyInput, userId: string) {
    const existing = await PolicyRepository.getPolicyById(id);
    if (!existing) {
      throw new Error(`Policy with ID ${id} not found.`);
    }

    // Published policies cannot be modified
    // If not in DRAFT status, we cannot change title, description, version, or effectiveDate
    const isPublished = existing.status === "ACTIVE" || existing.status === "ARCHIVED";
    const hasDetailChanges =
      (input.title !== undefined && input.title !== existing.title) ||
      (input.description !== undefined && input.description !== existing.description) ||
      (input.version !== undefined && input.version !== existing.version) ||
      (input.effectiveDate !== undefined &&
        new Date(input.effectiveDate).getTime() !== new Date(existing.effectiveDate).getTime());

    if (isPublished && hasDetailChanges) {
      throw new Error("Published policies cannot be modified. Create a new version instead.");
    }

    // Check version uniqueness if title or version changed
    const targetTitle = input.title ?? existing.title;
    const targetVersion = input.version ?? existing.version;
    if (targetTitle !== existing.title || targetVersion !== existing.version) {
      const duplicate = await PolicyRepository.getPolicyByTitleAndVersion(targetTitle, targetVersion);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`A policy with version ${targetVersion} for title "${targetTitle}" already exists.`);
      }
    }

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.version !== undefined) data.version = input.version;
    if (input.effectiveDate !== undefined) data.effectiveDate = new Date(input.effectiveDate);
    if (input.status !== undefined) data.status = input.status;

    const updated = await PolicyRepository.updatePolicy(id, data);

    // If policy is updated (details or status changed), clear previous acknowledgements
    // "When Policy is updated, Automatically: Previous acknowledgements become outdated, Employees must acknowledge the new version."
    await PolicyRepository.deleteAcknowledgementsForPolicy(id);

    await ActivityLogService.log(
      userId,
      "POLICY",
      id,
      "UPDATE",
      existing,
      updated
    );

    return updated;
  }

  static async deletePolicy(id: string, userId: string) {
    const existing = await PolicyRepository.getPolicyById(id);
    if (!existing) {
      throw new Error(`Policy with ID ${id} not found.`);
    }

    await PolicyRepository.deletePolicy(id);

    await ActivityLogService.log(
      userId,
      "POLICY",
      id,
      "DELETE",
      existing,
      null
    );

    return { success: true };
  }

  static async acknowledgePolicy(policyId: string, userId: string) {
    const policy = await PolicyRepository.getPolicyById(policyId);
    if (!policy) {
      throw new Error(`Policy with ID ${policyId} not found.`);
    }

    if (policy.status !== "ACTIVE") {
      throw new Error("Only active policies can be acknowledged.");
    }

    // Employee cannot acknowledge the same version twice
    const existingAck = await PolicyRepository.getAcknowledgement(policyId, userId);
    if (existingAck) {
      throw new Error("You have already acknowledged this version of the policy.");
    }

    const ack = await PolicyRepository.createAcknowledgement(policyId, userId);

    await ActivityLogService.log(
      userId,
      "POLICY",
      policyId,
      "APPROVE",
      null,
      ack
    );

    // Notify employee that their acknowledgement was recorded (BR-NOT-001)
    await NotificationService.create(
      userId,
      `Policy Acknowledged: ${policy.title}`,
      `You have successfully acknowledged the policy "${policy.title}" (version ${policy.version}).`,
      "POLICY"
    );

    return ack;
  }

  static async getAcknowledgementsByUser(userId: string) {
    return PolicyRepository.getAcknowledgementsByUser(userId);
  }
}
export default PolicyService;
