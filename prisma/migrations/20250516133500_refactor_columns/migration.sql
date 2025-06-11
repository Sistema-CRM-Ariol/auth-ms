/*
  Warnings:

  - You are about to drop the column `userId` on the `roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_userId_fkey";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
