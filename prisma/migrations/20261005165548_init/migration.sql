/*
  Warnings:

  - The values [ON_TRIP] on the enum `AmbulanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,DISPATCHING,ASSIGNED,PICKED_UP,HOSPITAL_SELECTED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AmbulanceStatus_new" AS ENUM ('AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'PICKING_UP', 'TO_HOSPITAL', 'MAINTENANCE', 'OFFLINE');
ALTER TABLE "public"."Ambulance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Ambulance" ALTER COLUMN "status" TYPE "AmbulanceStatus_new" USING ("status"::text::"AmbulanceStatus_new");
ALTER TYPE "AmbulanceStatus" RENAME TO "AmbulanceStatus_old";
ALTER TYPE "AmbulanceStatus_new" RENAME TO "AmbulanceStatus";
DROP TYPE "public"."AmbulanceStatus_old";
ALTER TABLE "Ambulance" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('REQUESTED', 'PRIORITY_ASSIGNED', 'AMBULANCE_ASSIGNED', 'DRIVER_ACCEPTED', 'EN_ROUTE', 'PATIENT_PICKED_UP', 'TO_HOSPITAL', 'ARRIVED', 'COMPLETED', 'CANCELLED', 'FAILED');
ALTER TABLE "public"."EmergencyRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EmergencyRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "EmergencyRequest" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterTable
ALTER TABLE "EmergencyRequest" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

-- CreateTable
CREATE TABLE "IncidentHistory" (
    "id" TEXT NOT NULL,
    "emergencyRequestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IncidentHistory" ADD CONSTRAINT "IncidentHistory_emergencyRequestId_fkey" FOREIGN KEY ("emergencyRequestId") REFERENCES "EmergencyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentHistory" ADD CONSTRAINT "IncidentHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
