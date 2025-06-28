export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = req.query.code;
  if (!code || !/^[1-9]\d{4}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid code format.' });
  }

  const upstashRes = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${code}`,
    { method: 'GET', headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
  );

  if (!upstashRes.ok) {
    return res.status(500).json({ error: 'Failed to retrieve code.' });
  }

  const data = await upstashRes.json();
  const email = data.result ? decodeURIComponent(data.result) : null;

  if (!email) {
    return res.status(404).json({ error: 'Code expired or not found.' });
  }

  return res.status(200).json({ email });
}
