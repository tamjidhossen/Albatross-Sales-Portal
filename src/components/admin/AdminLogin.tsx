import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onBackToLanding?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = () => {
  const { signInWithPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const { error } = await signInWithPassword(email, password);
      if (error) {
        setErrorMsg(error.message);
      }
    } catch {
      setErrorMsg('Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center px-4 py-8 text-zinc-900 font-sans">
      
      {/* Main Login Card (Pure & Simple) */}
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-zinc-200">
        
        {/* Brand Centerpiece */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full border-2 border-orange-500/20 mx-auto overflow-hidden shadow-xs mb-3 p-0.5 bg-orange-50">
            <img 
              src="/assets/images/logo.jpeg" 
              alt="Albatross" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900">
            Albatross Portal
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Food Cart Daily Operations & Reconciliations
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-xs text-red-700 animate-in fade-in duration-150">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@albatross.com"
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3.5 py-2.5 pl-9 text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none transition"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3.5 py-2.5 pl-9 pr-9 text-zinc-900 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition active:scale-98 shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Sign In'}</span>
          </button>
        </form>

      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-[11px] text-zinc-400 text-center">
        Albatross Food Cart Operations • Circuit House Field, Joypurhat
      </div>

    </div>
  );
};
