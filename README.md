# pokemon-tcg-collection

Every Pokémon, with every card printed for it (French cards from [TCGdex](https://tcgdex.dev)),
their Cardmarket price, a personal collection and price tracking for followed cards.

Next.js 16 · Auth.js v5 (credentials) · Prisma 7 / PostgreSQL · Upstash (rate limit) · Resend (emails) · Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill it
npx prisma migrate deploy
npm run seed                 # Pokémon + full TCGdex catalogue (long, one-off)
npm run dev
```

See `.env.example` for every variable. Email verification and password reset only
switch on once `RESEND_API_KEY` is set; before that, signup behaves as it always did.

## Data sync

| What | How |
| --- | --- |
| `/api/cron/update` (daily, 03:00 UTC) | New sets/cards, set metadata, then refreshes the prices checked the longest ago until the time budget is spent. Each run resumes where the previous one stopped. |
| `/api/cron/snapshot-prices` (daily, 05:00 UTC) | Price history for pinned cards (dashboard charts). |
| `npm run update` | Same as the cron without time limit. `-- --no-prices` for the catalogue only, `-- --all-prices` to refresh every price. |
| `npm run rarities` | Lists rarities in the database and flags those missing from `constants/rarities.ts` (the cron also returns them as `unknownRarities`). |
| `npm run cleanup:pocket` | Lists Pokémon TCG Pocket sets present in the database; `-- --apply` deletes them. |

Trigger the cron by hand: `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/update`.

TCG Pocket sets are excluded through their TCGdex serie (`tcgp`) and set id pattern
(`A1`, `B2a`, `P-A`...).
