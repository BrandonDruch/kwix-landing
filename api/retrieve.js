const { URL } = require('url');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull ?code= from the URL
  const { code } = new URL(req.url, `http://${req.headers.host}`).searchParams;
  if (!code || !/^[1-9]\d{4}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid code format.' });
  }

  // Fetch from Upstash
  const upstashRes = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${code}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    }
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
};
