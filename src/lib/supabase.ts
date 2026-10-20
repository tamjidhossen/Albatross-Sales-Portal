import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sximqzpcrwodvcgkpevb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nVUTv5-6-XQg58T5aTHDWQ_hBgLxlXR';

export const isSupabaseConfigured = () => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface StaffAccountParams {
  email: string;
  phone?: string;
  password: string;
  fullName: string;
  role: 'admin' | 'super_admin';
}

/**
 * Allows an authenticated Super Admin to register a new staff account
 * with phone, email, and password without losing the current session.
 */
export const createStaffAccount = async (params: StaffAccountParams) => {
  if (!isSupabaseConfigured()) {
    // In local preview mode, store in localStorage
    const saved = JSON.parse(localStorage.getItem('albatross_mock_staff_users') || '[]');
    const newUser = {
      id: `local-user-${Date.now()}`,
      email: params.email.trim(),
      phone: params.phone?.trim() || '',
      full_name: params.fullName.trim(),
      role: params.role,
      created_at: new Date().toISOString()
    };
    saved.unshift(newUser);
    localStorage.setItem('albatross_mock_staff_users', JSON.stringify(saved));
    return { data: newUser, error: null };
  }

  // Create isolated non-persistent Supabase client to preserve current Super Admin session
  const isolatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await isolatedClient.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        full_name: params.fullName.trim(),
        phone: params.phone?.trim() || '',
        role: params.role,
      },
    },
  });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
};

export const fetchStaffProfiles = async () => {
  if (!isSupabaseConfigured()) {
    const saved = JSON.parse(localStorage.getItem('albatross_mock_staff_users') || '[]');
    return { data: saved, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data || [], error: error ? new Error(error.message) : null };
};
