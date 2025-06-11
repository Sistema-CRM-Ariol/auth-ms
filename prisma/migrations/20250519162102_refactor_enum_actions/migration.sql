/*
  Warnings:

  - The values [remove] on the enum `Action` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Action_new" AS ENUM ('create', 'delete', 'update', 'read', 'readOne', 'report', 'reportOne');
ALTER TABLE "permissions" ALTER COLUMN "actions" TYPE "Action_new"[] USING ("actions"::text::"Action_new"[]);
ALTER TYPE "Action" RENAME TO "Action_old";
ALTER TYPE "Action_new" RENAME TO "Action";
DROP TYPE "Action_old";
COMMIT;
