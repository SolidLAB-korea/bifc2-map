import "./parking-core.mjs";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error(".env에 TELEGRAM_BOT_TOKEN을 먼저 설정해 주세요.");

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ timeout: 0, allowed_updates: ["message"] }) });
const data = await response.json();
if (!data.ok) throw new Error(`텔레그램 API 오류: ${data.description || "getUpdates"}`);
const chats = new Map();
for (const update of data.result) {
  const chat = update.message?.chat;
  if (chat) chats.set(String(chat.id), { id: chat.id, type: chat.type, name: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || "이름 없음" });
}
if (chats.size === 0) console.log("아직 메시지가 없습니다. 텔레그램에서 봇에게 /start를 보낸 뒤 이 명령을 다시 실행하세요.");
else for (const chat of chats.values()) console.log(`CHAT_ID=${chat.id} | ${chat.type} | ${chat.name}`);
