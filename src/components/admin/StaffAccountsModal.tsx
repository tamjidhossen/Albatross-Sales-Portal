import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { createStaffAccount, fetchStaffProfiles } from '../../lib/supabase';
import { Role } from '../../types';

interface StaffAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export const StaffAccountsModal: React.FC<StaffAccountsModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('admin');
  const [showPassword, setShowPassword] = useState(false);
  
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadProfiles = async () => {
    setIsLoadingList(true);
    try {
      const { data, error } = await fetchStaffProfiles();
      if (!error && data) {
        setProfiles(data);
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await createStaffAccount({
        fullName: fullName.trim() || email.split('@')[0],
        phone: phone.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(`Account created successfully for ${fullName || email}! They can now log in.`);
        setFullName('');
        setPhone('');
        setEmail('');
        setPassword('');
        loadProfiles();
      }
    } catch {
      setErrorMsg('Failed to create account. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xl space-y-4 font-sans text-xs max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                Staff & Team Accounts
              </h3>
              <p className="text-[10px] text-zinc-500">
                Super Admin Privilege • Create & manage cart login access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'create'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
              activeTab === 'list'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Existing Accounts ({profiles.length})</span>
          </button>
        </div>

        {/* Tab 1: Create Account Form */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateAccount} className="space-y-3 overflow-y-auto pr-1">
            
            {/* Success Banner */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-800 text-[11px] font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">{successMsg}</div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 text-[11px] font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Staff Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rakib Hossain"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2 pl-8 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none transition"
                />
                <User className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Phone Number (Mobile)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2 pl-8 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none transition"
                />
                <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Login Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rakib@albatross.com"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2 pl-8 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none transition"
                />
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Account Password (Min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3 py-2 pl-8 pr-8 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none transition"
                />
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Role Radio Picker */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Authorization Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`border rounded-xl p-2.5 cursor-pointer flex items-start gap-2 transition ${
                  role === 'admin' 
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 ring-1 ring-orange-500' 
                    : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                }`}>
                  <input
                    type="radio"
                    name="account_role"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="mt-0.5 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-bold text-xs block">Staff Admin</span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">
                      Daily inventory, bazaar, cash counts & lock
                    </span>
                  </div>
                </label>

                <label className={`border rounded-xl p-2.5 cursor-pointer flex items-start gap-2 transition ${
                  role === 'super_admin' 
                    ? 'border-orange-500 bg-orange-50/40 text-orange-950 ring-1 ring-orange-500' 
                    : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                }`}>
                  <input
                    type="radio"
                    name="account_role"
                    checked={role === 'super_admin'}
                    onChange={() => setRole('super_admin')}
                    className="mt-0.5 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-bold text-xs block flex items-center gap-1">
                      <Shield className="w-3 h-3 text-orange-600" />
                      <span>Super Admin</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-tight">
                      Unlock shift & master catalog control
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-98 shadow-xs flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Registering Account...' : 'Create Staff Account'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Existing Accounts List */}
        {activeTab === 'list' && (
          <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-[220px]">
            <div className="flex items-center justify-between pb-1 text-[11px] text-zinc-500">
              <span>All Registered Accounts</span>
              <button
                onClick={loadProfiles}
                disabled={isLoadingList}
                className="hover:text-zinc-900 flex items-center gap-1 font-medium transition"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                No accounts found.
              </div>
            ) : (
              profiles.map((p, idx) => {
                const isCurrent = p.email === currentUserEmail;
                const isSuper = p.role === 'super_admin';
                return (
                  <div
                    key={p.id || idx}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900 truncate">
                          {p.full_name || p.email}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="truncate">{p.email}</span>
                        {p.phone && <span>• {p.phone}</span>}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isSuper
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}>
                        {isSuper && <Shield className="w-2.5 h-2.5 text-orange-400" />}
                        <span>{isSuper ? 'Super Admin' : 'Staff Admin'}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};

