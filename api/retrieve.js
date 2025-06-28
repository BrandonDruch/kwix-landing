const { send } = require('micro');
const { URL } = require('url');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return send(res, 405, { error: 'Method not allowed' });
    }

    // parse ?code= from URL
    const { code } = new URL(req.url, `http://${req.headers.host}`).searchParams;
    if (!code || !/^[1-9]\d{4}$/.test(code)) {
      return send(res, 400, { error: 'Invalid code format.' });
    }

    const upstashRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${code}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      }
    );
    if (!upstashRes.ok) {
      return send(res, 500, { error: 'Failed to retrieve code.' });
    }

    const data = await upstashRes.json();
    const email = data.result ? decodeURIComponent(data.result) : null;
    if (!email) {
      return send(res, 404, { error: 'Code expired or not found.' });
    }

    return send(res, 200, { email });
  } catch (err) {
    console.error('retrieve error:', err);
    return send(res, 500, { error: 'Internal server error.' });
  }
};
