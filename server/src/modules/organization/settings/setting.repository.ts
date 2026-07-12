import { prisma } from "../../../config/prisma.js";

const settingSelect = {
  id: true,
  key: true,
  value: true,
  description: true,
  updatedById: true,
  updatedAt: true,
  updatedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export function findSettings() {
  return prisma.setting.findMany({
    orderBy: [{ key: "asc" }],
    select: settingSelect,
  });
}

export function findSettingByKey(key: string) {
  return prisma.setting.findFirst({
    where: { key },
    select: settingSelect,
  });
}

export function upsertSetting(data: {
  key: string;
  value: string;
  description?: string | null;
  updatedById: string;
}) {
  const updateData: { value: string; updatedById: string; description?: string | null } = {
    value: data.value,
    updatedById: data.updatedById,
  };

  const createData: { key: string; value: string; updatedById: string; description?: string | null } = {
    key: data.key,
    value: data.value,
    updatedById: data.updatedById,
  };

  if (data.description !== undefined) {
    updateData.description = data.description;
    createData.description = data.description;
  }

  return prisma.setting.upsert({
    where: { key: data.key },
    update: updateData,
    create: createData,
    select: settingSelect,
  });
}