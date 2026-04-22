/*
  Warnings:

  - The values [DONE] on the enum `QueueEntryStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QueueEntryStatus_new" AS ENUM ('WAITING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "public"."QueueEntry" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "QueueEntry" ALTER COLUMN "status" TYPE "QueueEntryStatus_new" USING ("status"::text::"QueueEntryStatus_new");
ALTER TYPE "QueueEntryStatus" RENAME TO "QueueEntryStatus_old";
ALTER TYPE "QueueEntryStatus_new" RENAME TO "QueueEntryStatus";
DROP TYPE "public"."QueueEntryStatus_old";
ALTER TABLE "QueueEntry" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;
