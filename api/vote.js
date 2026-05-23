import { loadState, saveState } from './_store.js';

const COOLDOWN_MS = 8 * 60 * 60 * 1000;
const VALID_ITEMS = new Set(['A', 'B', 'C']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId, item } = req.body || {};
  const cleanUserId = String(userId || '').trim();
  const cleanItem = String(item || '').trim();

  if (!cleanUserId || !VALID_ITEMS.has(cleanItem)) {
    return res.status(400).json({ error: 'userId と item(A/B/C) は必須です。' });
  }

  const state = await loadState();
  const now = Date.now();

  state[cleanUserId] ||= {};

  const lastVoteAt = state[cleanUserId][cleanItem] || 0;
  const nextVoteAt = lastVoteAt + COOLDOWN_MS;

  if (lastVoteAt && now < nextVoteAt) {
    return res.status(429).json({
      error: 'まだ投票できません。',
      remainingMs: nextVoteAt - now,
      nextVoteAt,
    });
  }

  state[cleanUserId][cleanItem] = now;
  await saveState(state);

  return res.status(200).json({
    ok: true,
    userId: cleanUserId,
    item: cleanItem,
    votedAt: now,
    nextVoteAt: now + COOLDOWN_MS,
  });
}
