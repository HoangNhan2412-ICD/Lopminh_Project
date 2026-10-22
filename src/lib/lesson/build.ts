import type { Student, StudentNote } from "@/lib/types";
import { stripDiacritics } from "@/lib/text";
import {
  ACTIVITY_KEYS,
  lessonPlanSchema,
  slideSchema,
  type LessonPlanContent,
  type LessonRequest,
  type Slide,
} from "@/lib/lesson/types";

/* ---------- Xếp học sinh vào hai tầng dựa trên dữ liệu thật ---------- */

const WEAK = /(giang lai|chua hieu|yeu|nho bai|no bai|duoi trung binh|go diem|cung co|hong kien thuc|cham)/;
const STRONG = /(tien bo|gioi|xuat sac|nhanh|hsg|ielts|nang cao|but pha|diem cao)/;

export function suggestTiers(students: Student[], notes: StudentNote[]): { coBan: string[]; nangCao: string[] } {
  const coBan = new Set<string>();
  const nangCao = new Set<string>();
  const inClass = new Set(students.map((s) => s.id));
  for (const n of notes) {
    if (!n.studentId || !inClass.has(n.studentId)) continue;
    const t = stripDiacritics(n.text);
    if (WEAK.test(t)) coBan.add(n.studentId);
    else if (n.kind === "khen-thuong" || STRONG.test(t)) nangCao.add(n.studentId);
  }
  for (const s of students) {
    if (coBan.has(s.id) || nangCao.has(s.id)) continue;
    if (s.hocLuc === "yeu" || s.noiBat?.loai === "can-ho-tro") { coBan.add(s.id); continue; }
    if (s.hocLuc === "gioi") { nangCao.add(s.id); continue; }
    const traits = stripDiacritics(s.traits.join(" "));
    if (WEAK.test(traits)) coBan.add(s.id);
    else if (STRONG.test(traits)) nangCao.add(s.id);
  }
  // Ai chưa có dữ liệu thì để tầng Cơ bản: giáo viên kéo lên Nâng cao nếu muốn.
  for (const s of students) if (!coBan.has(s.id) && !nangCao.has(s.id)) coBan.add(s.id);
  return { coBan: [...coBan], nangCao: [...nangCao] };
}

/* ---------- Làm sạch kết quả AI: đúng luật slide trước khi hiển thị/xuất file ---------- */

const MAX_BULLETS = 5;

function nfcDeep<T>(v: T): T {
  if (typeof v === "string") return v.normalize("NFC") as T;
  if (Array.isArray(v)) return v.map(nfcDeep) as T;
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, nfcDeep(x)])) as T;
  }
  return v;
}

let seq = 0;
export function newId(prefix = "s"): string {
  seq = (seq + 1) % 1e6;
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`;
}

/** Slide quá nhiều ý thì tách đôi, giữ nguyên bố cục. */
function splitLong(slides: Slide[]): Slide[] {
  const out: Slide[] = [];
  for (const s of slides) {
    if (s.bullets.length > MAX_BULLETS && s.layout !== "so-do") {
      const half = Math.ceil(s.bullets.length / 2);
      out.push({ ...s, bullets: s.bullets.slice(0, half) });
      out.push({ ...s, id: newId(), title: `${s.title} (tiếp)`, bullets: s.bullets.slice(half), imagePrompt: s.imagePrompt });
    } else out.push(s);
  }
  return out;
}

export function polishPlan(raw: unknown, r: LessonRequest): LessonPlanContent {
  const plan = lessonPlanSchema.parse(nfcDeep(raw));
  // Hoạt động đúng thứ tự 5512
  plan.activities.sort((a, b) => ACTIVITY_KEYS.indexOf(a.key) - ACTIVITY_KEYS.indexOf(b.key));

  let slides = plan.slides.map((s) => ({ ...s, id: s.id && s.id.length > 2 ? s.id : newId() }));
  // id trùng nhau thì đặt lại
  const seen = new Set<string>();
  slides = slides.map((s) => {
    if (seen.has(s.id)) return { ...s, id: newId() };
    seen.add(s.id);
    return s;
  });
  slides = splitLong(slides);
  if (slides[0]?.layout !== "bia") slides.unshift(coverSlide(plan.title, r));
  if (slides[slides.length - 1]?.layout !== "dan-do") slides.push(homeworkSlide(plan.homework));
  if (!slides.some((s) => s.layout === "ma-qr")) {
    const qi = slides.findIndex((s) => s.layout === "trac-nghiem");
    const qr = slideSchema.parse({
      id: newId(),
      layout: "ma-qr",
      title: "Quét mã vào phòng trắc nghiệm",
      bullets: ["Mở camera điện thoại", "Quét mã, nhập tên", "Trả lời nhanh, đúng là có điểm"],
      icon: "cau-hoi",
      notes: "Thầy cô mở Phòng Quiz trên Lớp Mình để hiện bảng xếp hạng, hoặc dán link Wayground/Kahoot ở bước xuất file.",
    });
    slides.splice(qi >= 0 ? qi : slides.length - 1, 0, qr);
  }
  return { ...plan, slides };
}

function coverSlide(title: string, r: LessonRequest): Slide {
  return slideSchema.parse({
    id: newId(),
    layout: "bia",
    title,
    bullets: [`${r.subject} ${r.grade}`, `Lớp ${r.className}`],
    icon: "sach",
    notes: "Chào lớp, giới thiệu tên bài.",
  });
}

function homeworkSlide(homework: string): Slide {
  return slideSchema.parse({
    id: newId(),
    layout: "dan-do",
    title: "Dặn dò",
    bullets: homework.split(/(?<=[.;])\s+/).filter(Boolean).slice(0, 4),
    icon: "but",
    notes: "Nhắc lại việc cần làm ở nhà, hẹn tiết sau.",
  });
}

/* ---------- Giáo án mẫu khi chưa có khóa Gemini (chế độ demo) ---------- */

export function fallbackPlan(r: LessonRequest): LessonPlanContent {
  const t = r.topic.trim() || "Bài học hôm nay";
  const songNgu = r.tone === "song-ngu";
  const cue = (en: string) => (songNgu ? en : undefined);
  const third = Math.round(r.minutes / 3);
  const minutes = [Math.round(r.minutes * 0.12), third + 2, third - 4, 0];
  minutes[3] = r.minutes - minutes[0] - minutes[1] - minutes[2];

  const content: LessonPlanContent = {
    title: t,
    objectives: {
      kienThuc: [`Nêu được nội dung chính của bài "${t}".`, "Giải thích được ý nghĩa qua ví dụ gần gũi."],
      nangLuc: [
        "Năng lực tự chủ và tự học: tự đọc, tóm tắt nội dung.",
        "Năng lực giao tiếp và hợp tác: thảo luận nhóm, trình bày kết quả.",
        `Năng lực đặc thù môn ${r.subject}: vận dụng kiến thức vào bài tập và tình huống thực tế.`,
      ],
      phamChat: ["Chăm chỉ, trung thực khi làm bài.", "Có trách nhiệm với nhiệm vụ chung của nhóm."],
    },
    materials: ["Máy chiếu, slide bài giảng", "Phiếu học tập hai tầng", "Điện thoại/máy tính bảng để quét mã quiz (nếu có)"],
    activities: [
      {
        key: "khoi-dong",
        minutes: minutes[0],
        goal: "Tạo hứng thú, gợi nhu cầu tìm hiểu bài mới.",
        content: `Tình huống đời sống dẫn vào "${t}".`,
        product: "Câu trả lời dự đoán của học sinh.",
        steps: {
          giao: "Giáo viên chiếu hình tình huống, nêu câu hỏi gợi mở.",
          thucHien: "Học sinh suy nghĩ cá nhân 1 phút, trao đổi với bạn bên cạnh.",
          baoCao: "Hai đến ba học sinh nêu dự đoán.",
          ketLuan: "Giáo viên ghi nhận, dẫn vào bài mới.",
        },
      },
      {
        key: "hinh-thanh",
        minutes: minutes[1],
        goal: `Hình thành kiến thức trọng tâm của "${t}".`,
        content: "Đọc ví dụ, rút ra nhận xét, phát biểu kiến thức.",
        product: "Kết luận ghi vở, sơ đồ tóm tắt.",
        steps: {
          giao: "Chia nhóm 4 em, phát phiếu tìm hiểu.",
          thucHien: "Các nhóm đọc ví dụ, trả lời câu hỏi trong phiếu.",
          baoCao: "Đại diện nhóm trình bày, các nhóm khác bổ sung.",
          ketLuan: "Giáo viên chốt kiến thức, học sinh ghi vở.",
        },
      },
      {
        key: "luyen-tap",
        minutes: minutes[2],
        goal: "Củng cố kiến thức qua bài tập hai mức độ.",
        content: "Phiếu học tập tầng Cơ bản và tầng Nâng cao.",
        product: "Bài làm trên phiếu, kết quả trò chơi trắc nghiệm.",
        steps: {
          giao: "Giáo viên giao phiếu theo tầng, nêu thời gian.",
          thucHien: "Học sinh làm cá nhân, giáo viên hỗ trợ nhóm Cơ bản.",
          baoCao: "Học sinh lên bảng chữa bài, chơi trắc nghiệm nhanh.",
          ketLuan: "Giáo viên nhận xét lỗi hay gặp.",
        },
        coBan: "Bài tập áp dụng trực tiếp, có ví dụ mẫu đi kèm.",
        nangCao: "Bài tập kết hợp nhiều bước, có tình huống thực tế.",
      },
      {
        key: "van-dung",
        minutes: minutes[3],
        goal: "Vận dụng kiến thức vào tình huống thực tế.",
        content: "Nhiệm vụ về nhà gắn với đời sống.",
        product: "Bài viết/bài giải nộp tiết sau.",
        steps: {
          giao: "Giáo viên nêu nhiệm vụ vận dụng hai mức.",
          thucHien: "Học sinh thực hiện ở nhà.",
          baoCao: "Nộp sản phẩm đầu tiết sau.",
          ketLuan: "Giáo viên nhận xét, tuyên dương.",
        },
        coBan: "Tìm một ví dụ trong gia đình và giải thích.",
        nangCao: "Tự đặt một bài toán/tình huống mới và giải.",
      },
    ],
    slides: [
      { id: newId(), layout: "bia", title: t, bullets: [`${r.subject} ${r.grade}`, `Lớp ${r.className}`], icon: "sach", imagePrompt: `Tranh minh họa phong cách màu nước nhẹ về chủ đề "${t}", bối cảnh lớp học Việt Nam, không có chữ`, notes: "Chào lớp, giới thiệu tên bài." },
      { id: newId(), layout: "muc-tieu", title: "Hôm nay chúng ta sẽ", bullets: ["Hiểu nội dung chính của bài", "Làm được bài tập áp dụng", "Liên hệ với đời sống"], icon: "muc-tieu", imagePrompt: "Tấm bảng xanh với ba ngôi sao, phong cách phẳng, không có chữ", notes: "Đọc mục tiêu cùng học sinh.", englishCue: cue("Today we will learn… (Hôm nay chúng ta học…)") },
      { id: newId(), layout: "khoi-dong", title: "Em thử đoán xem?", bullets: [`Điều gì liên quan đến "${t}" em gặp hằng ngày?`], icon: "cau-hoi", imagePrompt: `Học sinh Việt Nam đang suy nghĩ trước một tình huống đời thường liên quan "${t}", tranh phẳng, không có chữ`, notes: "Cho học sinh suy nghĩ 1 phút, gọi 2–3 em.", englishCue: cue("Think and guess! (Suy nghĩ và đoán nhé!)") },
      { id: newId(), layout: "hai-cot", title: "Cùng tìm hiểu", bullets: ["Đọc ví dụ trong sách", "Gạch chân từ khóa", "Rút ra nhận xét"], icon: "sach", imagePrompt: `Sơ đồ minh họa trực quan cho "${t}", phong cách đồ họa giáo dục, không có chữ`, notes: "Giáo viên hướng dẫn đọc, đặt câu hỏi dẫn dắt.", englishCue: cue("Open your books (Mở sách ra)") },
      { id: newId(), layout: "noi-bat", title: "Ghi nhớ", highlight: `Kiến thức trọng tâm của "${t}"`, caption: "Giáo viên điền kết luận chính xác của bài tại đây", bullets: [], icon: "bong-den", imagePrompt: "Bóng đèn phát sáng trên nền bảng xanh, phong cách phẳng", notes: "Chốt kiến thức, học sinh ghi vở." },
      { id: newId(), layout: "quy-trinh", title: "Các bước làm bài", bullets: ["Đọc kỹ đề", "Xác định dữ kiện", "Áp dụng kiến thức", "Kiểm tra lại"], icon: "but", imagePrompt: "Bốn bậc thang đi lên, phong cách phẳng màu ấm", notes: "Làm mẫu một bài theo đủ bốn bước." },
      { id: newId(), layout: "nhom", title: "Thảo luận nhóm", bullets: ["Nhóm 4 em", "Làm phiếu học tập", "Cử đại diện trình bày"], minutes: 7, product: "Phiếu học tập của nhóm", icon: "nhom", imagePrompt: "Nhóm bốn học sinh Việt Nam ngồi quanh bàn thảo luận, tranh phẳng", notes: "Đi quanh lớp hỗ trợ nhóm Cơ bản.", englishCue: cue("Work in groups (Làm việc nhóm)") },
      { id: newId(), layout: "so-sanh", title: "Hai mức thử thách", leftTitle: "Cơ bản", left: ["Áp dụng trực tiếp", "Có ví dụ mẫu"], rightTitle: "Nâng cao", right: ["Nhiều bước", "Tình huống thực tế"], bullets: [], icon: "muc-tieu", imagePrompt: "Hai con đường lên núi, một thoai thoải một dốc hơn, tranh phẳng", notes: "Học sinh chọn hoặc giáo viên giao theo tầng." },
      { id: newId(), layout: "trac-nghiem", title: "Ai nhanh hơn?", bullets: [], question: { q: `Câu nào đúng về "${t}"?`, options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"], answer: 0 }, icon: "cup", imagePrompt: "", notes: "Đếm ngược 10 giây, học sinh giơ thẻ màu." },
      { id: newId(), layout: "so-do", title: t, bullets: ["Khái niệm", "Tính chất", "Cách làm", "Ví dụ", "Lưu ý"], icon: "la", imagePrompt: "", notes: "Cùng học sinh tóm tắt bài bằng sơ đồ." },
      { id: newId(), layout: "dan-do", title: "Dặn dò", bullets: ["Làm phiếu vận dụng theo tầng", "Chuẩn bị bài sau"], icon: "but", imagePrompt: "", notes: "Hẹn tiết sau." },
    ],
    quiz: [1, 2, 3, 4, 5, 6].map((i) => ({
      q: `Câu ${i}: câu hỏi về "${t}" (có khóa Gemini Bé Bảng sẽ soạn câu thật)`,
      options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      answer: 0,
      explain: "",
    })),
    worksheet: {
      coBan: ["Bài 1: áp dụng trực tiếp kiến thức vừa học.", "Bài 2: làm theo ví dụ mẫu.", "Bài 3: điền vào chỗ trống."],
      nangCao: ["Bài 1: bài nhiều bước.", "Bài 2: tình huống thực tế.", "Bài 3: tự đặt đề và giải."],
    },
    homework: "Làm phiếu vận dụng theo tầng của mình. Chuẩn bị bài sau.",
  };
  return lessonPlanSchema.parse(content);
}
