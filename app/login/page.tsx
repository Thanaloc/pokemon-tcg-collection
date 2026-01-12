'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const verified = searchParams.get('verified');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(!!registered || !!verified);

  useEffect(() => {
    if (registered || verified) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        window.history.replaceState({}, '', '/login');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [registered, verified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Une erreur est survenue');
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
              Connexion
            </h1>
            <p className="text-slate-400 text-sm">Accédez à votre collection Pokémon</p>
          </div>

          {/* Success message */}
          {showSuccess && (registered || verified) && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-200 font-medium text-sm">
                  {registered && 'Compte créé avec succès !'}
                  {verified && 'Email vérifié avec succès !'}
                </p>
                <p className="text-green-300/70 text-xs mt-1">Connectez-vous pour accéder à votre collection</p>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
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
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-center text-slate-400 text-sm">
              Pas encore de compte ?{' '}
              <Link 
                href="/register" 
                className="text-red-400 hover:text-red-300 font-semibold transition-colors"
              >
                Créer un compte
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}