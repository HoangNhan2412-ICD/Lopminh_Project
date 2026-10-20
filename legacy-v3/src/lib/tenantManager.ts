import { TeacherProfile } from '@/types/teacher';
import { Student } from '@/types/student';
import { LessonPlan5512 } from '@/types/lessonPlan';
import { SanctuaryMessage } from '@/types/sanctuary';
import { TENANT_PRESETS, TenantData } from '@/data/tenantPresets';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const ACTIVE_TENANT_KEY = 'lopminh_active_tenant_id';

export class TenantManager {
  /**
   * Lấy ID tài khoản giáo viên đang kích hoạt. Mặc định là Cô Mai Hoa (teacher-mai-hoa).
   */
  public static getActiveTenantId(): string {
    if (typeof window === 'undefined') return 'teacher-mai-hoa';
    try {
      return localStorage.getItem(ACTIVE_TENANT_KEY) || 'teacher-mai-hoa';
    } catch {
      return 'teacher-mai-hoa';
    }
  }

  /**
   * Chuyển đổi tài khoản giáo viên đang đăng nhập.
   * Dữ liệu các học sinh, giáo án, lịch sử tâm tình lập tức được cách ly theo tenant mới.
   */
  public static setActiveTenantId(tenantId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
    } catch (e) {
      console.warn('Could not save active tenant ID:', e);
    }
  }

  /**
   * Lấy toàn bộ danh sách giáo viên có sẵn trong hệ thống Multi-Tenant
   */
  public static getAvailableTenants(): { id: string; name: string; school: string; subject: string; salutation: string; avatarSeed: string }[] {
    return Object.values(TENANT_PRESETS).map(t => ({
      id: t.teacher.id,
      name: t.teacher.fullName,
      school: t.teacher.schoolName,
      subject: `${t.teacher.primarySubject} - ${t.teacher.gradeLevel}`,
      salutation: t.teacher.salutation,
      avatarSeed: t.teacher.id
    }));
  }

  /**
   * Lấy hồ sơ giáo viên được phân vùng riêng cho tenant này.
   */
  public static getTeacherProfile(tenantId: string): TeacherProfile {
    if (typeof window === 'undefined') {
      return TENANT_PRESETS[tenantId]?.teacher || TENANT_PRESETS['teacher-mai-hoa'].teacher;
    }
    try {
      const stored = localStorage.getItem(`lopminh_tenant_${tenantId}_teacher`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading tenant teacher profile:', e);
    }
    return TENANT_PRESETS[tenantId]?.teacher || TENANT_PRESETS['teacher-mai-hoa'].teacher;
  }

  public static saveTeacherProfile(tenantId: string, profile: TeacherProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`lopminh_tenant_${tenantId}_teacher`, JSON.stringify(profile));
      // Tùy chọn đồng bộ Supabase nền nếu đã cấu hình
      this.syncTeacherToSupabase(profile);
    } catch (e) {
      console.warn('Error saving tenant teacher profile:', e);
    }
  }

  /**
   * Lấy danh sách học sinh riêng biệt của giáo viên (Cách ly 100% giữa các lớp/trường).
   */
  public static getStudents(tenantId: string): Student[] {
    if (typeof window === 'undefined') {
      return TENANT_PRESETS[tenantId]?.students || TENANT_PRESETS['teacher-mai-hoa'].students;
    }
    try {
      const stored = localStorage.getItem(`lopminh_tenant_${tenantId}_students`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading tenant students:', e);
    }
    return TENANT_PRESETS[tenantId]?.students || TENANT_PRESETS['teacher-mai-hoa'].students;
  }

  public static saveStudents(tenantId: string, students: Student[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`lopminh_tenant_${tenantId}_students`, JSON.stringify(students));
    } catch (e) {
      console.warn('Error saving tenant students:', e);
    }
  }

  /**
   * Lấy giáo án chuẩn Công văn 5512 đang soạn của giáo viên đó
   */
  public static getLessonPlan(tenantId: string): LessonPlan5512 | null {
    if (typeof window === 'undefined') {
      return TENANT_PRESETS[tenantId]?.initialLessonPlan || null;
    }
    try {
      const stored = localStorage.getItem(`lopminh_tenant_${tenantId}_lesson_plan`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading tenant lesson plan:', e);
    }
    return TENANT_PRESETS[tenantId]?.initialLessonPlan || null;
  }

  public static saveLessonPlan(tenantId: string, plan: LessonPlan5512 | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (plan) {
        localStorage.setItem(`lopminh_tenant_${tenantId}_lesson_plan`, JSON.stringify(plan));
      } else {
        localStorage.removeItem(`lopminh_tenant_${tenantId}_lesson_plan`);
      }
    } catch (e) {
      console.warn('Error saving tenant lesson plan:', e);
    }
  }

  /**
   * Lấy lịch sử trò chuyện tâm tình Góc Cởi Bỏ Chiếc Áo riêng tư của giáo viên đó
   */
  public static getChatMessages(tenantId: string): SanctuaryMessage[] {
    if (typeof window === 'undefined') {
      return TENANT_PRESETS[tenantId]?.initialChatMessages || [];
    }
    try {
      const stored = localStorage.getItem(`lopminh_tenant_${tenantId}_chat`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading tenant chat messages:', e);
    }
    return TENANT_PRESETS[tenantId]?.initialChatMessages || [];
  }

  public static saveChatMessages(tenantId: string, messages: SanctuaryMessage[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`lopminh_tenant_${tenantId}_chat`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Error saving tenant chat messages:', e);
    }
  }

  /**
   * Khởi tạo hoặc nạp toàn bộ gói dữ liệu của Tenant
   */
  public static loadFullTenantData(tenantId: string): TenantData {
    return {
      teacher: this.getTeacherProfile(tenantId),
      students: this.getStudents(tenantId),
      initialLessonPlan: this.getLessonPlan(tenantId) || TENANT_PRESETS[tenantId]?.initialLessonPlan || TENANT_PRESETS['teacher-mai-hoa'].initialLessonPlan,
      initialChatMessages: this.getChatMessages(tenantId)
    };
  }

  /**
   * Thử đồng bộ dữ liệu hồ sơ lên Supabase nếu có kết nối
   */
  private static async syncTeacherToSupabase(profile: TeacherProfile): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) return;

    try {
      await supabase.from('teachers').upsert({
        id: profile.id,
        full_name: profile.fullName,
        school_name: profile.schoolName,
        department: profile.department,
        primary_subject: profile.primarySubject,
        grade_level: profile.gradeLevel,
        psychological_load: profile.psychologicalLoad,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase sync skipped (offline or table not ready):', err);
    }
  }
}
