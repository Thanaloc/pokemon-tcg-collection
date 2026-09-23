'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Alert, AuthShell, PasswordField, Spinner, primaryButtonClass } from '@/components/Auth/AuthUI';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/password-rules';

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }
      router.push('/login?reset=1');
    } catch {
      setError('Une erreur est survenue, réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Alert tone="error">
        Lien incomplet. <Link href="/forgot-password" className="underline">Faites une nouvelle demande</Link>.
      </Alert>
    );
  }

  return (
    <>
      {error && <Alert tone="error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          id="password"
          label={`Nouveau mot de passe (${PASSWORD_MIN_LENGTH} caractères min.)`}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? <Spinner label="Enregistrement..." /> : 'Changer mon mot de passe'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Vous serez déconnecté de tous vos appareils">
      <Suspense fallback={<p className="text-center text-slate-400">Chargement...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
