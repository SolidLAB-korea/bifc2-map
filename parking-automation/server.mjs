import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getHistory, getLast4, getStatus, registerVehicle, root, setSettings } from "./parking-core.mjs";

const accessToken = process.env.APP_ACCESS_TOKEN || "";
function json(res, status, body) { res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); res.end(JSON.stringify(body)); }
function isAuthorized(req) { return !accessToken || req.headers.authorization === `Bearer ${accessToken}`; }
async function readBody(req) { let raw = ""; for await (const chunk of req) raw += chunk; try { return JSON.parse(raw || "{}"); } catch { throw new Error("요청 형식이 올바르지 않습니다."); } }
function secure(req, res) { if (isAuthorized(req)) return true; json(res, 401, { error: "관리자 접속 키가 필요합니다." }); return false; }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, getStatus());
  if (req.method === "GET" && url.pathname === "/api/history") { if (!secure(req, res)) return; return json(res, 200, await getHistory()); }
  if (req.method === "POST" && url.pathname === "/api/settings") { if (!secure(req, res)) return; return json(res, 200, { ok: true, ...setSettings(await readBody(req)) }); }
  if (req.method === "POST" && url.pathname === "/api/register") {
    if (!secure(req, res)) return;
    const last4 = getLast4((await readBody(req)).last4);
    if (!last4 || last4.length !== 4) return json(res, 400, { error: "차량번호 끝 4자리를 숫자로 입력해 주세요." });
    const result = await registerVehicle(last4);
    return json(res, result.status === "failed" ? 502 : 200, result);
  }
  if (req.method === "GET" && url.pathname === "/") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(await readFile(join(root, "public", "index.html"))); }
  const assets = new Map([["/app.js", ["app.js", "application/javascript; charset=utf-8"]], ["/styles.css", ["styles.css", "text/css; charset=utf-8"]]]);
  const asset = assets.get(url.pathname);
  if (req.method === "GET" && asset) { res.writeHead(200, { "content-type": asset[1] }); return res.end(await readFile(join(root, "public", asset[0]))); }
  return json(res, 404, { error: "Not found" });
});

server.listen(process.env.PORT || 4310, "0.0.0.0", async () => {
  console.log(`Parking automation: http://127.0.0.1:${process.env.PORT || 4310}`);
  if (process.env.RUN_TELEGRAM_BOT === "true") await import("./telegram-bot.mjs");
});
