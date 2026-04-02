// ── Bolt API Proxy — Vercel Serverless Function ───────────────────────────────
// Keeps the Bolt broker token out of the client bundle.
// Client calls /api/bolt-proxy?path=/applications instead of Bolt directly.
// Token lives in BOLT_BROKER_TOKEN env var (server-side only, no VITE_ prefix).
//
// Setup:
//   1. Add BOLT_BROKER_TOKEN to Vercel project environment variables (not VITE_BOLT_BROKER_TOKEN)
//   2. Remove VITE_BOLT_BROKER_TOKEN from all .env files and Vercel settings
//   3. Deploy — the token is now server-side only

import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOLT_API_BASE = 'https://api.fundedbybolt.com/api/v1';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.BOLT_BROKER_TOKEN;
  if (!token) {
    console.error('[bolt-proxy] BOLT_BROKER_TOKEN env var not set');
    return res.status(500).json({ error: 'Broker service not configured' });
  }

  const path = (req.query.path as string) ?? '/applications';

  try {
    const upstream = await fetch(`${BOLT_API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...req.body, brokerToken: token }),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[bolt-proxy] Upstream request failed:', err);
    return res.status(502).json({ error: 'Upstream service unavailable' });
  }
}
