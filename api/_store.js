import { head, put } from '@vercel/blob';

const BALLOTS_KEY = 'votes/ballots.json';
const VOTER_KEY = 'votes/voters.json';
const BASE_URL = process.env.BLOB_READ_WRITE_URL;

const DEFAULT_BALLOTS = [
  {
    id: 1,
    title: 'あなたの好きな動物は？',
    options: [
      { name: 'くじら', count: 0 },
      { name: 'うさぎ', count: 12 },
    ],
  },
  {
    id: 2,
    title: '今向いている方角は？',
    options: [
      { name: '北西', count: 3 },
      { name: '南東', count: 2 },
    ],
  },
];

function getBlobUrl(key) {
  if (!BASE_URL) throw new Error('BLOB_READ_WRITE_URL が設定されていません。');
  return `${BASE_URL.replace(/\/$/, '')}/${key}`;
}

async function loadJsonOrDefault(key, defaultValue) {
  try {
    const { url } = await head(getBlobUrl(key));
    const response = await fetch(url);
    if (!response.ok) throw new Error('状態ファイルの取得に失敗しました。');
    return await response.json();
  } catch (error) {
    if (error?.message?.includes('404') || error?.name === 'BlobNotFoundError') return defaultValue;
    throw error;
  }
}

export function normalizeBallots(ballots) {
  if (!Array.isArray(ballots)) return [];
  return ballots
    .map((b) => ({
      id: Number(b.id),
      title: String(b.title || '').trim(),
      options: Array.isArray(b.options)
        ? b.options
            .map((o) => ({ name: String(o.name || '').trim(), count: Number(o.count || 0) }))
            .filter((o) => o.name)
        : [],
    }))
    .filter((b) => Number.isInteger(b.id) && b.id > 0 && b.title && b.options.length > 0);
}

export async function loadBallots() {
  const data = await loadJsonOrDefault(BALLOTS_KEY, DEFAULT_BALLOTS);
  return normalizeBallots(data);
}

export async function saveBallots(ballots) {
  await put(BALLOTS_KEY, JSON.stringify(normalizeBallots(ballots), null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function loadVoters() {
  return await loadJsonOrDefault(VOTER_KEY, {});
}

export async function saveVoters(voters) {
  await put(VOTER_KEY, JSON.stringify(voters, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
