// 공유 데이터 저장소 API (Netlify Functions + Netlify Blobs)
// GET  /api/data  → 현재 데이터 (없으면 초기값)
// POST /api/data  → 저장 (PIN 없음, 누구나 저장 가능) + 자동 백업
import { getStore } from "@netlify/blobs";
import seed from "../lib/seed.mjs";

const KEEP_BACKUPS = 50;
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

export default async (req) => {
  const store = getStore({ name: "kpi", consistency: "strong" });

  if (req.method === "GET") {
    const cur = await store.get("current", { type: "json" });
    return json(cur || seed);
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "잘못된 요청입니다." }, 400); }
    const data = body && body.data;
    if (!data || typeof data !== "object" || !Array.isArray(data.indicators)) return json({ error: "데이터 형식이 올바르지 않습니다." }, 400);
    if (JSON.stringify(data).length > 1_000_000) return json({ error: "데이터가 너무 큽니다." }, 413);

    const prev = await store.get("current", { type: "json" });
    let backup = "";
    if (prev) {
      backup = "backup/" + new Date().toISOString().replace(/[:.]/g, "-");
      await store.setJSON(backup, prev);
      const { blobs } = await store.list({ prefix: "backup/" });
      const old = blobs.map((b) => b.key).sort().slice(0, -KEEP_BACKUPS);
      await Promise.all(old.map((k) => store.delete(k)));
    }
    await store.setJSON("current", data);
    return json({ ok: true, backup: backup || "(첫 저장)" });
  }

  return json({ error: "지원하지 않는 요청입니다." }, 405);
};

export const config = { path: "/api/data" };
