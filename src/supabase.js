// 使用模拟数据进行前端演示
// 注释掉真实的 Supabase 连接
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
// const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 使用模拟客户端
export { supabase } from './mockSupabase';