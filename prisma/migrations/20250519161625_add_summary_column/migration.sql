/*
  Warnings:

  - Added the required column `summary` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "summary" TEXT NOT NULL;
