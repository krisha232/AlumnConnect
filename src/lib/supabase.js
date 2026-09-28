import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);
export const supabase = isConfigured ? createClient(url, key) : null;

export const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'School Connect';
export const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || 'Our School';

// Profile columns members are allowed to read (never use '*' on profiles).
export const PROFILE_COLS = 'id, full_name, role, batch_year, is_admin, status, headline, bio, location, university, avatar_path, created_at';
export const AUTHOR_COLS = 'id, full_name, role, batch_year, avatar_path';
