import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://heonoxmhirnaufwvcrgw.supabase.co'
const supabaseAnonKey = 'sb_publishable_V22kJZGD3SrfziALEBE_7A_tSFCLBuL'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)