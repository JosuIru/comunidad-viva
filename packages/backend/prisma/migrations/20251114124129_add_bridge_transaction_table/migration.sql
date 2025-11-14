-- CreateEnum
CREATE TYPE "BridgeDirection" AS ENUM ('LOCK', 'UNLOCK');

-- CreateEnum
CREATE TYPE "BridgeChain" AS ENUM ('POLYGON', 'SOLANA', 'OTHER');

-- CreateEnum
CREATE TYPE "BridgeStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "BridgeTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userDID" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "direction" "BridgeDirection" NOT NULL,
    "targetChain" "BridgeChain" NOT NULL,
    "externalAddress" TEXT NOT NULL,
    "externalTxHash" TEXT,
    "internalTxId" TEXT,
    "status" "BridgeStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BridgeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BridgeTransaction_createdAt_idx" ON "BridgeTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "BridgeTransaction_externalTxHash_idx" ON "BridgeTransaction"("externalTxHash");

-- CreateIndex
CREATE INDEX "BridgeTransaction_status_idx" ON "BridgeTransaction"("status");

-- CreateIndex
CREATE INDEX "BridgeTransaction_targetChain_idx" ON "BridgeTransaction"("targetChain");

-- CreateIndex
CREATE INDEX "BridgeTransaction_userDID_idx" ON "BridgeTransaction"("userDID");

-- CreateIndex
CREATE INDEX "BridgeTransaction_userId_idx" ON "BridgeTransaction"("userId");

-- AddForeignKey
ALTER TABLE "BridgeTransaction" ADD CONSTRAINT "BridgeTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
