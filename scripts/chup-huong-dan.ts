import { chromium, type Locator } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

// Chạy npm run dev ở chế độ demo, rồi node scripts/chup-huong-dan.ts.
// Chỉ localhost; context mới không có cookie/tài khoản/dữ liệu người dùng.
async function main() {
  const base = process.env.GUIDE_BASE_URL ?? "http://localhost:3000";
  if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw Error("Chỉ chụp app demo trên localhost.");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
    await page.addInitScript(() => {
      localStorage.setItem("lm:tour-seen", "1");
      localStorage.setItem("lm:theme", JSON.stringify("light"));
      localStorage.setItem("lm:quiz:gv-mai-hoa", JSON.stringify([{ id: "huong-dan", title: "Ôn tập Toán", createdAt: "2026-10-21", questions: [{ q: "Căn bậc hai số học của 9 là bao nhiêu?", options: ["3", "6", "9", "18"], answer: 0, explain: "3 × 3 = 9", seconds: 30 }] }]));
    });
    await page.goto(`${base}/tai-khoan`);
    await page.getByText("Chưa cấu hình Supabase", { exact: false }).waitFor();
    await mkdir("public/guides", { recursive: true });
    async function capture(name: string, target: Locator) {
      await page.addStyleTag({ content: '[data-tour="chat-fab"], a[aria-label="Trò chuyện với Bé Bảng"] { visibility: hidden !important; }' });
      await target.scrollIntoViewIfNeeded();
      await target.evaluate(el => { (el as HTMLElement).blur(); el.scrollLeft = 0; (el as HTMLElement).style.outline = "3px solid var(--urgent)"; (el as HTMLElement).style.outlineOffset = "3px"; });
      const card = target.locator('xpath=ancestor::div[contains(@class,"radius-card")][1]');
      await page.evaluate(() => document.fonts.ready);
      const png = await card.screenshot({ animations: "disabled" });
      const encoded = await page.evaluate(async data => {
        const img = new window.Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
        const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 800;
        const ctx = canvas.getContext("2d")!; ctx.fillStyle = "white"; ctx.fillRect(0, 0, 1200, 800);
        const scale = Math.min(1160 / img.width, 760 / img.height);
        const w = img.width * scale, h = img.height * scale;
        ctx.drawImage(img, (1200 - w) / 2, (800 - h) / 2, w, h);
        return canvas.toDataURL("image/webp", 0.9).split(",")[1];
      }, png.toString("base64"));
      await writeFile(`public/guides/${name}.webp`, Buffer.from(encoded, "base64"));
      await target.evaluate(el => { (el as HTMLElement).style.outline = ""; (el as HTMLElement).style.outlineOffset = ""; });
      console.info(`Đã chụp ${name}.webp (1200 × 800)`);
    }
    await page.goto(`${base}/phong-quiz`);
    await page.getByRole("button", { name: "Ôn tập Toán (1 câu)", exact: true }).click();
    await capture("quiz-wayground", page.getByRole("button", { name: "Tải file Wayground (Quizizz)", exact: true }));
    await capture("quiz-kahoot", page.getByRole("button", { name: "Tải file Kahoot", exact: true }));
    await capture("quiz-quizlet", page.getByRole("button", { name: "Chép cho Quizlet", exact: true }));
    const link = page.getByRole("textbox", { name: "Link phòng quiz" });
    await link.fill("https://example.com/bai-kiem-tra-mau");
    await capture("quiz-qr", link);
    await page.goto(`${base}/hop-thu`);
    const paste = page.locator("textarea").first();
    await paste.fill("Thông báo họp tổ\nTổ họp lúc 14 giờ thứ Sáu tại phòng 204.");
    await capture("dan-tin", paste);
  } finally { await browser.close(); }
}
main().catch(() => { console.error("Chưa chụp được ảnh. Kiểm tra app demo localhost, Playwright và Chromium."); process.exitCode = 1; });
