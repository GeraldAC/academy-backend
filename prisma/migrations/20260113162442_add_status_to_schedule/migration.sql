-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "concept" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "receipt_number" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "classroom" VARCHAR(50);
