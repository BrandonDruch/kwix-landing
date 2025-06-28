
import { NextResponse } from 'next/server'

export async function POST(request) {
  const body = await request.json()
  const email = body.email?.trim().toLowerCase()

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const code = Math.floor(10000 + Math.random() * 90000).toString() // 5-digit code
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL + "/set/" + code + "/" + encodeURIComponent(email) + "?EX=300", {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to store code.' }, { status: 500 })
  }

  return NextResponse.json({ code })
}
