import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from './password-rules';

export { PASSWORD_MIN_LENGTH };

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
  .min(PASSWORD_MIN_LENGTH, `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`)
  .max(128, 'Le mot de passe ne doit pas dépasser 128 caractères')
  .refine((pwd) => !COMMON_PASSWORDS.has(pwd.toLowerCase()), {
    message: 'Ce mot de passe est trop courant, choisissez-en un autre',
  });

// trim/lowercase run before the format check (zod applies them in order).
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Email invalide')
  .max(254, 'Email trop long');

const nameSchema = z
  .string()
  .trim()
  .max(100, 'Nom trop long')
  .transform((name) => name || null)
  .optional()
  .nullable();

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const emailOnlySchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(200),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis').max(128),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({ name: nameSchema });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis').max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** First zod issue as the `{ error, field }` body the forms expect. */
export function firstIssue(error: z.ZodError) {
  const issue = error.issues[0];
  // Root-level issues (body not an object) carry zod's English message.
  if (issue.path.length === 0) return { error: 'Requête invalide', field: null };
  return { error: issue.message, field: issue.path[0] };
}
