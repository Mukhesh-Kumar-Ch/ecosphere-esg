import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roles = [
  { name: "Admin", description: "Full administrative access" },
  { name: "ESG Manager", description: "Manages environmental workflows" },
  { name: "Compliance Officer", description: "Manages governance workflows" },
  { name: "HR Manager", description: "Manages social and CSR workflows" },
  { name: "Employee", description: "Standard platform access" },
];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
