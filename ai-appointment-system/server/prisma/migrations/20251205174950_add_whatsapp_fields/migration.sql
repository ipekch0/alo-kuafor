/*
  Warnings:

  - A unique constraint covering the columns `[whatsappNumberId]` on the table `Salon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "whatsappAccessToken" TEXT,
ADD COLUMN     "whatsappNumberId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Salon_whatsappNumberId_key" ON "Salon"("whatsappNumberId");
