import { loadBallots, loadVoters, saveBallots, saveVoters } from './_store.js';

function getVoterFingerprint(req) {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
  const ua = String(req.headers['user-agent'] || '').trim();
  return `${ip}::${ua}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { categoryId, optionName } = req.body || {};
  const id = Number(categoryId);
  const name = String(optionName || '').trim();
  if (!Number.isInteger(id) || !name) return res.status(400).json({ error: 'categoryId と optionName は必須です。' });

  const fingerprint = getVoterFingerprint(req);
  if (!fingerprint || fingerprint === '::') return res.status(400).json({ error: '投票者の識別に失敗しました。' });

  const [ballots, voters] = await Promise.all([loadBallots(), loadVoters()]);
  if (voters[fingerprint]) return res.status(409).json({ error: 'このブラウザ/IPからは既に投票済みです。' });

  const category = ballots.find((b) => b.id === id);
  if (!category) return res.status(404).json({ error: '投票カテゴリが見つかりません。' });

  const option = category.options.find((o) => o.name === name);
  if (!option) return res.status(404).json({ error: '投票項目が見つかりません。' });

  option.count += 1;
  voters[fingerprint] = { categoryId: id, optionName: name, votedAt: Date.now() };

  await Promise.all([saveBallots(ballots), saveVoters(voters)]);
  return res.status(200).json({ ok: true, categoryId: id, optionName: name });
}
