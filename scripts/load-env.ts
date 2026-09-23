// Imported first by every script so that lib/prisma sees DATABASE_URL.
// Same precedence as prisma.config.ts: .env.local wins over .env.
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });
