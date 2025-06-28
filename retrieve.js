
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!/^[1-9]\d{4}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid code format.' }, { status: 400 })
  }

  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL + "/get/" + code, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  })

  const data = await res.json()

  if (!data.result) {
    return NextResponse.json({ error: 'Code expired or not found.' }, { status: 404 })
  }

  return NextResponse.json({ email: decodeURIComponent(data.result) })
}
