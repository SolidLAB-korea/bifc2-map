import { readFile, writeFile, rename } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
export const root = dirname(fileURLToPath(import.meta.url));
function loadEnv() { const path = join(root, ".env"); if (!existsSync(path)) return; for (const line of readFileSync(path, "utf8").split(/\r?\n/)) { const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['\"]|['\"]$/g, ""); } }
loadEnv();
const historyPath = process.env.PARKING_HISTORY_PATH || join(root, ".parking-history.json");
let settings = { siteUrl: process.env.PARKING_SITE_URL || "http://211.35.216.49:84", id: process.env.PARKING_ADMIN_ID || "", password: process.env.PARKING_ADMIN_PASSWORD || "" };
export const getStatus = () => ({ connected: Boolean(settings.id && settings.password), siteUrl: settings.siteUrl });
export function setSettings(next) { if (typeof next.siteUrl === "string" && /^https?:\/\//.test(next.siteUrl)) settings.siteUrl = next.siteUrl; if (typeof next.id === "string") settings.id = next.id; if (typeof next.password === "string") settings.password = next.password; return getStatus(); }
export async function getHistory() { try { return JSON.parse(await readFile(historyPath, "utf8")); } catch { return []; } }
async function saveHistory(records) { const temp = `${historyPath}.tmp`; await writeFile(temp, JSON.stringify(records.slice(-500), null, 2), "utf8"); await rename(temp, historyPath); }
export function getLast4(value) { const digits = String(value ?? "").replace(/\D/g, ""); return digits.length >= 4 ? digits.slice(-4) : null; }
export function getLast4FromPlate(value) { const plate = String(value ?? "").match(/\d{2,3}\s*[가-힣]\s*\d{4}/); return plate ? plate[0].replace(/\D/g, "").slice(-4) : null; }
async function automate(last4) {
  if (!settings.id || !settings.password) throw new Error("관리자 ID와 비밀번호를 먼저 설정해 주세요.");
  let chromium; try { ({ chromium } = await import("playwright")); } catch { throw new Error("자동화 엔진이 설치되지 않았습니다. npm install 후 다시 실행해 주세요."); }
  const browser = await chromium.launch({ headless: process.env.PARKING_HEADLESS !== "false" });
  try {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 }, locale: "ko-KR" }); page.setDefaultTimeout(15000); await page.goto(settings.siteUrl, { waitUntil: "domcontentloaded" });
    const passwordField = page.locator('input[name="userPassword"]').first();
    if (await passwordField.isVisible().catch(() => false)) { await page.locator('input[name="userId"]').fill(settings.id); await passwordField.fill(settings.password); await page.locator('button[type="submit"]').click(); }
    const slots = page.locator('.search input[type="text"]');
    await slots.first().waitFor({ state: "visible" });
    if (await slots.count() !== 4) throw new Error("주차 사이트 차량번호 입력칸을 찾지 못했습니다.");
    for (const [index, digit] of [...last4].entries()) await slots.nth(index).fill(digit);
    await page.locator('.btn-search').click();
    const resultRow = page.locator('#_table1 tr').first();
    await resultRow.waitFor({ state: "visible" });
    if (await resultRow.locator('td[colspan]').count()) throw new Error(`끝 ${last4} 차량을 찾지 못했습니다.`);
    const rowText = await resultRow.innerText();
    const plate = rowText.match(/\d{2,3}[가-힣]\d{4}/)?.[0] || last4;
    await resultRow.click();
    await page.locator('#dckey3').waitFor({ state: "visible" });
    await page.locator('#dckey3').click();
    await page.waitForTimeout(800);
    return { plate, message: "관리자 할인이 적용되었습니다." };
  } finally { await browser.close(); }
}
export async function registerVehicle(value) { const last4 = getLast4(value); if (!last4) return { status: "invalid", message: "차량번호 전체 또는 끝 4자리 숫자를 입력해 주세요." }; const history = await getHistory(); const previous = history.findLast((item) => item.last4 === last4 && item.status === "completed"); if (previous) return { status: "duplicate", record: previous }; try { const result = await automate(last4); const record = { id: crypto.randomUUID(), last4, plate: result.plate, status: "completed", message: result.message, createdAt: new Date().toISOString() }; history.push(record); await saveHistory(history); return { status: "completed", record }; } catch (error) { const record = { id: crypto.randomUUID(), last4, status: "failed", message: error instanceof Error ? error.message : "처리에 실패했습니다.", createdAt: new Date().toISOString() }; history.push(record); await saveHistory(history); return { status: "failed", record }; } }
