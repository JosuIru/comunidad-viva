-- DropForeignKey
ALTER TABLE "TrustBlock" DROP CONSTRAINT "TrustBlock_actorId_fkey";

-- DropForeignKey
ALTER TABLE "BlockValidation" DROP CONSTRAINT "BlockValidation_blockId_fkey";

-- DropForeignKey
ALTER TABLE "BlockValidation" DROP CONSTRAINT "BlockValidation_validatorId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_blockId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalVote" DROP CONSTRAINT "ProposalVote_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalVote" DROP CONSTRAINT "ProposalVote_voterId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalComment" DROP CONSTRAINT "ProposalComment_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalComment" DROP CONSTRAINT "ProposalComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalComment" DROP CONSTRAINT "ProposalComment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationDAO" DROP CONSTRAINT "ModerationDAO_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationVote" DROP CONSTRAINT "ModerationVote_daoId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationVote" DROP CONSTRAINT "ModerationVote_voterId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "voteCredits";

-- DropTable
DROP TABLE "TrustBlock";

-- DropTable
DROP TABLE "BlockValidation";

-- DropTable
DROP TABLE "Proposal";

-- DropTable
DROP TABLE "ProposalVote";

-- DropTable
DROP TABLE "ProposalComment";

-- DropTable
DROP TABLE "ModerationDAO";

-- DropTable
DROP TABLE "ModerationVote";

-- DropEnum
DROP TYPE "BlockType";

-- DropEnum
DROP TYPE "BlockStatus";

-- DropEnum
DROP TYPE "ValidationDecision";

-- DropEnum
DROP TYPE "ProposalType";

-- DropEnum
DROP TYPE "ProposalStatus";

-- DropEnum
DROP TYPE "ContentType";

-- DropEnum
DROP TYPE "DAOStatus";

-- DropEnum
DROP TYPE "ModerationDecision";

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 6.16.3                      │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
