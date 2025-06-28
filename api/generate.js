export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Generate 5-digit code
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  // Store in Upstash with 5-minute TTL
  const upstashRes = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/set/${code}/${encodeURIComponent(email)}?EX=300`,
    { method: 'POST', headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
  );

  if (!upstashRes.ok) {
    return res.status(500).json({ error: 'Failed to store code.' });
  }

  return res.status(200).json({ code });
}
