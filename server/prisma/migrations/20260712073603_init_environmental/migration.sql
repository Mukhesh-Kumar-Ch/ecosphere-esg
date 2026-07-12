-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'MANUAL');

-- CreateTable
CREATE TABLE "emission_factors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "factor" DECIMAL(10,4) NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emission_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_goals" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "target_value" DECIMAL(10,2) NOT NULL,
    "deadline" DATE NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environmental_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carbon_transactions" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "emission_factor_id" UUID NOT NULL,
    "source_type" "SourceType" NOT NULL,
    "reference_number" VARCHAR(100),
    "quantity" DECIMAL(10,2) NOT NULL,
    "calculated_emission" DECIMAL(10,4) NOT NULL,
    "created_by" UUID NOT NULL,
    "transaction_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carbon_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emission_factors_name_idx" ON "emission_factors"("name");

-- CreateIndex
CREATE INDEX "emission_factors_status_idx" ON "emission_factors"("status");

-- CreateIndex
CREATE INDEX "environmental_goals_department_id_idx" ON "environmental_goals"("department_id");

-- CreateIndex
CREATE INDEX "environmental_goals_deadline_idx" ON "environmental_goals"("deadline");

-- CreateIndex
CREATE INDEX "environmental_goals_status_idx" ON "environmental_goals"("status");

-- CreateIndex
CREATE INDEX "carbon_transactions_department_id_idx" ON "carbon_transactions"("department_id");

-- CreateIndex
CREATE INDEX "carbon_transactions_transaction_date_idx" ON "carbon_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "carbon_transactions_source_type_idx" ON "carbon_transactions"("source_type");

-- CreateIndex
CREATE INDEX "carbon_transactions_created_by_idx" ON "carbon_transactions"("created_by");

-- CreateIndex
CREATE INDEX "carbon_transactions_emission_factor_id_idx" ON "carbon_transactions"("emission_factor_id");

-- AddForeignKey
ALTER TABLE "environmental_goals" ADD CONSTRAINT "environmental_goals_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_transactions" ADD CONSTRAINT "carbon_transactions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_transactions" ADD CONSTRAINT "carbon_transactions_emission_factor_id_fkey" FOREIGN KEY ("emission_factor_id") REFERENCES "emission_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_transactions" ADD CONSTRAINT "carbon_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
