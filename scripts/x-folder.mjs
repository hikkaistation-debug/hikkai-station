// X に載せる画像と投稿文の置き場所（brand/x/。GitHub には送りません）
// 画像を作った日（日本時間）ごとのフォルダに入れる：brand/x/<作った日>/  例：brand/x/2026-11-13/
//   新しい順に見るときは、エクスプローラーで「名前」を1回押して並びを逆にします。
// 前の置き場所（brand/x/stories/<公開日>/、brand/x/articles/<公開日>/）にあるものも、findX で見つけられます。
import fs from 'node:fs';
import path from 'node:path';

export const root = path.resolve(import.meta.dirname, '..');
export const xRoot = path.join(root, 'brand', 'x');

export const todayJst = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });

// 今日のフォルダ（なければ作る）
export function todayDir() {
  const dir = path.join(xRoot, todayJst());
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// brand/x の中から、名前が name のファイルを探す（いちばん新しい日のフォルダのものを返す）
export function findX(name) {
  const hits = [];
  const walk = (dir, depth) => {
    if (depth > 3 || !fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.name === name) hits.push(p);
    }
  };
  walk(xRoot, 0);
  // フォルダ名（日付）が新しいものを先に
  hits.sort((a, b) => path.basename(path.dirname(b)).localeCompare(path.basename(path.dirname(a))));
  return hits[0] ?? null;
}

// 同じフォルダの中で、prefix で始まる画像（png）を、名前順に
export const imagesBeside = (file, prefix) =>
  fs
    .readdirSync(path.dirname(file))
    .filter((f) => f.startsWith(prefix) && f.endsWith('.png'))
    .sort()
    .map((f) => path.join(path.dirname(file), f));
