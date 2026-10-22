import { vnNow, VN_TZ } from "@/lib/time";
export type ThemeChoice = "auto" | "light" | "dark";
export const LIGHT_HOUR = 6;
export const DARK_HOUR = 18;
export function themeChoice(value: unknown): ThemeChoice { return value === "light" || value === "dark" ? value : "auto"; }
export function themeAtHour(choice: ThemeChoice, hour: number): "light" | "dark" {
  return choice === "auto" ? hour >= LIGHT_HOUR && hour < DARK_HOUR ? "light" : "dark" : choice;
}
export function themeAt(choice: ThemeChoice, date = new Date()) { return themeAtHour(choice, vnNow(date).hh); }
// Không có dữ liệu người dùng trong script. Chạy trước khi body được vẽ.
export const THEME_BOOTSTRAP = `(()=>{let p="auto";try{let r=localStorage.getItem("lm:theme");try{r=JSON.parse(r)}catch{}if(r==="light"||r==="dark")p=r}catch{}const h=Number(new Intl.DateTimeFormat("en-GB",{timeZone:${JSON.stringify(VN_TZ)},hour:"2-digit",hourCycle:"h23"}).format(new Date()));document.documentElement.dataset.theme=p==="auto"?(h>=${LIGHT_HOUR}&&h<${DARK_HOUR}?"light":"dark"):p})()`;
