'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon, ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasMatch: password.length > 0 && password === confirmPassword,
  };

  const isPasswordValid = passwordRequirements.minLength;
  const isFormValid = email && isPasswordValid && passwordRequirements.hasMatch;

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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError('Une erreur est survenue lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l34.64 20v40L40 80 5.36 60V20z' fill='none' stroke='%23ef4444' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: "70px 70px",
        }}></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Pokeball */}
        <div className="flex justify-center mb-8">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-white to-red-500 opacity-80" style={{ animation: 'spin 3s linear infinite' }}></div>
            <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg"></div>
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-900 transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full border-2 border-slate-900 bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-slate-800/60 rounded-2xl shadow-2xl border border-red-500/20 p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-orange-400 mb-2">
              Inscription
            </h1>
            <p className="text-slate-400 text-sm">Créez votre compte pour gérer votre collection</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nom <span className="text-slate-500 font-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 
                           bg-slate-900/50 border border-slate-700/50 rounded-xl 
                           text-white placeholder-slate-500 
                           focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
                           transition-all duration-200"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 
                           bg-slate-900/50 border border-slate-700/50 rounded-xl 
                           text-white placeholder-slate-500 
                           focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
                           transition-all duration-200"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 
                           bg-slate-900/50 border border-slate-700/50 rounded-xl 
                           text-white placeholder-slate-500 
                           focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
                           transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password requirements */}
              {password && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    {passwordRequirements.minLength ? (
                      <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-slate-500" />
                    )}
                    <span className={passwordRequirements.minLength ? 'text-green-400' : 'text-slate-500'}>
                      Minimum 8 caractères
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 
                           bg-slate-900/50 border border-slate-700/50 rounded-xl 
                           text-white placeholder-slate-500 
                           focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50
                           transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Match indicator */}
              {confirmPassword && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {passwordRequirements.hasMatch ? (
                    <>
                      <CheckCircle2 size={14} className="text-green-400" />
                      <span className="text-green-400">Les mots de passe correspondent</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-400" />
                      <span className="text-red-400">Les mots de passe ne correspondent pas</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3.5 
                       bg-gradient-to-r from-red-600 to-orange-600 
                       hover:from-red-500 hover:to-orange-500
                       disabled:from-red-600/50 disabled:to-orange-600/50
                       text-white font-bold rounded-xl 
                       shadow-lg hover:shadow-xl hover:shadow-red-500/30
                       transform hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200
                       disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Création...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-center text-slate-400 text-sm">
              Déjà un compte ?{' '}
              <Link 
                href="/login" 
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}