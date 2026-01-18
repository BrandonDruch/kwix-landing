export default async function handler(req, res) {
  try {
    const URL = process.env.UPSTASH_REDIS_REST_URL;
    const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!URL || !TOKEN) {
      return res.status(500).json({ ok: false, error: "Missing env vars" });
    }

    const base = URL.endsWith("/") ? URL.slice(0, -1) : URL;

    const upstashRes = await fetch(`${base}/ping`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (!upstashRes.ok) {
      const text = await upstashRes.text();
      console.error("Upstash ping failed:", upstashRes.status, text);
      return res.status(500).json({ ok: false });
    }

    return res.status(200).json({ ok: true, ts: Date.now() });
  } catch (err) {
    console.error("health.js error:", err);
    return res.status(500).json({ ok: false });
  }
}
