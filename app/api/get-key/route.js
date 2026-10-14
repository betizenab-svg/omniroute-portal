import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const omniResponse = await fetch(`${process.env.OMNIROUTE_VPS_URL}/api/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OMNIROUTE_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ name: `User-${email}` }),
    });

    if (!omniResponse.ok) {
      return NextResponse.json({ error: 'Failed to communicate with OmniRoute server.' }, { status: 500 });
    }

    const keyData = await omniResponse.json();
    const apiKey = keyData.key || keyData.token || keyData.secret || keyData.apiKey;

    return NextResponse.json({ apiKey });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
