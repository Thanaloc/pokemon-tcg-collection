-- CreateEnum
CREATE TYPE "price_confidence" AS ENUM ('HIGH', 'LOW');

-- CreateTable
CREATE TABLE "price_history" (
    "id" SERIAL NOT NULL,
    "card_id" TEXT NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardmarket_price" DOUBLE PRECISION NOT NULL,
    "confidence" "price_confidence" NOT NULL DEFAULT 'HIGH',

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinned_cards" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_history_card_id_snapshot_at_idx" ON "price_history"("card_id", "snapshot_at");

-- CreateIndex
CREATE INDEX "pinned_cards_user_id_idx" ON "pinned_cards"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pinned_cards_user_id_card_id_key" ON "pinned_cards"("user_id", "card_id");

-- CreateIndex
CREATE INDEX "cards_pokemon_id_idx" ON "cards"("pokemon_id");

-- CreateIndex
CREATE INDEX "cards_set_id_idx" ON "cards"("set_id");

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_cards" ADD CONSTRAINT "pinned_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_cards" ADD CONSTRAINT "pinned_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
