import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  {
    name: "Operations",
    code: "OPS",
    parentDepartmentCode: null,
    description: "Core operational teams that coordinate daily delivery and production workflows.",
  },
  {
    name: "Manufacturing",
    code: "MFG",
    parentDepartmentCode: "OPS",
    description: "Production and plant operations responsible for manufacturing output and efficiency.",
  },
  {
    name: "Sustainability",
    code: "SUS",
    parentDepartmentCode: null,
    description: "ESG leadership team responsible for emissions, goals, and sustainability programs.",
  },
  {
    name: "HR",
    code: "HR",
    parentDepartmentCode: null,
    description: "People operations team managing participation, policy awareness, and training.",
  },
  {
    name: "Finance",
    code: "FIN",
    parentDepartmentCode: null,
    description: "Financial control team supporting budgets, reporting, and approval workflows.",
  },
] as const;

const categories = [
  {
    name: "Community Volunteering",
    type: "CSR_ACTIVITY",
    description: "Used for employee volunteering and community impact activities.",
  },
  {
    name: "Wellness Initiative",
    type: "CSR_ACTIVITY",
    description: "Used for internal health, wellbeing, and engagement programs.",
  },
  {
    name: "Carbon Reduction Challenge",
    type: "CHALLENGE",
    description: "Used for team challenges focused on reducing emissions and resource use.",
  },
  {
    name: "Sustainable Commuting Challenge",
    type: "CHALLENGE",
    description: "Used for employee campaigns promoting greener commute choices.",
  },
  {
    name: "ESG Awareness Training",
    type: "TRAINING",
    description: "Used for formal ESG and sustainability training programs.",
  },
  {
    name: "Compliance Training",
    type: "TRAINING",
    description: "Used for policy, governance, and regulatory training content.",
  },
  {
    name: "General Engagement",
    type: "GENERAL",
    description: "Used for generic organization-wide engagement activities.",
  },
] as const;

const settings = [
  {
    key: "AUTO_EMISSION",
    value: "true",
    description: "Automatically create carbon transactions when qualifying activity occurs.",
  },
  {
    key: "EVIDENCE_REQUIRED",
    value: "true",
    description: "Require evidence files before CSR participation can be approved.",
  },
  {
    key: "BADGE_AUTO_AWARD",
    value: "true",
    description: "Grant badges automatically when unlock rules are satisfied.",
  },
  {
    key: "EMAIL_NOTIFICATIONS",
    value: "true",
    description: "Enable notification delivery for in-app workflow events.",
  },
  {
    key: "DEFAULT_ENV_WEIGHT",
    value: "40",
    description: "Default environmental score weight used in ESG calculations.",
  },
  {
    key: "DEFAULT_SOCIAL_WEIGHT",
    value: "30",
    description: "Default social score weight used in ESG calculations.",
  },
  {
    key: "DEFAULT_GOVERNANCE_WEIGHT",
    value: "30",
    description: "Default governance score weight used in ESG calculations.",
  },
] as const;

const roles = [
  {
    name: "Admin",
    description: "Full access to all administrative and configuration features.",
  },
  {
    name: "Employee",
    description: "Standard employee access for participation and self-service workflows.",
  },
  {
    name: "Department Head",
    description: "Departmental access for managing team activities and approvals.",
  },
  {
    name: "Asset Manager",
    description: "Access for managing company assets and tracking sustainability metrics.",
  },
] as const;

async function seedDepartments() {
  const createdDepartments = new Map<string, string>();

  for (const department of departments) {
    const parentDepartmentId = department.parentDepartmentCode
      ? createdDepartments.get(department.parentDepartmentCode) ?? null
      : null;

    const result = await prisma.department.upsert({
      where: { code: department.code },
      update: {
        name: department.name,
        parentDepartmentId,
        status: "ACTIVE",
        deletedAt: null,
      },
      create: {
        name: department.name,
        code: department.code,
        parentDepartmentId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    createdDepartments.set(department.code, result.id);
  }
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: category.type,
        },
      },
      update: {
        status: "ACTIVE",
      },
      create: {
        name: category.name,
        type: category.type,
        status: "ACTIVE",
      },
    });
  }
}

async function seedSettings() {
  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    });
  }
}

async function seedRoles() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: {
        name: role.name,
        description: role.description,
      },
    });
  }
}

async function seedAdministrator() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@ecosphere.local" },
    select: { id: true },
  });

  if (existingAdmin) {
    return;
  }

  const administratorRole = await prisma.role.findUnique({
    where: { name: "Admin" },
    select: { id: true },
  });

  if (!administratorRole) {
    throw new Error("Admin role is missing from the database seed.");
  }

  const operationsDepartment = await prisma.department.findFirst({
    where: {
      code: "OPS",
      deletedAt: null,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (!operationsDepartment) {
    throw new Error("Default administrator department is missing from the database seed.");
  }

  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@ecosphere.local",
      passwordHash,
      departmentId: operationsDepartment.id,
      roleId: administratorRole.id,
      status: "ACTIVE",
    },
  });
}

async function main() {
  console.log("🌱 Starting database seed...");

  await seedDepartments();
  console.log("✓ Departments seeded");

  await seedRoles();
  console.log("✓ Roles seeded");

  await seedCategories();
  console.log("✓ Categories seeded");

  await seedSettings();
  console.log("✓ Settings seeded");

  await seedAdministrator();
  console.log("✓ Administrator account seeded");

  console.log("🎉 Database seed completed successfully");
}

main()
  .catch((error) => {
    console.error("❌ Database seed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
