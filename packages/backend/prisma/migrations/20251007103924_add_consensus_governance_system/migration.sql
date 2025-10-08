-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('HELP', 'PROPOSAL', 'VALIDATION', 'DISPUTE');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ValidationDecision" AS ENUM ('APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('FEATURE', 'RULE_CHANGE', 'FUND_ALLOCATION', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DISCUSSION', 'VOTING', 'APPROVED', 'REJECTED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('POST', 'OFFER', 'COMMENT', 'MESSAGE', 'REVIEW');

-- CreateEnum
CREATE TYPE "DAOStatus" AS ENUM ('VOTING', 'EXECUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ModerationDecision" AS ENUM ('KEEP', 'REMOVE', 'WARN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "voteCredits" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "TrustBlock" (
    "id" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "previousHash" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "nonce" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "BlockStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "TrustBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockValidation" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "decision" "ValidationDecision" NOT NULL,
    "reason" TEXT,
    "stake" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "ProposalType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredBudget" DOUBLE PRECISION,
    "implementationPlan" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DISCUSSION',
    "discussionDeadline" TIMESTAMP(3) NOT NULL,
    "votingDeadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalVote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalComment" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationDAO" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "reportReason" TEXT,
    "reporterId" TEXT,
    "status" "DAOStatus" NOT NULL DEFAULT 'VOTING',
    "quorum" INTEGER NOT NULL DEFAULT 5,
    "deadline" TIMESTAMP(3) NOT NULL,
    "finalDecision" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationDAO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationVote" (
    "id" TEXT NOT NULL,
    "daoId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "decision" "ModerationDecision" NOT NULL,
    "reason" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrustBlock_height_key" ON "TrustBlock"("height");

-- CreateIndex
CREATE UNIQUE INDEX "TrustBlock_hash_key" ON "TrustBlock"("hash");

-- CreateIndex
CREATE INDEX "TrustBlock_height_idx" ON "TrustBlock"("height");

-- CreateIndex
CREATE INDEX "TrustBlock_status_idx" ON "TrustBlock"("status");

-- CreateIndex
CREATE INDEX "TrustBlock_timestamp_idx" ON "TrustBlock"("timestamp");

-- CreateIndex
CREATE INDEX "TrustBlock_actorId_idx" ON "TrustBlock"("actorId");

-- CreateIndex
CREATE INDEX "BlockValidation_blockId_idx" ON "BlockValidation"("blockId");

-- CreateIndex
CREATE INDEX "BlockValidation_validatorId_idx" ON "BlockValidation"("validatorId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockValidation_blockId_validatorId_key" ON "BlockValidation"("blockId", "validatorId");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_blockId_key" ON "Proposal"("blockId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_authorId_idx" ON "Proposal"("authorId");

-- CreateIndex
CREATE INDEX "Proposal_votingDeadline_idx" ON "Proposal"("votingDeadline");

-- CreateIndex
CREATE INDEX "ProposalVote_proposalId_idx" ON "ProposalVote"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalVote_voterId_idx" ON "ProposalVote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalVote_proposalId_voterId_key" ON "ProposalVote"("proposalId", "voterId");

-- CreateIndex
CREATE INDEX "ProposalComment_proposalId_idx" ON "ProposalComment"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalComment_authorId_idx" ON "ProposalComment"("authorId");

-- CreateIndex
CREATE INDEX "ProposalComment_parentId_idx" ON "ProposalComment"("parentId");

-- CreateIndex
CREATE INDEX "ModerationDAO_status_idx" ON "ModerationDAO"("status");

-- CreateIndex
CREATE INDEX "ModerationDAO_deadline_idx" ON "ModerationDAO"("deadline");

-- CreateIndex
CREATE INDEX "ModerationDAO_contentType_contentId_idx" ON "ModerationDAO"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "ModerationVote_daoId_idx" ON "ModerationVote"("daoId");

-- CreateIndex
CREATE INDEX "ModerationVote_voterId_idx" ON "ModerationVote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "ModerationVote_daoId_voterId_key" ON "ModerationVote"("daoId", "voterId");

-- AddForeignKey
ALTER TABLE "TrustBlock" ADD CONSTRAINT "TrustBlock_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockValidation" ADD CONSTRAINT "BlockValidation_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "TrustBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockValidation" ADD CONSTRAINT "BlockValidation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "TrustBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVote" ADD CONSTRAINT "ProposalVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalVote" ADD CONSTRAINT "ProposalVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalComment" ADD CONSTRAINT "ProposalComment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalComment" ADD CONSTRAINT "ProposalComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalComment" ADD CONSTRAINT "ProposalComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProposalComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationDAO" ADD CONSTRAINT "ModerationDAO_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationVote" ADD CONSTRAINT "ModerationVote_daoId_fkey" FOREIGN KEY ("daoId") REFERENCES "ModerationDAO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationVote" ADD CONSTRAINT "ModerationVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

