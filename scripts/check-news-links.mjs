// 発車標（ニュース）のリンク切れを調べるスクリプト
//
// feed: true の記事・下書きの sourceUrl を1つずつ開いてみて、見られなくなったもの（404 など）を一覧にします。
// ファイルの書きかえはしません。リンクが切れていたら、そのファイルを削除するか feed: false にしてください。
//
// 使い方： npm run news-check

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'src', 'content', 'articles');

async function listMd(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listMd(p)));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const field = (head, name) => {
  const v = head.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].replace(/\s+#.*$/, '').trim() ?? '';
  try {
    return JSON.parse(v);
  } catch {
    return v.replace(/^["']|["']$/g, '');
  }
};

async function check(url) {
  const opts = { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (hikkai-station link check)' }, signal: AbortSignal.timeout(20000) };
  try {
    let res = await fetch(url, { ...opts, method: 'HEAD' });
    // HEAD をことわるサイトがあるので、そのときは GET でもう一度
    if (res.status >= 400) res = await fetch(url, { ...opts, method: 'GET' });
    return res.status;
  } catch (e) {
    return `つながらない（${e.cause?.code ?? e.name}）`;
  }
}

const items = [];
for (const file of await listMd(DIR)) {
  const head = (await readFile(file, 'utf8')).split(/^---$/m)[1] ?? '';
  if (!/^feed:\s*true\b/m.test(head)) continue;
  items.push({ file: path.relative(ROOT, file), title: field(head, 'title'), url: field(head, 'sourceUrl') });
}

console.log(`発車標のニュース ${items.length}件のリンクを調べます…`);
const bad = [];
for (const it of items) {
  const status = await check(it.url);
  const ok = typeof status === 'number' && status < 400;
  if (!ok) bad.push({ ...it, status });
  console.log(`${ok ? 'OK  ' : 'NG  '} ${status}  ${it.title}`);
}
console.log('');
if (bad.length === 0) {
  console.log('リンク切れはありませんでした。');
} else {
  console.log(`見られないかもしれないもの：${bad.length}件（ブラウザでも開いて確かめてから、削除するか feed: false にしてください）`);
  for (const b of bad) console.log(`- ${b.file}\n  ${b.title}\n  ${b.url}（${b.status}）`);
}
