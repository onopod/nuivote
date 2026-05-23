import { loadBallots, normalizeBallots, saveBallots } from './_store.js';

function isAuthorized(req) {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Basic ')) return false;
  const token = header.slice(6);
  const plain = Buffer.from(token, 'base64').toString('utf8');
  const [user, pass] = plain.split(':');
  return user === (process.env.ADMIN_USER || 'admin') && pass === (process.env.ADMIN_PASS || 'admin');
}

function reject(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="admin"');
  return res.status(401).json({ error: 'Unauthorized' });
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) return reject(res);
  if (req.method === 'GET') return res.status(200).json({ ballots: await loadBallots() });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { ballots } = req.body || {};
  const normalized = normalizeBallots(ballots);
  if (normalized.length === 0) return res.status(400).json({ error: '有効な投票カテゴリを1件以上指定してください。' });

  await saveBallots(normalized);
  return res.status(200).json({ ok: true, ballots: normalized });
}
