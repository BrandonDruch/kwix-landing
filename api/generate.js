// Uses micro to parse JSON and send tidy JSON responses
const { json, send } = require('micro');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return send(res, 405, { error: 'Method not allowed' });
    }

    // parse body
    const body = await json(req);
    const email = (body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return send(res, 400, { error: 'Invalid email address.' });
    }

    // generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // store in Upstash with 5m TTL
    const upstashRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/set/${code}/${encodeURIComponent(email)}?EX=300`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      }
    );
    if (!upstashRes.ok) {
      return send(res, 500, { error: 'Failed to store code.' });
    }

    return send(res, 200, { code });
  } catch (err) {
    // log to Vercel function logs
    console.error('generate error:', err);
    return send(res, 500, { error: 'Internal server error.' });
  }
};
