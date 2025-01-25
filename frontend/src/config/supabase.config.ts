import { createClient } from '@supabase/supabase-js';

// Your Supabase URL and anon key can be found in your project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);