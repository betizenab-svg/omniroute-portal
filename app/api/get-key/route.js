import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// 1. Function to verify if email exists in Google Sheet
async function isEmailInSheet(email) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:Z'; // Adjust sheet tab name if needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    const normalizedTargetEmail = email.trim().toLowerCase();

    // Check if any cell in any row matches the target email
    return rows.some(row =>
      row.some(cell => cell.toString().trim().toLowerCase() === normalizedTargetEmail)
    );
  } catch (error) {
    console.error('Error reading Google Sheet:', error);
    return false;
  }
}

// 2. Function to check if key already exists on OmniRoute
async function getExistingKey(email) {
  try {
    const omniResponse = await fetch(`${process.env.OMNIROUTE_VPS_URL}/api/keys`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OMNIROUTE_ADMIN_TOKEN}`,
      },
    });

    if (!omniResponse.ok) return null;

    const keysData = await omniResponse.json();
    const keyList = Array.isArray(keysData) ? keysData : keysData.keys || [];

    const targetName = `User-${email.trim().toLowerCase()}`;
    const existing = keyList.find(k => k.name?.toLowerCase() === targetName);

    return existing ? (existing.key || existing.token || existing.secret || existing.apiKey) : null;
  } catch (error) {
    console.error('Error fetching existing key:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Step A: Verify email exists in Google Sheet
    const authorized = await isEmailInSheet(cleanEmail);
    if (!authorized) {
      return NextResponse.json(
        { error: 'Access denied. This email was not found in our form responses.' },
        { status: 403 }
      );
    }

    // Step B: Check if an API key was already generated for this email
    const existingKey = await getExistingKey(cleanEmail);
    if (existingKey) {
      return NextResponse.json({
        apiKey: existingKey,
        message: 'Your previously generated API key has been retrieved.',
      });
    }

    // Step C: Generate a new restricted key if none exists
    const omniResponse = await fetch(`${process.env.OMNIROUTE_VPS_URL}/api/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OMNIROUTE_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({
        name: `User-${cleanEmail}`,
        modelAccessMode: 'restricted',
        allowedModels: [],
        allowedCombos: ['combo/*'],
      }),
    });

    if (!omniResponse.ok) {
      return NextResponse.json({ error: 'Failed to communicate with OmniRoute server.' }, { status: 500 });
    }

    const keyData = await omniResponse.json();
    const apiKey = keyData.key || keyData.token || keyData.secret || keyData.apiKey;

    return NextResponse.json({ apiKey });
  } catch (err) {
    console.error('Handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
