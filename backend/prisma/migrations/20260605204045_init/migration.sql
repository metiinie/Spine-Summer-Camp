-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "session" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "receiptUrl" TEXT,
    "adminNote" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Camper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "tShirtSize" TEXT NOT NULL,
    CONSTRAINT "Camper_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "primaryName" TEXT NOT NULL,
    "primaryRelationship" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "primaryEmail" TEXT NOT NULL,
    "secondaryName" TEXT,
    "secondaryPhone" TEXT,
    "secondaryRelationship" TEXT,
    "subCity" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "houseNumber" TEXT,
    CONSTRAINT "Parent_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "allergies" TEXT,
    "conditions" TEXT,
    "dietary" TEXT,
    CONSTRAINT "MedicalInfo_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Waiver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "liabilityRelease" BOOLEAN NOT NULL,
    "mediaRelease" BOOLEAN NOT NULL,
    "parentSignature" TEXT NOT NULL,
    "dateSigned" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Waiver_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_referenceNumber_key" ON "Registration"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Camper_registrationId_key" ON "Camper"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_registrationId_key" ON "Parent"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalInfo_registrationId_key" ON "MedicalInfo"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Waiver_registrationId_key" ON "Waiver"("registrationId");
