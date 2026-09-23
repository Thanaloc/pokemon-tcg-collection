'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Alert, AuthShell, Field, Spinner, inputClass, primaryButtonClass } from '@/components/Auth/AuthUI';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Une erreur est survenue');
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setError('Une erreur est survenue, réessayez.');
      setStatus('idle');
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Recevez un lien pour en choisir un nouveau"
      footer={
        <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
          Retour à la connexion
        </Link>
      }
    >
      {status === 'sent' ? (
        <Alert tone="success">
          Si un compte existe pour <strong className="break-all">{email}</strong>, un email vient
          d&apos;être envoyé. Le lien est valable 1 heure (pensez à vérifier vos spams).
        </Alert>
      ) : (
        <>
          {error && <Alert tone="error">{error}</Alert>}
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
            <button type="submit" disabled={status === 'loading'} className={primaryButtonClass}>
              {status === 'loading' ? <Spinner label="Envoi..." /> : 'Envoyer le lien'}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
