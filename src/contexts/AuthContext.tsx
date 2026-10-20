import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  // Local demo switcher for preview when Supabase env vars are not yet added
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = async (userId: string, email: string, userMeta?: Record<string, any>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Fallback to user metadata if trigger hasn't fired yet
        const metaRole = (userMeta?.role as UserRole) || 'admin';
        const metaName = userMeta?.full_name || email.split('@')[0];
        setProfile({
          id: userId,
          email,
          full_name: metaName,
          phone: userMeta?.phone || '',
          role: metaRole,
        });
      } else {
        setProfile({
          id: data.id,
          email: data.email || email,
          full_name: data.full_name || email.split('@')[0],
          phone: data.phone || userMeta?.phone || '',
          role: (data.role as UserRole) || 'admin',
        });
      }
    } catch {
      setProfile({
        id: userId,
        email,
        full_name: email.split('@')[0],
        phone: userMeta?.phone || '',
        role: 'admin',
      });
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      // In offline/demo mode without active Supabase keys, check if user previously signed in
      const savedSession = localStorage.getItem('albatross_demo_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed?.user && parsed?.profile) {
            setUser(parsed.user);
            setProfile(parsed.profile);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch {
          localStorage.removeItem('albatross_demo_session');
          setUser(null);
          setProfile(null);
        }
      } else {
        // Do not auto-login: show login screen
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
      return;
    }

    // Live Supabase Mode
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    // 2. Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '', session.user.user_metadata);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signInWithPassword = async (email: string, password: string) => {
    if (!isConfigured) {
      // Local Demo authentication simulation
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { error: new Error('Please enter a valid email address.') };
      }
      if (!password) {
        return { error: new Error('Please enter your password.') };
      }

      const role: UserRole =
        cleanEmail.includes('super') ||
        cleanEmail.includes('owner') ||
        cleanEmail.includes('tamjid')
          ? 'super_admin'
          : 'admin';

      const mockUser = {
        id: `local-${role}`,
        email: cleanEmail,
        user_metadata: { role, full_name: role === 'super_admin' ? 'Tamjid (Super Admin)' : 'Staff Admin' },
      } as unknown as User;

      const mockProfile: UserProfile = {
        id: `local-${role}`,
        email: cleanEmail,
        full_name: role === 'super_admin' ? 'Tamjid (Super Admin)' : 'Staff Admin',
        role,
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('albatross_demo_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        return { error: new Error(error.message) };
      }
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email || '', data.user.user_metadata);
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Network error while contacting Supabase Auth.') };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('SignOut error:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('albatross_demo_session');
    localStorage.removeItem('albatross_demo_role');
  };

  const setDemoUser = (role: UserRole) => {
    const mockUser = {
      id: `demo-${role}`,
      email: `${role}@albatross.com`,
      user_metadata: { role, full_name: role === 'super_admin' ? 'Tamjid (Super Admin)' : 'Staff Member (Admin)' },
    } as unknown as User;

    const mockProfile: UserProfile = {
      id: `demo-${role}`,
      email: `${role}@albatross.com`,
      full_name: role === 'super_admin' ? 'Tamjid (Super Admin)' : 'Staff Member (Admin)',
      role,
    };

    setUser(mockUser);
    setProfile(mockProfile);
    localStorage.setItem('albatross_demo_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured,
        signInWithPassword,
        signOut,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
