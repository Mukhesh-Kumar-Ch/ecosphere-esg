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

const emissionFactors = [
  {
    name: "Diesel",
    source: "EPA 2024",
    unit: "L",
    factor: 2.6800,
    description: "Diesel fuel emissions per liter.",
  },
  {
    name: "Electricity",
    source: "eGRID 2024",
    unit: "kWh",
    factor: 0.8200,
    description: "Grid electricity emissions per kilowatt-hour.",
  },
  {
    name: "Natural Gas",
    source: "EPA 2024",
    unit: "m³",
    factor: 1.8840,
    description: "Natural gas emissions per cubic meter.",
  },
  {
    name: "Petrol",
    source: "EPA 2024",
    unit: "L",
    factor: 2.3100,
    description: "Petrol/Gasoline fuel emissions per liter.",
  },
  {
    name: "Water Supply",
    source: "DEFRA 2024",
    unit: "m³",
    factor: 0.3440,
    description: "Water supply emissions per cubic meter (delivery & treatment).",
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

async function seedEmissionFactors() {
  for (const factor of emissionFactors) {
    const existing = await prisma.emissionFactor.findFirst({
      where: { name: factor.name },
    });

    if (existing) {
      await prisma.emissionFactor.update({
        where: { id: existing.id },
        data: {
          source: factor.source,
          unit: factor.unit,
          factor: factor.factor,
          description: factor.description,
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.emissionFactor.create({
        data: {
          name: factor.name,
          source: factor.source,
          unit: factor.unit,
          factor: factor.factor,
          description: factor.description,
          status: "ACTIVE",
        },
      });
    }
  }
}

async function seedSocial() {
  // Badges
  const badges = [
    { name: "Eco-Warrior", description: "Participated in 5 or more approved CSR activities.", unlockRule: "approvedCsrCount >= 5" },
    { name: "First Steps", description: "Completed 1 sustainability challenge.", unlockRule: "approvedChallengeCount >= 1" },
    { name: "Training Scholar", description: "Completed all assigned ESG training.", unlockRule: "completedTrainingsCount === totalTrainingsCount" },
  ];
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: { description: b.description, unlockRule: b.unlockRule },
      create: { name: b.name, description: b.description, unlockRule: b.unlockRule, status: "ACTIVE" },
    });
  }

  // Rewards
  const rewards = [
    { name: "Reusable Water Bottle", description: "Stainless steel eco-friendly bottle.", pointsRequired: 150, stock: 50 },
    { name: "Organic Cotton Tote", description: "Eco-friendly bag for grocery shopping.", pointsRequired: 100, stock: 100 },
    { name: "Sustainability eBook", description: "Entertaining guide to sustainable living.", pointsRequired: 50, stock: 999 },
  ];
  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { name: r.name },
      update: { description: r.description, pointsRequired: r.pointsRequired, stock: r.stock },
      create: { name: r.name, description: r.description, pointsRequired: r.pointsRequired, stock: r.stock, status: "ACTIVE" },
    });
  }

  // Diversity
  const diversity = [
    { category: "Gender Balance", label: "Female", value: 45.0 },
    { category: "Gender Balance", label: "Male", value: 52.0 },
    { category: "Gender Balance", label: "Non-binary", value: 3.0 },
    { category: "Age Distribution", label: "Under 30", value: 30.0 },
    { category: "Age Distribution", label: "30-49", value: 55.0 },
    { category: "Age Distribution", label: "50+", value: 15.0 },
  ];
  for (const d of diversity) {
    await prisma.diversityMetric.upsert({
      where: { category_label: { category: d.category, label: d.label } },
      update: { value: d.value },
      create: { category: d.category, label: d.label, value: d.value },
    });
  }
}

async function seedDemoData() {
  console.log("🌱 Starting demo data seed...");

  // Fetch dependencies
  const allRoles = await prisma.role.findMany();
  const allDepts = await prisma.department.findMany();
  const allFactors = await prisma.emissionFactor.findMany();
  const allCats = await prisma.category.findMany();

  const roleMap = new Map(allRoles.map((r) => [r.name, r.id]));
  const deptMap = new Map(allDepts.map((d) => [d.code, d.id]));
  const factorMap = new Map(allFactors.map((f) => [f.name, f]));
  const catMap = new Map(allCats.map((c) => [`${c.name}_${c.type}`, c.id]));

  // Seed Users
  const demoUsersInput = [
    { name: "John Head", email: "head.ops@ecosphere.local", roleName: "Department Head", deptCode: "OPS" },
    { name: "Sarah Green", email: "head.sus@ecosphere.local", roleName: "Department Head", deptCode: "SUS" },
    { name: "Alice Asset", email: "manager.asset@ecosphere.local", roleName: "Asset Manager", deptCode: "OPS" },
    { name: "Robert Employee", email: "emp1.ops@ecosphere.local", roleName: "Employee", deptCode: "OPS" },
    { name: "Emma Employee", email: "emp2.ops@ecosphere.local", roleName: "Employee", deptCode: "OPS" },
    { name: "Michael Work", email: "emp3.mfg@ecosphere.local", roleName: "Employee", deptCode: "MFG" },
    { name: "Sophia Build", email: "emp4.mfg@ecosphere.local", roleName: "Employee", deptCode: "MFG" },
    { name: "David Plant", email: "emp5.sus@ecosphere.local", roleName: "Employee", deptCode: "SUS" },
    { name: "Linda Staff", email: "emp6.hr@ecosphere.local", roleName: "Employee", deptCode: "HR" },
    { name: "James Cash", email: "emp7.fin@ecosphere.local", roleName: "Employee", deptCode: "FIN" },
    { name: "Patricia Ops", email: "emp8.ops@ecosphere.local", roleName: "Employee", deptCode: "OPS" },
    { name: "William Mfg", email: "emp9.mfg@ecosphere.local", roleName: "Employee", deptCode: "MFG" },
    { name: "Barbara Sus", email: "emp10.sus@ecosphere.local", roleName: "Employee", deptCode: "SUS" },
  ];

  const userPasswordHash = await bcrypt.hash("User@123", 10);
  const createdUsers = new Map<string, string>(); // email -> id

  for (const u of demoUsersInput) {
    const roleId = roleMap.get(u.roleName);
    const departmentId = deptMap.get(u.deptCode);
    if (!roleId || !departmentId) {
      throw new Error(`Failed to find role or department for user ${u.email}`);
    }

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        roleId,
        departmentId,
        status: "ACTIVE",
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: userPasswordHash,
        roleId,
        departmentId,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    createdUsers.set(u.email, user.id);
  }

  // Also query the main Admin user
  const mainAdmin = await prisma.user.findUnique({
    where: { email: "admin@ecosphere.local" },
    select: { id: true },
  });
  if (mainAdmin) {
    createdUsers.set("admin@ecosphere.local", mainAdmin.id);
  }

  // Seed Goals
  const goalsInput = [
    { title: "Reduce Electricity Consumption", deptCode: "OPS", targetValue: 50000, deadline: new Date(Date.UTC(2026, 11, 31)), status: "ACTIVE" as const },
    { title: "Optimize Diesel Fuel Usage", deptCode: "MFG", targetValue: 30000, deadline: new Date(Date.UTC(2026, 11, 31)), status: "ACTIVE" as const },
    { title: "Reduce Natural Gas in Operations", deptCode: "OPS", targetValue: 15000, deadline: new Date(Date.UTC(2026, 11, 31)), status: "ACTIVE" as const },
    { title: "Carbon Cap 2026", deptCode: "SUS", targetValue: 100000, deadline: new Date(Date.UTC(2026, 11, 31)), status: "ACTIVE" as const },
    { title: "Water Conservation Drive", deptCode: "HR", targetValue: 5000, deadline: new Date(Date.UTC(2026, 11, 31)), status: "ACTIVE" as const },
    { title: "Petrol Reduction Target", deptCode: "FIN", targetValue: 10000, deadline: new Date(Date.UTC(2026, 11, 31)), status: "COMPLETED" as const },
  ];

  for (const g of goalsInput) {
    const departmentId = deptMap.get(g.deptCode);
    if (!departmentId) continue;

    const existing = await prisma.environmentalGoal.findFirst({
      where: { title: g.title, departmentId },
    });

    if (existing) {
      await prisma.environmentalGoal.update({
        where: { id: existing.id },
        data: {
          targetValue: g.targetValue,
          deadline: g.deadline,
          status: g.status,
        },
      });
    } else {
      await prisma.environmentalGoal.create({
        data: {
          title: g.title,
          departmentId,
          targetValue: g.targetValue,
          deadline: g.deadline,
          status: g.status,
        },
      });
    }
  }

  // Seed Carbon Transactions (spanning Jan to Jul 2026)
  const creatorId = createdUsers.get("manager.asset@ecosphere.local") || createdUsers.get("admin@ecosphere.local")!;
  const txs: any[] = [];
  const factorNames = ["Diesel", "Electricity", "Natural Gas", "Petrol", "Water Supply"];
  const deptCodes = ["OPS", "MFG", "SUS", "HR", "FIN"];
  const sourceTypes = ["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"] as const;

  let txIndex = 1;
  for (let month = 0; month <= 6; month++) {
    for (let i = 0; i < 6; i++) {
      const refNum = `DEMO-TX-${String(txIndex).padStart(3, "0")}`;
      const factorName = factorNames[txIndex % factorNames.length] || "Diesel";
      const deptCode = deptCodes[txIndex % deptCodes.length] || "OPS";
      const sourceType = sourceTypes[txIndex % sourceTypes.length] || "PURCHASE";
      const factorObj = factorMap.get(factorName);
      const departmentId = deptMap.get(deptCode);

      if (!factorObj || !departmentId) continue;

      const quantity = 100 + (txIndex * 15) % 800;
      const calculatedEmission = quantity * Number(factorObj.factor);
      const day = 1 + (txIndex * 7) % 28;
      const transactionDate = new Date(Date.UTC(2026, month, day));

      txs.push({
        referenceNumber: refNum,
        departmentId,
        emissionFactorId: factorObj.id,
        sourceType,
        quantity,
        calculatedEmission,
        createdById: creatorId,
        transactionDate,
      });

      txIndex++;
    }
  }

  for (const tx of txs) {
    const existing = await prisma.carbonTransaction.findFirst({
      where: { referenceNumber: tx.referenceNumber },
    });

    if (existing) {
      await prisma.carbonTransaction.update({
        where: { id: existing.id },
        data: {
          departmentId: tx.departmentId,
          emissionFactorId: tx.emissionFactorId,
          sourceType: tx.sourceType,
          quantity: tx.quantity,
          calculatedEmission: tx.calculatedEmission,
          createdById: tx.createdById,
          transactionDate: tx.transactionDate,
        },
      });
    } else {
      await prisma.carbonTransaction.create({
        data: tx,
      });
    }
  }

  // Seed Policies
  const adminId = createdUsers.get("admin@ecosphere.local")!;
  const policiesInput = [
    { title: "Code of Environmental Conduct", description: "Guidelines for reducing waste, saving energy, and promoting green behavior.", version: "1.0", effectiveDate: new Date(Date.UTC(2026, 0, 1)), status: "ACTIVE" as const },
    { title: "Supplier Anti-Bribery Policy", description: "Rules and practices for governance and anti-corruption in the supply chain.", version: "2.0", effectiveDate: new Date(Date.UTC(2026, 1, 1)), status: "ACTIVE" as const },
    { title: "Human Rights and Fair Labor standards", description: "Our commitment to fair wages, working hours, and safe environments.", version: "1.1", effectiveDate: new Date(Date.UTC(2026, 2, 1)), status: "ACTIVE" as const },
    { title: "Information Security and Privacy Policy", description: "Standard requirements for keeping corporate data safe and secure.", version: "1.0", effectiveDate: new Date(Date.UTC(2026, 3, 1)), status: "ACTIVE" as const },
  ];

  const seededPolicies = [];
  for (const p of policiesInput) {
    const existing = await prisma.policy.findFirst({
      where: { title: p.title, version: p.version },
    });

    let policy;
    if (existing) {
      policy = await prisma.policy.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          effectiveDate: p.effectiveDate,
          status: p.status,
          createdById: adminId,
        },
      });
    } else {
      policy = await prisma.policy.create({
        data: {
          title: p.title,
          description: p.description,
          version: p.version,
          effectiveDate: p.effectiveDate,
          status: p.status,
          createdById: adminId,
        },
      });
    }
    seededPolicies.push(policy);
  }

  // Seed Policy Acknowledgements
  const employeeEmails = [
    "emp1.ops@ecosphere.local",
    "emp2.ops@ecosphere.local",
    "emp3.mfg@ecosphere.local",
    "emp4.mfg@ecosphere.local",
    "emp5.sus@ecosphere.local",
    "emp6.hr@ecosphere.local",
    "emp7.fin@ecosphere.local",
    "emp8.ops@ecosphere.local",
    "emp9.mfg@ecosphere.local",
    "emp10.sus@ecosphere.local",
  ];

  for (const policy of seededPolicies) {
    let ackCount = 0;
    if (policy.title.includes("Environmental")) ackCount = 9;
    else if (policy.title.includes("Bribery")) ackCount = 8;
    else if (policy.title.includes("Human")) ackCount = 7;
    else ackCount = 6;

    for (let i = 0; i < ackCount; i++) {
      const email = employeeEmails[i];
      if (!email) continue;
      const userId = createdUsers.get(email);
      if (!userId) continue;

      await prisma.policyAcknowledgement.upsert({
        where: {
          policyId_userId: {
            policyId: policy.id,
            userId,
          },
        },
        update: {
          acknowledgementStatus: "ACKNOWLEDGED",
        },
        create: {
          policyId: policy.id,
          userId,
          acknowledgementStatus: "ACKNOWLEDGED",
          acknowledgedAt: new Date(Date.UTC(2026, 4, 1 + i)),
        },
      });
    }
  }

  // Seed Audits
  const auditsInput = [
    { title: "Q1 Environmental Audit", deptCode: "MFG", start: new Date(Date.UTC(2026, 2, 1)), end: new Date(Date.UTC(2026, 2, 15)), score: 85, status: "COMPLETED" as const, findings: "Overall good compliance. Minimal waste storage issues found in sector 3." },
    { title: "Q2 Compliance & Safety Audit", deptCode: "OPS", start: new Date(Date.UTC(2026, 5, 1)), end: new Date(Date.UTC(2026, 5, 15)), score: 92, status: "COMPLETED" as const, findings: "Excellent emergency response readiness. Missing minor documentation on energy meters." },
    { title: "Sustainability Readiness Audit", deptCode: "SUS", start: new Date(Date.UTC(2026, 7, 1)), end: new Date(Date.UTC(2026, 7, 15)), status: "PLANNED" as const, findings: "" },
  ];

  const seededAudits = [];
  for (const a of auditsInput) {
    const departmentId = deptMap.get(a.deptCode);
    if (!departmentId) continue;

    const existing = await prisma.audit.findFirst({
      where: { title: a.title, departmentId },
    });

    let audit;
    if (existing) {
      audit = await prisma.audit.update({
        where: { id: existing.id },
        data: {
          auditStartDate: a.start,
          auditEndDate: a.end,
          score: a.score !== undefined ? a.score : null,
          status: a.status,
          findings: a.findings || null,
          auditorId: adminId,
        },
      });
    } else {
      audit = await prisma.audit.create({
        data: {
          title: a.title,
          departmentId,
          auditStartDate: a.start,
          auditEndDate: a.end,
          score: a.score !== undefined ? a.score : null,
          status: a.status,
          findings: a.findings || null,
          auditorId: adminId,
        },
      });
    }
    seededAudits.push(audit);
  }

  // Seed Compliance Issues
  const issuesInput = [
    { title: "Improper Disposal of Solvents", auditTitle: "Q1 Environmental Audit", deptCode: "MFG", ownerEmail: "head.ops@ecosphere.local", severity: "CRITICAL" as const, description: "Solvent containers left open in manufacturing bay B.", status: "OPEN" as const, dueDate: new Date(Date.UTC(2026, 7, 1)) },
    { title: "Expired Safety Certifications", auditTitle: "Q1 Environmental Audit", deptCode: "OPS", ownerEmail: "emp1.ops@ecosphere.local", severity: "HIGH" as const, description: "Two fire safety certs in main lobby expired in April.", status: "RESOLVED" as const, dueDate: new Date(Date.UTC(2026, 4, 1)), resolvedAt: new Date(Date.UTC(2026, 4, 15)) },
    { title: "Missing Policy Acknowledgements in Operations", auditTitle: "Q2 Compliance & Safety Audit", deptCode: "OPS", ownerEmail: "head.ops@ecosphere.local", severity: "MEDIUM" as const, description: "New hires in ops have not signed off on code of conduct.", status: "OVERDUE" as const, dueDate: new Date(Date.UTC(2026, 5, 15)) },
    { title: "Incomplete Diversity Reporting", auditTitle: "Q2 Compliance & Safety Audit", deptCode: "HR", ownerEmail: "emp6.hr@ecosphere.local", severity: "LOW" as const, description: "Department diversity balance sheets lack regional metrics.", status: "IN_PROGRESS" as const, dueDate: new Date(Date.UTC(2026, 6, 30)) },
    { title: "Unapproved Carbon Outflow", auditTitle: "Q2 Compliance & Safety Audit", deptCode: "FIN", ownerEmail: "emp7.fin@ecosphere.local", severity: "HIGH" as const, description: "Carbon transactions from logistics not approved by department lead.", status: "OPEN" as const, dueDate: new Date(Date.UTC(2026, 7, 15)) },
  ];

  for (const issue of issuesInput) {
    const departmentId = deptMap.get(issue.deptCode);
    const ownerId = createdUsers.get(issue.ownerEmail);
    const audit = seededAudits.find((a) => a.title === issue.auditTitle);

    if (!departmentId || !ownerId || !audit) continue;

    const existing = await prisma.complianceIssue.findFirst({
      where: { title: issue.title, auditId: audit.id },
    });

    if (existing) {
      await prisma.complianceIssue.update({
        where: { id: existing.id },
        data: {
          departmentId,
          ownerId,
          severity: issue.severity,
          description: issue.description,
          dueDate: issue.dueDate,
          resolvedAt: issue.resolvedAt || null,
          status: issue.status,
        },
      });
    } else {
      await prisma.complianceIssue.create({
        data: {
          title: issue.title,
          auditId: audit.id,
          departmentId,
          ownerId,
          severity: issue.severity,
          description: issue.description,
          dueDate: issue.dueDate,
          resolvedAt: issue.resolvedAt || null,
          status: issue.status,
        },
      });
    }
  }

  // Seed CSR Activities
  const catVolId = catMap.get("Community Volunteering_CSR_ACTIVITY");
  const wellnessId = catMap.get("Wellness Initiative_CSR_ACTIVITY");

  if (!catVolId || !wellnessId) {
    throw new Error("Seeded categories are missing in CSR seeding.");
  }

  const activitiesInput = [
    { title: "Green Space Tree Planting", deptCode: "SUS", catId: catVolId, description: "Planting trees in the city park to offset office emissions.", start: new Date(Date.UTC(2026, 3, 10)), end: new Date(Date.UTC(2026, 3, 10)), status: "COMPLETED" as const },
    { title: "Beach Cleanup Drive", deptCode: "OPS", catId: catVolId, description: "A day spent clearing plastic waste from the local beach.", start: new Date(Date.UTC(2026, 4, 15)), end: new Date(Date.UTC(2026, 4, 15)), status: "COMPLETED" as const },
    { title: "Sustainability Awareness Seminar", deptCode: "HR", catId: wellnessId, description: "Internal seminar on green habits and workplace ergonomics.", start: new Date(Date.UTC(2026, 5, 20)), end: new Date(Date.UTC(2026, 5, 20)), status: "COMPLETED" as const },
    { title: "E-Waste Recycling Week", deptCode: "FIN", catId: catVolId, description: "Collect old devices and drop them off for specialized processing.", start: new Date(Date.UTC(2026, 6, 10)), end: new Date(Date.UTC(2026, 6, 17)), status: "ONGOING" as const },
    { title: "Mental Health Webinar", deptCode: "HR", catId: wellnessId, description: "An open session for employees to learn stress management.", start: new Date(Date.UTC(2026, 7, 5)), end: new Date(Date.UTC(2026, 7, 5)), status: "PLANNED" as const },
    { title: "Office Energy Audit Drive", deptCode: "OPS", catId: wellnessId, description: "Walkthrough of office to flag waste energy nodes.", start: new Date(Date.UTC(2026, 2, 5)), end: new Date(Date.UTC(2026, 2, 5)), status: "COMPLETED" as const },
    { title: "Carpool Sign-up Campaign", deptCode: "HR", catId: wellnessId, description: "Internal sign-up drive for shared commuting.", start: new Date(Date.UTC(2026, 2, 20)), end: new Date(Date.UTC(2026, 2, 20)), status: "COMPLETED" as const },
  ];

  const seededActivities = [];
  for (const act of activitiesInput) {
    const departmentId = deptMap.get(act.deptCode);
    if (!departmentId) continue;

    const existing = await prisma.csrActivity.findFirst({
      where: { title: act.title, departmentId },
    });

    let activity;
    if (existing) {
      activity = await prisma.csrActivity.update({
        where: { id: existing.id },
        data: {
          categoryId: act.catId,
          description: act.description,
          startDate: act.start,
          endDate: act.end,
          status: act.status,
          createdById: adminId,
        },
      });
    } else {
      activity = await prisma.csrActivity.create({
        data: {
          title: act.title,
          departmentId,
          categoryId: act.catId,
          description: act.description,
          startDate: act.start,
          endDate: act.end,
          status: act.status,
          createdById: adminId,
        },
      });
    }
    seededActivities.push(activity);
  }

  // Create CSR Participations
  const headOpsId = createdUsers.get("head.ops@ecosphere.local")!;
  const treePlanting = seededActivities.find((a) => a.title === "Green Space Tree Planting")!;
  const beachCleanup = seededActivities.find((a) => a.title === "Beach Cleanup Drive")!;
  const seminar = seededActivities.find((a) => a.title === "Sustainability Awareness Seminar")!;
  const emp1Id = createdUsers.get("emp1.ops@ecosphere.local")!;
  const completedActs = seededActivities.filter((a) => a.status === "COMPLETED");

  for (const act of completedActs) {
    await prisma.employeeParticipation.upsert({
      where: {
        activityId_userId: {
          activityId: act.id,
          userId: emp1Id,
        },
      },
      update: {
        approvalStatus: "APPROVED",
        completionDate: act.endDate,
        approvedById: headOpsId,
        approvedAt: act.endDate,
        proofFile: "dummy_proof_file.pdf",
      },
      create: {
        activityId: act.id,
        userId: emp1Id,
        approvalStatus: "APPROVED",
        completionDate: act.endDate,
        approvedById: headOpsId,
        approvedAt: act.endDate,
        proofFile: "dummy_proof_file.pdf",
      },
    });
  }

  const otherEmps = ["emp2.ops@ecosphere.local", "emp3.mfg@ecosphere.local", "emp4.mfg@ecosphere.local"];
  for (const empEmail of otherEmps) {
    const userId = createdUsers.get(empEmail);
    if (!userId) continue;
    await prisma.employeeParticipation.upsert({
      where: { activityId_userId: { activityId: treePlanting.id, userId } },
      update: { approvalStatus: "APPROVED", approvedById: headOpsId },
      create: { activityId: treePlanting.id, userId, approvalStatus: "APPROVED", approvedById: headOpsId, proofFile: "proof.png" },
    });
    await prisma.employeeParticipation.upsert({
      where: { activityId_userId: { activityId: beachCleanup.id, userId } },
      update: { approvalStatus: "PENDING" },
      create: { activityId: beachCleanup.id, userId, approvalStatus: "PENDING", proofFile: "beach.jpg" },
    });
  }

  // Seed Challenges
  const challCatId = catMap.get("Carbon Reduction Challenge_CHALLENGE");
  const commuteCatId = catMap.get("Sustainable Commuting Challenge_CHALLENGE");

  if (!challCatId || !commuteCatId) {
    throw new Error("Seeded categories are missing in Challenge seeding.");
  }

  const challengesInput = [
    { title: "Zero Single-Use Plastic Week", catId: challCatId, difficulty: "EASY" as const, xpReward: 50, deadline: new Date(Date.UTC(2026, 6, 30)), status: "ACTIVE" as const, evidenceRequired: true },
    { title: "Bicycle to Work Month", catId: commuteCatId, difficulty: "MEDIUM" as const, xpReward: 100, deadline: new Date(Date.UTC(2026, 6, 31)), status: "ACTIVE" as const, evidenceRequired: true },
    { title: "Reduce Energy Print", catId: challCatId, difficulty: "HARD" as const, xpReward: 200, deadline: new Date(Date.UTC(2026, 7, 15)), status: "ACTIVE" as const, evidenceRequired: true },
    { title: "Recycle 10 Plastic Bottles", catId: challCatId, difficulty: "EASY" as const, xpReward: 40, deadline: new Date(Date.UTC(2026, 5, 30)), status: "ACTIVE" as const, evidenceRequired: false },
    { title: "Carpool with Co-workers", catId: commuteCatId, difficulty: "MEDIUM" as const, xpReward: 80, deadline: new Date(Date.UTC(2026, 4, 30)), status: "ARCHIVED" as const, evidenceRequired: false },
  ];

  const seededChallenges = [];
  for (const c of challengesInput) {
    const existing = await prisma.challenge.findFirst({
      where: { title: c.title },
    });

    let challenge;
    if (existing) {
      challenge = await prisma.challenge.update({
        where: { id: existing.id },
        data: {
          categoryId: c.catId,
          difficulty: c.difficulty,
          xpReward: c.xpReward,
          deadline: c.deadline,
          status: c.status,
          evidenceRequired: c.evidenceRequired,
        },
      });
    } else {
      challenge = await prisma.challenge.create({
        data: {
          title: c.title,
          categoryId: c.catId,
          difficulty: c.difficulty,
          xpReward: c.xpReward,
          deadline: c.deadline,
          status: c.status,
          evidenceRequired: c.evidenceRequired,
        },
      });
    }
    seededChallenges.push(challenge);
  }

  // Challenge participations
  const plasticChall = seededChallenges.find((c) => c.title === "Zero Single-Use Plastic Week")!;
  const bikeChall = seededChallenges.find((c) => c.title === "Bicycle to Work Month")!;
  const recycleChall = seededChallenges.find((c) => c.title === "Recycle 10 Plastic Bottles")!;

  await prisma.challengeParticipation.upsert({
    where: { challengeId_userId: { challengeId: plasticChall.id, userId: emp1Id } },
    update: { progress: 100, approvalStatus: "APPROVED", completedAt: new Date(Date.UTC(2026, 6, 20)), approvedById: headOpsId },
    create: { challengeId: plasticChall.id, userId: emp1Id, progress: 100, approvalStatus: "APPROVED", completedAt: new Date(Date.UTC(2026, 6, 20)), approvedById: headOpsId, proofFile: "proof.txt" },
  });

  const emp2Id = createdUsers.get("emp2.ops@ecosphere.local")!;
  await prisma.challengeParticipation.upsert({
    where: { challengeId_userId: { challengeId: recycleChall.id, userId: emp2Id } },
    update: { progress: 100, approvalStatus: "APPROVED", completedAt: new Date(Date.UTC(2026, 5, 25)), approvedById: headOpsId },
    create: { challengeId: recycleChall.id, userId: emp2Id, progress: 100, approvalStatus: "APPROVED", completedAt: new Date(Date.UTC(2026, 5, 25)), approvedById: headOpsId },
  });

  await prisma.challengeParticipation.upsert({
    where: { challengeId_userId: { challengeId: bikeChall.id, userId: emp1Id } },
    update: { progress: 60, approvalStatus: "PENDING" },
    create: { challengeId: bikeChall.id, userId: emp1Id, progress: 60, approvalStatus: "PENDING" },
  });

  // Seed Trainings
  const trainingsInput = [
    { title: "Introduction to ESG Standards", description: "Learn about the basics of Environmental, Social, and Governance metrics." },
    { title: "Advanced Carbon Auditing", description: "A deep dive into measuring greenhouse gas emissions and auditing methodologies." },
    { title: "Code of Conduct Compliance", description: "Governance guidelines on ethical operations, conflicts of interest, and anti-bribery." },
    { title: "Workplace Safety & Reporting", description: "How to report governance violations, safety hazards, and compliance issues." },
  ];

  for (const t of trainingsInput) {
    const existing = await prisma.employeeTraining.findFirst({
      where: { userId: emp1Id, title: t.title },
    });
    if (existing) {
      await prisma.employeeTraining.update({
        where: { id: existing.id },
        data: {
          description: t.description,
          progress: 100,
          status: "COMPLETED",
          completionDate: new Date(Date.UTC(2026, 5, 10)),
        },
      });
    } else {
      await prisma.employeeTraining.create({
        data: {
          userId: emp1Id,
          title: t.title,
          description: t.description,
          progress: 100,
          status: "COMPLETED",
          completionDate: new Date(Date.UTC(2026, 5, 10)),
        },
      });
    }
  }

  for (let i = 0; i < trainingsInput.length; i++) {
    const t = trainingsInput[i];
    if (!t) continue;
    const existing = await prisma.employeeTraining.findFirst({
      where: { userId: emp2Id, title: t.title },
    });
    const progress = i * 25;
    const status = progress === 100 ? "COMPLETED" : "ASSIGNED";

    if (existing) {
      await prisma.employeeTraining.update({
        where: { id: existing.id },
        data: {
          description: t.description,
          progress,
          status,
          completionDate: progress === 100 ? new Date(Date.UTC(2026, 6, 1)) : null,
        },
      });
    } else {
      await prisma.employeeTraining.create({
        data: {
          userId: emp2Id,
          title: t.title,
          description: t.description,
          progress,
          status,
          completionDate: progress === 100 ? new Date(Date.UTC(2026, 6, 1)) : null,
        },
      });
    }
  }

  // Seed XP Transactions
  const xps = [
    { email: "emp1.ops@ecosphere.local", points: 250, remarks: "Completed 5 ESG CSR activities", sourceType: "CSR" as const, sourceId: treePlanting.id },
    { email: "emp1.ops@ecosphere.local", points: 50, remarks: "Completed Zero Single-Use Plastic challenge", sourceType: "CHALLENGE" as const, sourceId: plasticChall.id },
    { email: "emp1.ops@ecosphere.local", points: 100, remarks: "Completed ESG Training Curriculum", sourceType: "CSR" as const, sourceId: treePlanting.id },
    { email: "emp2.ops@ecosphere.local", points: 150, remarks: "Completed 3 CSR activities", sourceType: "CSR" as const, sourceId: treePlanting.id },
    { email: "emp2.ops@ecosphere.local", points: 40, remarks: "Completed Recycle 10 Plastic Bottles challenge", sourceType: "CHALLENGE" as const, sourceId: recycleChall.id },
  ];

  for (const xp of xps) {
    const userId = createdUsers.get(xp.email);
    if (!userId) continue;

    const existing = await prisma.xpTransaction.findFirst({
      where: { userId, sourceType: xp.sourceType, sourceId: xp.sourceId, points: xp.points },
    });

    if (!existing) {
      await prisma.xpTransaction.create({
        data: {
          userId,
          points: xp.points,
          remarks: xp.remarks,
          sourceType: xp.sourceType,
          sourceId: xp.sourceId,
        },
      });
    }
  }

  // Seed Badges & unlocks
  const ecoWarriorBadge = await prisma.badge.findUnique({ where: { name: "Eco-Warrior" } });
  const firstStepsBadge = await prisma.badge.findUnique({ where: { name: "First Steps" } });
  const trainingScholarBadge = await prisma.badge.findUnique({ where: { name: "Training Scholar" } });

  if (ecoWarriorBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: emp1Id, badgeId: ecoWarriorBadge.id } },
      update: {},
      create: { userId: emp1Id, badgeId: ecoWarriorBadge.id, awardedAt: new Date(Date.UTC(2026, 6, 20)) },
    });
  }
  if (firstStepsBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: emp1Id, badgeId: firstStepsBadge.id } },
      update: {},
      create: { userId: emp1Id, badgeId: firstStepsBadge.id, awardedAt: new Date(Date.UTC(2026, 6, 20)) },
    });
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: emp2Id, badgeId: firstStepsBadge.id } },
      update: {},
      create: { userId: emp2Id, badgeId: firstStepsBadge.id, awardedAt: new Date(Date.UTC(2026, 5, 25)) },
    });
  }
  if (trainingScholarBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: emp1Id, badgeId: trainingScholarBadge.id } },
      update: {},
      create: { userId: emp1Id, badgeId: trainingScholarBadge.id, awardedAt: new Date(Date.UTC(2026, 5, 10)) },
    });
  }

  // Seed Reward Redemptions
  const rewardObj = await prisma.reward.findUnique({ where: { name: "Reusable Water Bottle" } });
  if (rewardObj) {
    const existingRedemption = await prisma.rewardRedemption.findFirst({
      where: { userId: emp1Id, rewardId: rewardObj.id },
    });

    if (!existingRedemption) {
      await prisma.rewardRedemption.create({
        data: {
          userId: emp1Id,
          rewardId: rewardObj.id,
          redeemedAt: new Date(Date.UTC(2026, 6, 21)),
          status: "SUCCESS",
        },
      });
      await prisma.reward.update({
        where: { id: rewardObj.id },
        data: { stock: { decrement: 1 } },
      });
    }
  }

  // Seed Notifications
  const notifsInput = [
    { email: "emp1.ops@ecosphere.local", title: "Carbon Transaction Recorded", message: "Carbon output of 1500.00 kg CO₂ recorded for Operations department.", type: "SYSTEM" as const },
    { email: "emp1.ops@ecosphere.local", title: "Policy Acknowledged", message: "You acknowledged policy 'Code of Environmental Conduct v1.0'.", type: "POLICY" as const },
    { email: "head.ops@ecosphere.local", title: "CSR Activity Joined", message: "Robert Employee joined Green Space Tree Planting.", type: "CSR" as const },
    { email: "emp2.ops@ecosphere.local", title: "Challenge Completed", message: "Congratulations! You completed Recycle 10 Plastic Bottles.", type: "CHALLENGE" as const },
    { email: "head.ops@ecosphere.local", title: "Compliance Overdue Reminder", message: "Compliance issue 'Missing Policy Acknowledgements' is past its due date.", type: "COMPLIANCE" as const },
  ];

  for (const n of notifsInput) {
    const userId = createdUsers.get(n.email);
    if (!userId) continue;

    const existing = await prisma.notification.findFirst({
      where: { userId, title: n.title },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: false,
          createdAt: new Date(Date.UTC(2026, 6, 11)),
        },
      });
    }
  }

  // Seed Activity Logs
  const firstPolicy = seededPolicies[0];
  const firstPolicyId = firstPolicy ? firstPolicy.id : "00000000-0000-0000-0000-000000000000";
  const logsInput = [
    { email: "manager.asset@ecosphere.local", entityType: "DEPARTMENT" as const, entityId: deptMap.get("OPS") || "00000000-0000-0000-0000-000000000000", action: "CREATE" as const, remarks: "Recorded carbon transaction for Operations" },
    { email: "admin@ecosphere.local", entityType: "POLICY" as const, entityId: firstPolicyId, action: "CREATE" as const, remarks: "Created Code of Environmental Conduct policy" },
    { email: "emp1.ops@ecosphere.local", entityType: "POLICY" as const, entityId: firstPolicyId, action: "UPDATE" as const, remarks: "Acknowledged policy Code of Environmental Conduct" },
    { email: "head.ops@ecosphere.local", entityType: "CSR_ACTIVITY" as const, entityId: treePlanting.id, action: "APPROVE" as const, remarks: "Approved Robert Employee participation in CSR activity" },
    { email: "emp1.ops@ecosphere.local", entityType: "REWARD" as const, entityId: rewardObj ? rewardObj.id : "00000000-0000-0000-0000-000000000000", action: "REDEEM" as const, remarks: "Redeemed Reusable Water Bottle reward" },
  ];

  for (const log of logsInput) {
    const userId = createdUsers.get(log.email);
    if (!userId || log.entityId === "00000000-0000-0000-0000-000000000000") continue;

    const existing = await prisma.activityLog.findFirst({
      where: { userId, entityType: log.entityType, entityId: log.entityId, action: log.action },
    });

    if (!existing) {
      await prisma.activityLog.create({
        data: {
          userId,
          entityType: log.entityType,
          entityId: log.entityId,
          action: log.action,
          newValue: { remarks: log.remarks },
        },
      });
    }
  }

  console.log("✓ Demo data seeded");
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

  await seedEmissionFactors();
  console.log("✓ Emission factors seeded");

  await seedSocial();
  console.log("✓ Social & Gamification seeded");

  await seedDemoData();

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
