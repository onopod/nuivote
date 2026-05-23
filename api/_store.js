import { head, put } from '@vercel/blob';

const KEY = 'votes/state.json';
const BASE_URL = process.env.BLOB_READ_WRITE_URL;

function getBlobUrl() {
  if (!BASE_URL) {
    throw new Error('BLOB_READ_WRITE_URL が設定されていません。');
  }
  return `${BASE_URL.replace(/\/$/, '')}/${KEY}`;
}

export async function loadState() {
  try {
    const { url } = await head(getBlobUrl());
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('状態ファイルの取得に失敗しました。');
    }
    return await response.json();
  } catch (error) {
    if (error?.message?.includes('404')) {
      return {};
    }
    if (error?.name === 'BlobNotFoundError') {
      return {};
    }
    throw error;
  }
}

export async function saveState(state) {
  await put(KEY, JSON.stringify(state, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
