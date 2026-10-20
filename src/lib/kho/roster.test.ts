import { describe, expect, it } from "vitest";
import { rowsToStudents } from "@/lib/kho/roster";

describe("nhập danh sách lớp", () => {
  it("đọc theo tên cột, bỏ dòng trống, nhận giới tính và đặc điểm", () => {
    const rows = [
      ["DANH SÁCH LỚP 9A"],
      ["STT", "Họ và tên", "Giới tính (Nam/Nữ)", "Đặc điểm, cách học"],
      ["1", "Nguyễn Văn  An", "Nam", "hướng nội, cần khích lệ"],
      ["2", "Trần Thị Bích", "Nữ", ""],
      ["", "", "", ""],
    ];
    const list = rowsToStudents(rows, "9A");
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ fullName: "Nguyễn Văn An", shortName: "An", gender: "nam", traits: ["hướng nội", "cần khích lệ"], classId: "9A" });
    expect(list[1].gender).toBe("nu");
  });
});
