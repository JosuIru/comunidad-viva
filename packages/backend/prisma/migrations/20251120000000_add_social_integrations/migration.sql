-- CreateEnum
CREATE TYPE "IntegrationPlatform" AS ENUM ('TELEGRAM', 'WHATSAPP_BUSINESS', 'DISCORD', 'SIGNAL', 'SLACK');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('APP', 'TELEGRAM', 'WHATSAPP', 'EMAIL', 'PHONE');

-- AlterTable User - Add contact preference fields
ALTER TABLE "User" ADD COLUMN "telegramUsername" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsappNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "contactPreference" "ContactMethod" NOT NULL DEFAULT 'APP';

-- CreateTable CommunityIntegration
CREATE TABLE "CommunityIntegration" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "platform" "IntegrationPlatform" NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelName" TEXT,
    "botToken" TEXT NOT NULL,
    "autoPublish" BOOLEAN NOT NULL DEFAULT false,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "publishOffers" BOOLEAN NOT NULL DEFAULT true,
    "publishEvents" BOOLEAN NOT NULL DEFAULT true,
    "publishNeeds" BOOLEAN NOT NULL DEFAULT true,
    "messageFormat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "CommunityIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityIntegration_communityId_idx" ON "CommunityIntegration"("communityId");

-- CreateIndex
CREATE INDEX "CommunityIntegration_platform_idx" ON "CommunityIntegration"("platform");

-- CreateIndex
CREATE INDEX "CommunityIntegration_enabled_idx" ON "CommunityIntegration"("enabled");

-- CreateIndex - Unique constraint to prevent duplicate integrations
CREATE UNIQUE INDEX "CommunityIntegration_communityId_platform_channelId_key" ON "CommunityIntegration"("communityId", "platform", "channelId");

-- AddForeignKey
ALTER TABLE "CommunityIntegration" ADD CONSTRAINT "CommunityIntegration_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
