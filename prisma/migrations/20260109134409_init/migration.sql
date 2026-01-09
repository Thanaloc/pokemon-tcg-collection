-- CreateTable
CREATE TABLE "pokemon" (
    "id" INTEGER NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "set_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "image_fr" TEXT,
    "image_en" TEXT,
    "image_small_fr" TEXT,
    "image_small_en" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "card_id" TEXT NOT NULL,
    "tcgplayer_price" DOUBLE PRECISION,
    "cardmarket_price" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_collections" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prices_card_id_key" ON "prices"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_collections_user_id_card_id_key" ON "user_collections"("user_id", "card_id");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collections" ADD CONSTRAINT "user_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collections" ADD CONSTRAINT "user_collections_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
