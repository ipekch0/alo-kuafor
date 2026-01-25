-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethod" TEXT;
