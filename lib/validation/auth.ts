import { z } from 'zod';

// Mots de passe trop courants (liste courte, à élargir si besoin).
// Source : top breaches publiques.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'passw0rd',
  'motdepasse', 'motdepasse1', 'motdepasse123',
  'qwerty', 'qwerty123', 'qwertyuiop',
  'azerty', 'azerty123', 'azertyuiop',
  '123456', '1234567', '12345678', '123456789', '1234567890',
  '0123456789', 'abcdefghij', 'abcdefgh',
  'iloveyou', 'admin', 'admin123', 'administrator',
  'welcome', 'welcome123', 'letmein', 'letmein123',
  'monkey', 'dragon', 'football', 'baseball',
  'master', 'sunshine', 'princess', 'shadow',
  'pokemon', 'pokemon123', 'pikachu', 'pikachu123',
  'charizard', 'mewtwo', 'eevee', 'bulbasaur',
]);

export const passwordSchema = z
  .string()
  .min(10, 'Le mot de passe doit contenir au moins 10 caractères')
  .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères')
  .refine((pwd) => !COMMON_PASSWORDS.has(pwd.toLowerCase()), {
    message: 'Ce mot de passe est trop courant, choisissez-en un autre',
  });

export const registerSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .max(254, 'Email trop long')
    .toLowerCase()
    .trim(),
  password: passwordSchema,
  name: z
    .string()
    .trim()
    .min(1)
    .max(100, 'Nom trop long')
    .optional()
    .nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;