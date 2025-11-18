// 真实的 Supabase 连接
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fnolufchqnyjxymamqbn.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2x1ZmNocW55anh5bWFtcWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDgzOTcsImV4cCI6MjA3OTAyNDM5N30.GfmmQaWQko5cefRwLlE9-vtXi50gzjYBrrDkwJpPnS0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);