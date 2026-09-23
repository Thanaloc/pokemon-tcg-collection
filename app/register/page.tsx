'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, User as UserIcon, CheckCircle2, XCircle, MailCheck } from 'lucide-react';
import { Alert, AuthShell, Field, PasswordField, Spinner, inputClass, primaryButtonClass } from '@/components/Auth/AuthUI';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/password-rules';

function Requirement({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-slate-500" />}
      <span className={ok ? 'text-green-400' : 'text-slate-500'}>{children}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);

  const hasMinLength = password.length >= PASSWORD_MIN_LENGTH;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = email && hasMinLength && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Veuillez remplir tous les champs correctement');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      if (data.requiresVerification) {
        setPendingVerification(email);
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('Une erreur est survenue lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <AuthShell title="Vérifiez vos emails">
        <div className="text-center space-y-4">
          <MailCheck size={36} className="mx-auto text-slate-400" />
          <p className="text-slate-200">
            Un lien de confirmation a été envoyé à{' '}
            <strong className="text-white break-all">{pendingVerification}</strong>.
          </p>
          <p className="text-slate-400 text-sm">
            Cliquez dessus pour activer votre compte. Il expire dans 24 heures.
            Rien reçu ? Vérifiez vos spams, ou tentez de vous connecter pour en demander un nouveau.
          </p>
          <Link href="/login" className={`${primaryButtonClass} block`}>
            Aller à la connexion
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Inscription"
      subtitle="Créez votre compte pour gérer votre collection"
      footer={
        <>
          Déjà un compte ?{' '}
          <Link href="/login" className="text-white hover:underline underline-offset-2 font-medium">
            Se connecter
          </Link>
        </>
      }
    >
      {error && <Alert tone="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field id="name" label={<>Nom <span className="text-slate-500 font-normal">(optionnel)</span></>} icon={UserIcon}>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="nickname"
            className={inputClass}
            placeholder="Votre nom"
          />
        </Field>

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
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
          />
          {password && (
            <div className="mt-3 space-y-1.5">
              <Requirement ok={hasMinLength}>Minimum {PASSWORD_MIN_LENGTH} caractères</Requirement>
            </div>
          )}
        </div>

        <div>
          <PasswordField
            id="confirmPassword"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          {confirmPassword && (
            <div className="mt-3">
              {passwordsMatch ? (
                <Requirement ok>Les mots de passe correspondent</Requirement>
              ) : (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <XCircle size={14} />
                  <span>Les mots de passe ne correspondent pas</span>
                </div>
              )}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !isFormValid} className={primaryButtonClass}>
          {loading ? <Spinner label="Création..." /> : 'Créer mon compte'}
        </button>
      </form>
    </AuthShell>
  );
}
