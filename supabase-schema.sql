-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RideVisibility" AS ENUM ('OPEN', 'FRIENDS', 'PREVIOUS_RIDERS', 'REQUEST_TO_JOIN', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "RideRole" AS ENUM ('HOST', 'MEMBER');

-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "screenName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT,
    "passwordHash" TEXT,
    "authProviders" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showRideStatus" BOOLEAN NOT NULL DEFAULT true,
    "notifyFriendsRiding" BOOLEAN NOT NULL DEFAULT true,
    "notifyProximityRides" BOOLEAN NOT NULL DEFAULT true,
    "allowAutoJoinStopped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "visibility" "RideVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "RideStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideMember" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "RideRole" NOT NULL DEFAULT 'MEMBER',
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waypoint" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "label" TEXT,
    "type" TEXT,

    CONSTRAINT "Waypoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestUsage" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "installId" TEXT NOT NULL,
    "rideCount" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "cooldownUntil" TIMESTAMP(3),
    "lastRideAt" TIMESTAMP(3),
    "lastRideId" TEXT,

    CONSTRAINT "GuestUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendEdge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" "FriendStatus" NOT NULL DEFAULT 'PENDING',
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "notifyRiding" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoRider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otherUserId" TEXT NOT NULL,
    "lastRideAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoRider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceMetric" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rttMs" INTEGER,
    "jitterMs" INTEGER,
    "packetLoss" DOUBLE PRECISION,
    "bitrateKbps" INTEGER,
    "reconnectCount" INTEGER,

    CONSTRAINT "VoiceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_screenName_key" ON "User"("screenName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ride_code_key" ON "Ride"("code");

-- CreateIndex
CREATE INDEX "Ride_hostId_idx" ON "Ride"("hostId");

-- CreateIndex
CREATE INDEX "Ride_status_idx" ON "Ride"("status");

-- CreateIndex
CREATE INDEX "RideMember_userId_idx" ON "RideMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RideMember_rideId_userId_key" ON "RideMember"("rideId", "userId");

-- CreateIndex
CREATE INDEX "Position_rideId_ts_idx" ON "Position"("rideId", "ts");

-- CreateIndex
CREATE INDEX "Position_userId_ts_idx" ON "Position"("userId", "ts");

-- CreateIndex
CREATE INDEX "Waypoint_rideId_ts_idx" ON "Waypoint"("rideId", "ts");

-- CreateIndex
CREATE INDEX "GuestUsage_deviceId_idx" ON "GuestUsage"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "GuestUsage_deviceId_installId_key" ON "GuestUsage"("deviceId", "installId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendEdge_userId_friendId_key" ON "FriendEdge"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "CoRider_userId_otherUserId_key" ON "CoRider"("userId", "otherUserId");

-- CreateIndex
CREATE INDEX "VoiceMetric_rideId_ts_idx" ON "VoiceMetric"("rideId", "ts");

-- CreateIndex
CREATE INDEX "VoiceMetric_userId_ts_idx" ON "VoiceMetric"("userId", "ts");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideMember" ADD CONSTRAINT "RideMember_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideMember" ADD CONSTRAINT "RideMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waypoint" ADD CONSTRAINT "Waypoint_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waypoint" ADD CONSTRAINT "Waypoint_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendEdge" ADD CONSTRAINT "FriendEdge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendEdge" ADD CONSTRAINT "FriendEdge_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoRider" ADD CONSTRAINT "CoRider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoRider" ADD CONSTRAINT "CoRider_otherUserId_fkey" FOREIGN KEY ("otherUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceMetric" ADD CONSTRAINT "VoiceMetric_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceMetric" ADD CONSTRAINT "VoiceMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
