import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { consumeVerificationToken } from '@/lib/auth-tokens';
import { Alert, AuthShell } from '@/components/Auth/AuthUI';

export const metadata = { title: 'Vérification de l’email — Pokémon TCG Collection' };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const email = token ? await consumeVerificationToken(token) : null;

  if (email) {
    await prisma.user.updateMany({
      where: { email, emailVerified: null },
      data: { emailVerified: new Date() },
    });
    redirect('/login?verified=1');
  }

  return (
    <AuthShell title="Lien invalide">
      <Alert tone="error">
        Ce lien de vérification est invalide, a déjà été utilisé ou a expiré.
      </Alert>
      <p className="text-slate-400 text-sm text-center">
        Essayez de vous connecter : si votre email n&apos;est pas encore confirmé, vous pourrez
        demander un nouveau lien.
      </p>
      <Link
        href="/login"
        className="mt-6 block text-center text-white hover:underline underline-offset-2 font-medium"
      >
        Aller à la connexion
      </Link>
    </AuthShell>
  );
}
