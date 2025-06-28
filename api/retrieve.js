import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  // Validate that code is a 5-digit number (10000–99999)
  if (!code || !/^[1-9]\d{4}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid code format.' }, { status: 400 })
  }

  // Fetch the stored email from Upstash Redis
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${code}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      }
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to retrieve code.' }, { status: 500 })
  }

  const data = await res.json()
  const email = data.result ? decodeURIComponent(data.result) : null

  if (!email) {
    return NextResponse.json({ error: 'Code expired or not found.' }, { status: 404 })
  }

  // Return the associated email address
  return NextResponse.json({ email })
}
