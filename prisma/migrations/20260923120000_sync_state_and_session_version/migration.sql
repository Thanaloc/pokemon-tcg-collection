-- AlterTable
ALTER TABLE "sets" ADD COLUMN     "synced_card_count" INTEGER;

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "price_checked_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "session_version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "cards_price_checked_at_idx" ON "cards"("price_checked_at");
