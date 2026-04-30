import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

// Simple in‑memory rate limiter (IP → timestamp of last request)
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 request per minute per IP

// Environment variables (set in .env.local)
const SHEET_ID = process.env.NEWSLETTER_SHEET_ID; // Google Sheet ID where emails are stored
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // preserve line breaks

if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
  console.warn('⚠️ Newsletter API: missing required env vars.');
}

// Initialise Google Sheets client
const auth = new google.auth.JWT({
  email: SERVICE_ACCOUNT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Helper: read all stored emails
async function fetchStoredEmails(): Promise<string[]> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:A', // first column contains emails
    });
    const rows = res.data.values || [];
    return rows.map((r) => r[0].toString().toLowerCase());
  } catch (err) {
    console.error('Error fetching emails from sheet:', err);
    return [];
  }
}

// Helper: append a new email
async function appendEmail(email: string) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'A:A',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[email]],
    },
  });
}

// Basic email regex (RFC‑822 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Spam honeypot: hidden field "website" should be empty
  if (req.body.website) {
    return res.status(400).json({ error: 'Spam detected' });
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const now = Date.now();
  const last = rateLimiter.get(ip) || 0;
  if (now - last < RATE_LIMIT_MS) {
    return res.status(429).json({ error: 'Too many requests, please wait a bit.' });
  }
  rateLimiter.set(ip, now);

  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Normalize email for duplicate check
  const normalized = email.trim().toLowerCase();
  const stored = await fetchStoredEmails();
  if (stored.includes(normalized)) {
    return res.status(409).json({ error: 'Email already subscribed' });
  }

  try {
    await appendEmail(normalized);
    return res.status(200).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Error writing to sheet:', err);
    return res.status(500).json({ error: 'Failed to store email' });
  }
}
