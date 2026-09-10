const $ = (selector) => document.querySelector(selector);
const result = $("#result"), history = $("#history"), connection = $("#connection");
const formatTime = (iso) => new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
function showRecord(record, duplicate = false) {
  result.className = `notice ${duplicate ? "duplicate" : record.status}`;
  result.innerHTML = `<strong>${duplicate ? "이미 처리된 차량입니다" : record.status === "completed" ? "할인 등록 완료" : "처리 실패"}</strong><span>${record.plate ? `${record.plate} · ` : ""}${record.message}</span>`;
}
function renderHistory(records) {
  history.innerHTML = records.slice().reverse().slice(0, 8).map((r) => `<article><span class="status ${r.status}">${r.status === "completed" ? "완료" : "실패"}</span><b>${r.plate || `끝 ${r.last4}`}</b><time>${formatTime(r.createdAt)}</time><p>${r.message}</p></article>`).join("") || "";
}
async function load() {
  const [health, records] = await Promise.all([fetch("/api/health").then(r => r.json()), fetch("/api/history").then(r => r.json())]);
  connection.textContent = health.connected ? `연동 준비됨 · ${health.siteUrl}` : "관리자 계정을 설정한 뒤 등록할 수 있습니다.";
  connection.className = `hint ${health.connected ? "ready" : ""}`; renderHistory(records);
}
$("#registerButton").onclick = async () => {
  const last4 = $("#last4").value.replace(/\D/g, "");
  if (last4.length !== 4) { result.className = "notice failed"; result.textContent = "숫자 4자리를 입력해 주세요."; return; }
  const button = $("#registerButton"); button.disabled = true; button.textContent = "조회 및 할인 적용 중…";
  try { const response = await fetch("/api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ last4 }) }); const body = await response.json(); showRecord(body.record, body.status === "duplicate"); await load(); }
  catch { result.className = "notice failed"; result.textContent = "서버와 통신하지 못했습니다."; }
  finally { button.disabled = false; button.textContent = "관리자 할인 등록"; }
};
$("#refreshButton").onclick = load; $("#settingsButton").onclick = () => $("#settings").showModal();
$("#saveSettings").onclick = async (event) => { event.preventDefault(); await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteUrl: $("#siteUrl").value, id: $("#adminId").value, password: $("#adminPassword").value }) }); $("#settings").close(); $("#adminPassword").value = ""; await load(); };
load().catch(() => { connection.textContent = "서버를 시작해 주세요."; });
