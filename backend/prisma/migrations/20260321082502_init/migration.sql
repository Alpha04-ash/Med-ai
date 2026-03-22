-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "height" REAL NOT NULL,
    "baseline_systolic" INTEGER NOT NULL DEFAULT 120,
    "baseline_diastolic" INTEGER NOT NULL DEFAULT 80,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VitalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heart_rate" INTEGER NOT NULL,
    "blood_pressure" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    "spo2" REAL NOT NULL,
    "respiratory_rate" INTEGER NOT NULL,
    CONSTRAINT "VitalRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HealthReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "risk_score" REAL NOT NULL,
    "classification" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    CONSTRAINT "HealthReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "ai_doctor_id" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transcript" TEXT NOT NULL,
    "structured_notes" TEXT NOT NULL,
    "confidence_score" REAL NOT NULL,
    CONSTRAINT "Conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE INDEX "VitalRecord_user_id_timestamp_idx" ON "VitalRecord"("user_id", "timestamp" DESC);
