// 前の置き場所（brand/x/stories/<公開日>/、brand/x/articles/<公開日>/）にある X の画像と投稿文を、
// 作った日のフォルダ（brand/x/<作った日>/）に移します。作った日は、ファイルを作った日時（なければ最後に変えた日時）で決めます。
// 使い方：node scripts/x-folder-move.mjs          … どう移すかを見せるだけ（ファイルは動かしません）
//         node scripts/x-folder-move.mjs --move   … 本当に移す
// 同じ名前のファイルが移す先にあるときは、移さずに知らせます。
import fs from 'node:fs';
import path from 'node:path';
import { xRoot } from './x-folder.mjs';

const doMove = process.argv.includes('--move');
const day = (t) => new Date(t).toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
const plan = [];
for (const kind of ['stories', 'articles']) {
  const base = path.join(xRoot, kind);
  if (!fs.existsSync(base)) continue;
  for (const d of fs.readdirSync(base)) {
    const dir = path.join(base, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      const from = path.join(dir, f);
      const st = fs.statSync(from);
      if (!st.isFile() || f.startsWith('_tmp')) continue;
      const made = st.birthtimeMs > 0 ? st.birthtimeMs : st.mtimeMs;
      plan.push({ from, to: path.join(xRoot, day(made), f) });
    }
  }
}
if (!plan.length) {
  console.log('移すものはありません（brand/x/stories と brand/x/articles に、ファイルがありません）');
  process.exit(0);
}
let moved = 0;
for (const { from, to } of plan) {
  const rel = (p) => path.relative(xRoot, p).split(path.sep).join('/');
  if (fs.existsSync(to)) {
    console.log(`× ${rel(from)} → ${rel(to)}（同じ名前があるので移しません）`);
    continue;
  }
  console.log(`${doMove ? '移した' : '移す'}：${rel(from)} → ${rel(to)}`);
  if (doMove) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    moved++;
  }
}
if (doMove) {
  // 空になった前のフォルダを片づける
  for (const kind of ['stories', 'articles']) {
    const base = path.join(xRoot, kind);
    if (!fs.existsSync(base)) continue;
    for (const d of fs.readdirSync(base)) {
      const dir = path.join(base, d);
      if (fs.statSync(dir).isDirectory() && !fs.readdirSync(dir).length) fs.rmdirSync(dir);
    }
    if (!fs.readdirSync(base).length) fs.rmdirSync(base);
  }
  console.log(`${moved}個を移しました。`);
} else {
  console.log(`\nこれは見せただけです。本当に移すときは：node scripts/x-folder-move.mjs --move`);
}
