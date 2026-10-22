import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Kiểm tra xem cấu hình Supabase đã sẵn sàng và hợp lệ hay chưa.
 * Trả về false nếu là URL mẫu ("your-project.supabase.co") hoặc chưa điền key.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project.supabase.co')) return false;
  if (supabaseAnonKey.includes('your-anon-key')) return false;
  return true;
};

let clientInstance: SupabaseClient | null = null;

/**
 * Khởi tạo client Supabase với cơ chế crash-proof (không bao giờ gây sập ứng dụng khi mất kết nối).
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.warn('Lớp Mình: Supabase client initialization fallback to isolated local tenant mode:', err);
      return null;
    }
  }

  return clientInstance;
};
