-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CreditReason" ADD VALUE 'OFFER_CREATED';
ALTER TYPE "CreditReason" ADD VALUE 'REVIEW';
ALTER TYPE "CreditReason" ADD VALUE 'PURCHASE';
ALTER TYPE "CreditReason" ADD VALUE 'DISCOUNT';
ALTER TYPE "CreditReason" ADD VALUE 'SERVICE';
ALTER TYPE "CreditReason" ADD VALUE 'EVENT_ACCESS';
ALTER TYPE "CreditReason" ADD VALUE 'ADJUSTMENT';
