import { createServer } from "node:http";
import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const historyPath = join(root, ".parking-history.json");

function loadEnv() {
  const path = join(root, ".env");
  if (!existsSync(path)) return;
  const lines = requireText(path).split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['\"]|['\"]$/g, "");
  }
}
function requireText(path) {
  // This small synchronous boot read keeps secrets out of browser assets.
  return readFileSync(path, "utf8");
}
import { readFileSync } from "node:fs";
loadEnv();

let runtimeSettings = {
  siteUrl: process.env.PARKING_SITE_URL || "http://211.35.216.49:84",
  id: process.env.PARKING_ADMIN_ID || "",
  password: process.env.PARKING_ADMIN_PASSWORD || "",
};

async function getHistory() {
  try { return JSON.parse(await readFile(historyPath, "utf8")); } catch { return []; }
}
async function saveHistory(records) {
  const temp = `${historyPath}.tmp`;
  await writeFile(temp, JSON.stringify(records.slice(-500), null, 2), "utf8");
  await rename(temp, historyPath);
}
function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
function normalizeLast4(value) {
  const compact = String(value ?? "").replace(/\D/g, "");
  return /^\d{4}$/.test(compact) ? compact : null;
}

async function clickText(page, text) {
  const item = page.getByText(text, { exact: true }).last();
  await item.waitFor({ state: "visible", timeout: 7000 });
  await item.click();
}

async function automate(last4) {
  if (!runtimeSettings.id || !runtimeSettings.password) {
    throw new Error("관리자 ID와 비밀번호를 먼저 설정해 주세요.");
  }
  let chromium;
  try { ({ chromium } = await import("playwright")); }
  catch { throw new Error("자동화 엔진이 설치되지 않았습니다. npm install 후 다시 실행해 주세요."); }

  const browser = await chromium.launch({ headless: process.env.PARKING_HEADLESS !== "false" });
  try {
    const page = await browser.newPage({ viewport: { width: 430, height: 932 }, locale: "ko-KR" });
    page.setDefaultTimeout(9000);
    await page.goto(runtimeSettings.siteUrl, { waitUntil: "domcontentloaded" });

    // The site may already hold a session. Login only when a password field is shown.
    const passwordField = page.locator('input[type="password"]').first();
    if (await passwordField.isVisible().catch(() => false)) {
      const textField = page.locator('input[type="text"], input[type="email"], input:not([type])').first();
      await textField.fill(runtimeSettings.id);
      await passwordField.fill(runtimeSettings.password);
      await page.locator('button[type="submit"], input[type="submit"]').first().click();
      await page.waitForLoadState("domcontentloaded");
    }

    // Confirmed from supplied screens: four digit keypad, 조회, vehicle row, 확인, 관리자할인, 할인적용.
    for (const digit of last4) await clickText(page, digit);
    await clickText(page, "조회");
    const vehicleCard = page.locator("text=/[가-힣].*\\d{4}|\\d{2,3}[가-힣]\\d{4}/").first();
    await vehicleCard.waitFor({ state: "visible" });
    const plate = (await vehicleCard.innerText()).match(/\d{2,3}[가-힣]\d{4}/)?.[0] || last4;
    await vehicleCard.click();
    await clickText(page, "확인");
    await clickText(page, "관리자할인");
    await clickText(page, "할인적용");
    await page.waitForTimeout(500);
    return { plate, message: "관리자 할인이 적용되었습니다." };
  } finally {
    await browser.close();
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { connected: Boolean(runtimeSettings.id && runtimeSettings.password), siteUrl: runtimeSettings.siteUrl });
  }
  if (req.method === "GET" && url.pathname === "/api/history") return json(res, 200, await getHistory());
  if (req.method === "POST" && url.pathname === "/api/settings") {
    let raw = ""; for await (const chunk of req) raw += chunk;
    const data = JSON.parse(raw || "{}");
    if (typeof data.siteUrl === "string" && /^https?:\/\//.test(data.siteUrl)) runtimeSettings.siteUrl = data.siteUrl;
    if (typeof data.id === "string") runtimeSettings.id = data.id;
    if (typeof data.password === "string") runtimeSettings.password = data.password;
    return json(res, 200, { ok: true, connected: Boolean(runtimeSettings.id && runtimeSettings.password) });
  }
  if (req.method === "POST" && url.pathname === "/api/register") {
    let raw = ""; for await (const chunk of req) raw += chunk;
    const last4 = normalizeLast4(JSON.parse(raw || "{}").last4);
    if (!last4) return json(res, 400, { error: "차량번호 끝 4자리를 숫자로 입력해 주세요." });
    const history = await getHistory();
    const previous = history.findLast((item) => item.last4 === last4 && item.status === "completed");
    if (previous) return json(res, 200, { status: "duplicate", record: previous });
    try {
      const result = await automate(last4);
      const record = { id: crypto.randomUUID(), last4, plate: result.plate, status: "completed", message: result.message, createdAt: new Date().toISOString() };
      history.push(record); await saveHistory(history);
      return json(res, 200, { status: "completed", record });
    } catch (error) {
      const record = { id: crypto.randomUUID(), last4, status: "failed", message: error instanceof Error ? error.message : "처리에 실패했습니다.", createdAt: new Date().toISOString() };
      history.push(record); await saveHistory(history);
      return json(res, 502, { status: "failed", record });
    }
  }
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(await readFile(join(root, "public", "index.html")));
  }
  const publicFiles = new Map([
    ["/app.js", ["app.js", "application/javascript; charset=utf-8"]],
    ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ]);
  const asset = publicFiles.get(url.pathname);
  if (req.method === "GET" && asset) {
    res.writeHead(200, { "content-type": asset[1] });
    return res.end(await readFile(join(root, "public", asset[0])));
  }
  return json(res, 404, { error: "Not found" });
});

server.listen(process.env.PORT || 4310, "127.0.0.1", () => console.log("Parking automation: http://127.0.0.1:4310"));
