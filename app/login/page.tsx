'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Alert, AuthShell, Field, PasswordField, Spinner, inputClass, primaryButtonClass } from '@/components/Auth/AuthUI';

const SUCCESS_MESSAGES: Record<string, string> = {
  registered: 'Compte créé avec succès ! Connectez-vous pour accéder à votre collection.',
  verified: 'Email vérifié ! Vous pouvez maintenant vous connecter.',
  reset: 'Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.',
  password_changed: 'Mot de passe modifié. Reconnectez-vous sur vos appareils.',
};

// Only same-site relative paths, to avoid open redirects.
function safeCallbackUrl(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
  const successKey = Object.keys(SUCCESS_MESSAGES).find(key => searchParams.has(key));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.code === 'email_not_verified') {
        setUnverifiedEmail(email);
      } else if (result?.code === 'rate_limited') {
        setError('Trop de tentatives de connexion. Réessayez dans quelques minutes.');
      } else if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Une erreur est survenue, réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendState('sending');
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
    } finally {
      setResendState('sent');
    }
  };

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre collection Pokémon"
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-white hover:underline underline-offset-2 font-medium">
            Créer un compte
          </Link>
        </>
      }
    >
      {successKey && <Alert tone="success">{SUCCESS_MESSAGES[successKey]}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {unverifiedEmail && (
        <Alert tone="info">
          <p className="font-medium">Confirmez votre adresse email avant de vous connecter.</p>
          <p className="mt-1 text-sky-100/80">Cliquez sur le lien reçu par email (pensez aux spams).</p>
          {resendState === 'sent' ? (
            <p className="mt-2 text-green-300">Un nouveau lien vient d&apos;être envoyé.</p>
          ) : (
            <button
              type="button"
              onClick={resendVerification}
              disabled={resendState === 'sending'}
              className="mt-2 font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-2 disabled:opacity-60"
            >
              {resendState === 'sending' ? 'Envoi…' : 'Renvoyer le lien'}
            </button>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="email" label="Email" icon={Mail}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass}
            placeholder="votre@email.com"
          />
        </Field>

        <div>
          <PasswordField
            id="password"
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-white transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? <Spinner label="Connexion..." /> : 'Se connecter'}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen" />
    }>
      <LoginForm />
    </Suspense>
  );
}
