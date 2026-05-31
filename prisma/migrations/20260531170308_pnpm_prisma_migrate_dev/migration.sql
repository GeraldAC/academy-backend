/*
  Warnings:

  - You are about to alter the column `concept` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `receipt_number` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - You are about to drop the column `classroom` on the `schedules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "concept" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "receipt_number" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "classroom";
