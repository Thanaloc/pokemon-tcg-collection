'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Info, Eye, EyeOff, Lock, type LucideIcon } from 'lucide-react';

export const inputClass = `w-full pl-12 pr-4 py-3
  bg-slate-900/50 border border-slate-700/50 rounded-xl
  text-white placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
  transition-all duration-200`;

export const primaryButtonClass = `w-full py-3.5
  bg-gradient-to-r from-red-600 to-orange-600
  hover:from-red-500 hover:to-orange-500
  disabled:from-red-600/50 disabled:to-orange-600/50
  text-white font-bold rounded-xl
  shadow-lg hover:shadow-xl hover:shadow-red-500/30
  transform hover:scale-[1.02] active:scale-[0.98]
  transition-all duration-200
  disabled:cursor-not-allowed disabled:transform-none`;

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
    <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-6 border rounded-xl px-4 py-3 flex items-start gap-3 text-sm ${box}`}>
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
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
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

/** Background, Poké Ball logo and card shared by every auth page. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill='none' stroke='%23ef4444' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: '70px 70px',
        }}></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-8" aria-label="Accueil">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-white to-red-500 opacity-80" style={{ animation: 'spin 3s linear infinite' }}></div>
            <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full border-2 border-slate-900 bg-white -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </Link>

        <div className="backdrop-blur-xl bg-slate-800/60 rounded-2xl shadow-2xl border border-red-500/20 p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 mb-2">
              {title}
            </h1>
            {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
          </div>

          {children}

          {footer && (
            <div className="mt-6 pt-6 border-t border-slate-700/50 text-center text-slate-400 text-sm">
              {footer}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
