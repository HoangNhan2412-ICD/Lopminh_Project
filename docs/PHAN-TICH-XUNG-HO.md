# Lỗi "Thầy Hoa" — nguyên nhân gốc trong code V3.5

## Nguyên nhân chính

`legacy-v3/src/components/MascotBebang.tsx`, dòng 33:

```ts
`Hôm nay lớp 9A có em nào vắng hay có chuyển biến mới không ${teacher.salutation} Hoa?`,
```

Danh xưng lấy từ hồ sơ (`teacher.salutation`), nhưng tên "Hoa" bị viết cứng. Chuyển từ Cô Nguyễn Thị Mai Hoa sang Thầy Nguyễn Đức Nam thì `salutation` đổi thành "Thầy" còn tên vẫn là "Hoa", ra "Thầy Hoa". Lớp "9A" ở cùng câu cũng viết cứng.

## Các chỗ cùng kiểu lỗi (gọi "cô" bất kể hồ sơ)

| File | Dòng | Chuỗi viết cứng |
|---|---|---|
| `components/MascotBebang.tsx` | 35–37 | "...chuẩn bị phiếu bù bài cho cô", "cô bấm vào Soạn Bài Số", "Bản Tin Vắn trưa nay cho cô" (tên An, Bình cũng cứng) |
| `components/MascotBebang.tsx` | 205 | "Cô cứ thong thả nói…" |
| `components/BebangGuideModal.tsx` | 309, 324 | "cô có thể bấm…", nút "Cô Đã Hiểu Rõ, Cảm Ơn Bé Bảng!" |
| `components/LessonPlanner.tsx` | 547 | "Cô chưa biết cách nạp Quizizz?" |
| `components/DigitalSkillsGuide.tsx` | 196 | "Cô đã hoàn thành bài này!" |
| `lib/zalo-bridge.ts` | 194, 223 | "Cô Mai Hoa có thể an tâm…", "em chào cô Hoa" (dữ liệu mẫu, nên lấy theo hồ sơ hoặc gắn đúng hồ sơ Cô Mai Hoa) |
| `components/ZaloUnifiedFeed.tsx` | 102 | "Kính gửi cô Hoa…" (dữ liệu mẫu, như trên) |

## Không nhất quán khi rút gọn tên

- `Header.tsx:75` lấy 2 chữ cuối (`Mai Hoa`).
- `UnbuttoningSpace.tsx:99` và `geminiService.ts:259` lấy 1 chữ cuối (`Hoa`).

Người dùng sẽ thấy lúc "Cô Mai Hoa", lúc "Cô Hoa". Cần một hàm duy nhất.

## Phần đã làm đúng

- Lịch sử chat tách theo `teacher.id` (`TenantManager.getChatMessages`) và nạp lại khi đổi hồ sơ, nên không bị lẫn lịch sử giữa hai người.
- Ba hồ sơ mẫu trong `tenantPresets.ts` đều có `salutation` đúng.

## Chưa kiểm tra được

`src/app/api/gemini/route.ts` (prompt hệ thống phía server) nằm trong phần file bị thiếu. Cần xem prompt có ép đúng danh xưng hay không.

## Cách sửa (theo luật trong CLAUDE.md)

1. Tạo `lib/persona/honorific.ts` với `getHonorific(profile)` và `addressOf(profile)` (một quy tắc rút gọn tên duy nhất). Đổi `salutation` thành dữ liệu suy ra từ `gender`.
2. Thay mọi chuỗi viết cứng ở bảng trên bằng `addressOf(teacher)` / `getHonorific(teacher)`. Lời nhắc của Bé Bảng lấy tên lớp, tên học sinh từ dữ liệu hồ sơ, không viết cứng.
3. Thêm lint rule hoặc test quét mã nguồn: báo lỗi khi thấy chuỗi "Thầy "/"Cô "/"cô "/"thầy " theo sau là chữ hoa nằm ngoài `lib/persona/` và dữ liệu mẫu.
4. Test: đổi Cô Mai Hoa → Thầy Đức Nam → hồ sơ thứ ba 10 vòng; kiểm tra mascot, header, hướng dẫn, chat, file xuất.
