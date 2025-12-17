import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export const createClient = (): SupabaseClient<Database> => {
  return createClientComponentClient<Database>() as unknown as SupabaseClient<Database>
}
