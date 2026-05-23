import { loadBallots, loadVoters } from './_store.js';

function getVoterFingerprint(req) {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
  const ua = String(req.headers['user-agent'] || '').trim();
  return `${ip}::${ua}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const categoryId = Number(req.query.categoryId || 1);
  const [ballots, voters] = await Promise.all([loadBallots(), loadVoters()]);
  const category = ballots.find((b) => b.id === categoryId);
  if (!category) return res.status(404).json({ error: '投票カテゴリが見つかりません。' });

  const fingerprint = getVoterFingerprint(req);
  const votedDetail = voters[fingerprint] || null;
  return res.status(200).json({ voted: Boolean(votedDetail), category, votedDetail });
}
