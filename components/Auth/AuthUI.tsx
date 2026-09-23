'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react';

export const inputClass = `w-full pl-10 pr-4 py-2.5
  bg-slate-950 border border-slate-800 rounded-md
  text-white placeholder-slate-600
  focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-red-500/30
  transition-colors`;

export const primaryButtonClass = `w-full py-2.5
  bg-red-600 hover:bg-red-500 disabled:bg-red-600/50
  text-white text-center font-medium rounded-md
  transition-colors disabled:cursor-not-allowed`;

export function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {label}
    </span>
  );
}

const ALERT_STYLES = {
  error: { box: 'bg-red-500/10 border-red-500/30 text-red-200', icon: AlertCircle, iconClass: 'text-red-400' },
  success: { box: 'bg-green-500/10 border-green-500/30 text-green-200', icon: CheckCircle2, iconClass: 'text-green-400' },
  info: { box: 'bg-sky-500/10 border-sky-500/30 text-sky-100', icon: Info, iconClass: 'text-sky-300' },
} as const;

export function Alert({ tone, children }: { tone: keyof typeof ALERT_STYLES; children: React.ReactNode }) {
  const { box, icon: Icon, iconClass } = ALERT_STYLES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-5 border rounded-md px-3.5 py-3 flex items-start gap-3 text-sm ${box}`}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconClass}`} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: React.ReactNode;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function Field({ id, label, icon: Icon, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}

export function PasswordField({ id, label, value, onChange, autoComplete, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} icon={Lock}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${inputClass} pr-12`}
        placeholder="••••••••••"
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </Field>
  );
}

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Logo and card shared by every auth page. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-7">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
          </div>

          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-slate-400 text-sm">
            {footer}
          </div>
        )}

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
