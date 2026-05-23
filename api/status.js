import { loadState } from './_store.js';

const COOLDOWN_MS = 8 * 60 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userId = String(req.query.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ error: 'userId は必須です。' });
  }

  const state = await loadState();
  const userVotes = state[userId] || {};
  const now = Date.now();

  const items = ['A', 'B', 'C'].map((item) => {
    const lastVoteAt = userVotes[item] || 0;
    const nextVoteAt = lastVoteAt ? lastVoteAt + COOLDOWN_MS : 0;
    return {
      item,
      canVote: !lastVoteAt || now >= nextVoteAt,
      lastVoteAt,
      nextVoteAt,
      remainingMs: nextVoteAt > now ? nextVoteAt - now : 0,
    };
  });

  return res.status(200).json({ userId, items });
}
