// AI 요약보고서 문장 작성 API
// Netlify 환경변수 ANTHROPIC_API_KEY 가 있으면 Claude가 문장을 작성하고,
// 없으면 fallback 응답 → 화면에서 '규칙 기반 자동 요약'으로 작성됩니다.
const PROMPT = `너는 전문대학 혁신지원사업단의 성과관리 담당자다. 아래 JSON은 자율성과지표의 현재 실적이다.
사업단장 보고용 요약보고서의 문장만 작성하라.
규칙:
- JSON에 있는 수치만 사용하고, 새로운 수치를 만들지 마라.
- 개조식, '~임/~함/~필요'로 끝내라.
- summary: 종합 요약 3~5문장(종합 진척률, 지표별 비교, 관리 필요 항목, 미산출 항목 영향).
- actions: 향후 조치 3~5개(담당 부서를 포함).
- 반드시 다음 JSON 형식만 출력하라: {"summary": ["..."], "actions": ["..."]}

데이터:
`;
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST만 지원합니다." }, 405);
  const key = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (!key) return json({ fallback: true, reason: "API 키 미설정" });
  try {
    const body = await req.json();
    const payload = JSON.stringify(body.data || {});
    if (payload.length > 50_000) return json({ fallback: true, reason: "데이터가 너무 큼" });
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: PROMPT + payload }],
      }),
    });
    const res = await r.json();
    if (!r.ok) throw new Error(res?.error?.message || r.status);
    const text = (res.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return json({ ...out, model: res.model });
  } catch (e) {
    console.log("AI 보고서 작성 실패:", e.message);
    return json({ fallback: true, reason: "AI 보고서 작성 실패" });
  }
};

export const config = { path: "/api/report" };
