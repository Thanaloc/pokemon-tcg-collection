'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Download, Trash2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/app/contexts/ToastContext';
import { Alert, Field, PasswordField, Spinner, inputClass } from '@/components/Auth/AuthUI';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/password-rules';

const buttonClass = `px-5 py-2.5 rounded-xl font-bold text-sm text-white
  bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500
  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`;

function Section({ title, description, children, danger = false }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-xl ${danger ? 'bg-red-950/30 border-red-500/40' : 'bg-slate-800/60 border-red-500/20'}`}>
      <h2 className={`text-lg font-bold ${danger ? 'text-red-300' : 'text-white'}`}>{title}</h2>
      {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue');
  return data;
}

function ProfileForm({ email, initialName }: { email: string; initialName: string }) {
  const { update, status } = useSession();
  const { showToast } = useToast();
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await send('/api/account', 'PATCH', { name });
      setSavedName(name);
      // Any payload makes it a POST, which triggers a re-read of the user in the
      // jwt callback (update() is a no-op while the session is still loading,
      // hence the disabled button).
      await update({});
      showToast('Profil mis à jour', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="block text-sm font-medium text-slate-300 mb-2">Email</p>
        <p className="text-white bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-3 break-all">{email}</p>
      </div>
      <Field id="name" label="Nom affiché" icon={UserIcon}>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className={inputClass}
          placeholder="Votre nom"
        />
      </Field>
      <button type="submit" disabled={saving || status === 'loading' || name === savedName} className={buttonClass}>
        {saving ? <Spinner label="Enregistrement..." /> : 'Enregistrer'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setSaving(true);
    try {
      await send('/api/account/password', 'POST', { currentPassword, newPassword });
      // The session version was bumped: every device, this one included, is logged out.
      await signOut({ callbackUrl: '/login?password_changed=1' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <PasswordField id="currentPassword" label="Mot de passe actuel" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
      <PasswordField id="newPassword" label={`Nouveau mot de passe (${PASSWORD_MIN_LENGTH} caractères min.)`} value={newPassword} onChange={setNewPassword} autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} />
      <PasswordField id="confirmNewPassword" label="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
      <button type="submit" disabled={saving} className={buttonClass}>
        {saving ? <Spinner label="Modification..." /> : 'Changer le mot de passe'}
      </button>
    </form>
  );
}

function DeleteAccountForm() {
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDeleting(true);
    try {
      await send('/api/account', 'DELETE', { password });
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <PasswordField id="deletePassword" label="Mot de passe" value={password} onChange={setPassword} autoComplete="current-password" />
      <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-red-600"
        />
        Je comprends que ma collection, mes cartes suivies et mon compte seront supprimés définitivement.
      </label>
      <button
        type="submit"
        disabled={deleting || !confirmed || !password}
        className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <Trash2 size={16} />
        {deleting ? 'Suppression...' : 'Supprimer mon compte'}
      </button>
    </form>
  );
}

export default function AccountClient({ email, initialName }: { email: string; initialName: string }) {
  return (
    <div className="space-y-6">
      <Section title="Profil">
        <ProfileForm email={email} initialName={initialName} />
      </Section>

      <Section title="Mot de passe" description="Vous serez déconnecté de tous vos appareils après le changement.">
        <PasswordForm />
      </Section>

      <Section title="Mes données" description="Téléchargez tout ce que nous stockons sur vous : compte, collection et cartes suivies (format JSON).">
        <a
          href="/api/account/export"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          <Download size={16} />
          Exporter mes données
        </a>
      </Section>

      <Section title="Supprimer mon compte" description="Action irréversible." danger>
        <DeleteAccountForm />
      </Section>
    </div>
  );
}
