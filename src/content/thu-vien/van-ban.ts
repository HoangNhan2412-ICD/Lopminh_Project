import rows from "./van-ban.json";
import { documentSchema } from "./schema";
/** Danh sách cần đối chiếu do nhóm cung cấp; chưa phải nội dung pháp lý đã xác minh. */
export const VAN_BAN = rows.map(row => documentSchema.parse(row));
export function verifiedLessonFramework() {
  return VAN_BAN.filter(d => d.daKiemTra && d.tinhTrang === "con-hieu-luc" && d.khungBaiDay)
    .map(d => `[${d.soHieu}, ${d.khungBaiDay!.location}, ${d.banGoc}]\n${d.khungBaiDay!.text}`).join("\n\n");
}
