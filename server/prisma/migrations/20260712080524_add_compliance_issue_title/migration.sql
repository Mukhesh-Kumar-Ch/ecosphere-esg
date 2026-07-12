/*
  Warnings:

  - Added the required column `title` to the `compliance_issues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "compliance_issues" ADD COLUMN     "title" VARCHAR(150) NOT NULL;
