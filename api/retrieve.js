const { URL } = require('url')

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Method not allowed' }))
    }
    // Parse code from URL
    const url = new URL(req.url, `http://${req.headers.host}`)
    const code = url.searchParams.get('code')
    if (!code || !/^[1-9]\d{4}$/.test(code)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Invalid code format.' }))
    }
    // Fetch email
    const upstashRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${code}`,
      { method: 'GET', headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
    )
    if (!upstashRes.ok) {
      throw new Error('Upstash fetch error')
    }
    const data = await upstashRes.json()
    const email = data.result ? decodeURIComponent(data.result) : null
    if (!email) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Code expired or not found.' }))
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ email }))
  } catch (err) {
    console.error('retrieve error', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Internal server error.' }))
  }
}
