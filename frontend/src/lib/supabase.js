import { createClient } from '@supabase/supabase-js'

// Usa só a chave pública (anon / publishable). A secret key fica apenas no back-end.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)