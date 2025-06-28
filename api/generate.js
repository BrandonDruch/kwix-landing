module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
    // Parse JSON body
    let body = ''
    for await (const chunk of req) body += chunk
    let data
    try {
      data = JSON.parse(body)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Invalid JSON' }))
    }
    const email = (data.email || '').trim().toLowerCase()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'Invalid email address.' }))
    }
    // Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString()
    // Store in Upstash
    const upstashRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/set/${code}/${encodeURIComponent(email)}?EX=300`,
      { method: 'POST', headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
    )
    if (!upstashRes.ok) {
      throw new Error('Upstash error')
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ code }))
  } catch (err) {
    console.error('generate error', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Internal server error.' }))
  }
}
