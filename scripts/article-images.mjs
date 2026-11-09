// 記事1本を、X に載せる画像（1080×1350、最大4枚）と投稿文にします。各駅停車（story-images.mjs）と同じ形。
// 使い方：node scripts/article-images.mjs jishin-chizu-zahyo
//         node scripts/article-images.mjs jishin-chizu-zahyo --text-only（投稿文だけ作り直す）
// 投稿文の1行目と内容のタグは scripts/x-hooks.json の "articles"（記事のidごとに1行）
// できる場所：brand/x/articles/<記事の公開日>/（GitHub には送りません）
//   その中に <id>-1.png, <id>-2.png … と、投稿文（<id>.txt）
// 画像の中身：1枚目＝題名・要約・ポイント／2枚目から＝記事の図解（figure の SVG）と、x-hooks.json の tables で選んだ表／最後に「ひとこと」
// 本文に書いてあることだけを画像にする（記事の図と同じ決まり）。
// Microsoft Edge（Windows）か、なければ Playwright の Chromium を使って画像にします。
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { parse } from 'yaml';

const [id] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!id) {
  console.error('使い方：node scripts/article-images.mjs <記事のid>');
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, '..');
const md = fs.readFileSync(path.join(root, 'src/content/articles', `${id}.md`), 'utf8').replace(/\r\n/g, '\n');
const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const data = parse(m[1]);
const body = m[2];
const pub = data.pubDate instanceof Date ? data.pubDate.toISOString().slice(0, 10) : String(data.pubDate).slice(0, 10);

const hooks = JSON.parse(fs.readFileSync(path.join(root, 'scripts/x-hooks.json'), 'utf8'));
const conf = hooks.articles?.[id];
if (!conf) console.warn(`⚠ scripts/x-hooks.json の articles に ${id} がありません。題名だけの投稿文にします`);

// のりばの色と名前（src/data/lines.ts）
const linesTs = fs.readFileSync(path.join(root, 'src/data/lines.ts'), 'utf8');
const lineRow = linesTs.split('\n').find((l) => l.includes(`id: '${data.category}'`)) ?? '';
const color = (lineRow.match(/color: '([^']+)'/) || [])[1] ?? '#1f2a44';
const lineName = (lineRow.match(/short: '([^']+)'/) || [])[1] ?? '記事';

// ── 本文から取り出す ──
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const inline = (s) => esc(s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const sections = {};
let cur = '';
for (const line of body.split('\n')) {
  const h = line.match(/^##\s+(.+)$/);
  if (h) sections[(cur = h[1].trim())] = [];
  else if (cur) sections[cur].push(line);
}
const points = (sections['ポイント'] ?? []).filter((l) => /^- /.test(l)).map((l) => l.slice(2).trim());
const figures = [...body.matchAll(/<figure[\s\S]*?<img src="([^"]+)"[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>/g)].map((f) => ({
  // 図のある見出し（その見出しの表も、図といっしょに1枚にのせる）
  section: Object.keys(sections).find((k) => sections[k].join('\n').includes(f[1])),
  svg: fs.readFileSync(path.join(root, 'public', f[1]), 'utf8').replace(/<\?xml[^>]*\?>/, ''),
  caption: f[2].replace(/（図を押すと大きく表示します）/, '').trim(),
}));
const tableOf = (title) => {
  const rows = (sections[title] ?? []).filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l));
  return rows.map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
};
const tables = (conf?.tables ?? []).map((title) => ({ title, rows: tableOf(title) })).filter((t) => t.rows.length);

// ── 画像の形（各駅停車の画像と同じつくり） ──
const css = `
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{background:#f7f6f2;color:#1a1d24;font-family:'Yu Gothic UI','Yu Gothic','Hiragino Sans','Meiryo','Noto Sans JP','Noto Sans CJK JP',sans-serif;font-weight:500;
  display:flex;flex-direction:column;border:14px solid ${color}}
.head{background:#1f2a44;color:#fff;padding:34px 56px 30px;border-bottom:12px solid ${color}}
.kind{display:inline-block;background:${color};color:#fff;font-weight:800;font-size:26px;padding:2px 16px;border-radius:8px;letter-spacing:.1em}
.series{display:inline-block;margin-left:14px;color:#ffd23f;font-weight:800;font-size:30px;letter-spacing:.06em;vertical-align:middle}
.title{margin-top:14px;font-size:42px;font-weight:800;line-height:1.35;letter-spacing:.04em}
.sub{margin-top:8px;font-size:30px;font-weight:700;color:#d6dbe6;letter-spacing:.04em}
.body{flex:1;padding:44px 64px 0;font-size:34px;line-height:1.75}
.lead{margin-bottom:28px}
h2{font-size:40px;font-weight:800;margin-bottom:22px;padding-left:18px;border-left:12px solid ${color};line-height:1.3}
ul{list-style:none;padding:0}
li{background:#fff;border-radius:12px;padding:20px 26px 20px 64px;margin-bottom:18px;position:relative;line-height:1.6}
li::before{content:'';position:absolute;left:24px;top:34px;width:20px;height:20px;border-radius:50%;background:${color}}
b{color:#7c2d12;background:linear-gradient(transparent 60%,#ffe58a 60%)}
.fig{background:#fff;border-radius:12px;padding:16px}
.fig svg{display:block;width:100%;height:auto}
.cap{margin-top:22px;font-size:32px;font-weight:600}
table{width:100%;border-collapse:collapse;background:#fff;font-size:29px;line-height:1.55}
th,td{border:2px solid #c9ced8;padding:14px 16px;vertical-align:top;text-align:left}
thead th{background:#1f2a44;color:#fff;font-weight:800}
tbody th{background:#f1ede4;font-weight:800;white-space:nowrap}
.point{background:#fff;border-left:12px solid #ffd23f;border-radius:10px;padding:26px 30px;font-size:32px;line-height:1.75;font-weight:600}
.point .t{display:block;font-weight:800;margin-bottom:8px}
.more{margin-top:34px;font-size:32px;font-weight:700;text-align:center;color:#464c58}
.foot{display:flex;justify-content:space-between;align-items:center;padding:22px 56px 26px;font-size:26px;font-weight:700;color:#464c58}
.foot .brand{display:flex;align-items:center;gap:12px}
.foot .mark{display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#1f2a44;color:#fff;font-weight:800}
`;
// 題名は「？」のあとで2行に分ける（例：地震で…どうなる？／熊本地震と…から）
const [t1, t2] = (() => {
  const i = data.title.search(/[？?]\s/);
  return i > 0 ? [data.title.slice(0, i + 1), data.title.slice(i + 2)] : [data.title, ''];
})();
const pagesHtml = [];
pagesHtml.push(`<div class="head"><span class="kind">${esc(lineName)}</span><span class="series">筆界ステーションの記事</span>
<div class="title">${esc(t1)}</div>${t2 ? `<div class="sub">${esc(t2)}</div>` : ''}</div>
<div class="body"><p class="lead">${inline(data.summary)}</p>${points.length ? `<h2>ポイント</h2><ul>${points.map((p) => `<li>${inline(p)}</li>`).join('')}</ul>` : ''}</div>`);
const tableHtml = (rows) => {
  const [head, ...rest] = rows;
  return `<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>
<tbody>${rest.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th>${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table>`;
};
for (const f of figures) {
  const rows = f.section ? tableOf(f.section) : [];
  pagesHtml.push(`<div class="body">${f.section ? `<h2>${esc(f.section)}</h2>` : ''}${rows.length ? tableHtml(rows) : ''}
<div class="fig" style="margin-top:${rows.length ? 30 : 0}px">${f.svg}</div><p class="cap">${inline(f.caption)}</p></div>`);
}
for (const t of tables) pagesHtml.push(`<div class="body"><h2>${esc(t.title)}</h2>${tableHtml(t.rows)}</div>`);
// 最後の1枚に「ひとこと」をつける（4枚をこえるときは、図・表を減らす）
while (pagesHtml.length > 4) pagesHtml.splice(pagesHtml.length - 1, 1);
const lastIdx = pagesHtml.length - 1;
pagesHtml[lastIdx] = pagesHtml[lastIdx].replace(/<\/div>$/, `<div class="point" style="margin-top:30px"><span class="t">📍 ひとこと</span>${inline(data.comment)}</div><p class="more">くわしくは、サイトの記事で ▶</p></div>`);

const outDir = path.join(root, 'brand/x/articles', pub);
fs.mkdirSync(outDir, { recursive: true });
const textOnly = process.argv.includes('--text-only');
const files = textOnly
  ? fs.readdirSync(outDir).filter((f) => f.startsWith(`${id}-`) && f.endsWith('.png')).sort().map((f) => path.join(outDir, f))
  : [];
if (!textOnly) {
  const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
  let browser = null;
  if (!edge) {
    // Edge がないとき（Claude の作業場所など）は、入っている Playwright を使う
    const { chromium } = createRequire(import.meta.url)('playwright');
    browser = await chromium.launch();
  }
  for (const [i, inner] of pagesHtml.entries()) {
    const isLast = i === pagesHtml.length - 1;
    const html = `<!doctype html><meta charset="utf-8"><style>${css}</style>${inner}
<div class="foot"><span class="brand"><span class="mark">筆</span>筆界ステーション｜hikkai-station.com</span><span>${isLast ? 'おわり　' : 'つづく →　'}${i + 1}/${pagesHtml.length}</span></div>`;
    const png = path.join(outDir, `${id}-${i + 1}.png`);
    if (edge) {
      const htmlPath = path.join(outDir, `_tmp-${i}.html`);
      fs.writeFileSync(htmlPath, html);
      const profile = path.join(os.tmpdir(), 'hikkai-story-images-edge');
      execFileSync(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1350', `--user-data-dir=${profile}`, `--screenshot=${png}`, 'file:///' + htmlPath.replace(/\\/g, '/')], { stdio: 'ignore' });
      fs.unlinkSync(htmlPath);
    } else {
      const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
      await page.setContent(html);
      await page.screenshot({ path: png });
      await page.close();
    }
    if (!fs.existsSync(png)) throw new Error(`画像ができませんでした：${png}`);
    files.push(png);
  }
  await browser?.close();
}

// 投稿文（各駅停車と同じ形）
// 形：1行目＝暮らしの中の疑問（x-hooks.json）→ 📰筆界ステーションの記事 → 題名 → ▼リンク → タグ
// タグ：「#土地家屋調査士 #内容 #筆界ステーション」（内容のタグがないときは2つ）
const url = `https://hikkai-station.com/articles/${id}/`;
const weight = (s) => [...s.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].reduce((n, ch) => n + (ch.codePointAt(0) < 0x1100 ? 1 : 2), 0);
const tags = ['土地家屋調査士', ...(conf?.tag && conf.tag !== '土地家屋調査士' ? [conf.tag] : []), '筆界ステーション'].map((x) => `#${x}`).join(' ');
const build = (withNote, withSub) => [
  ...(conf ? [conf.hook, ''] : []),
  `📰筆界ステーションの記事（${lineName}）`,
  `「${withSub ? data.title : t1}」`, '',
  ...(withNote ? ['▼図と表で、サイトにまとめました'] : []),
  url,
  tags,
].join('\n');
let post = build(true, true);
if (weight(post) > 280) post = build(true, false);
if (weight(post) > 280) post = build(false, false);
const intent = `https://x.com/intent/post?text=${encodeURIComponent(post)}`;
const txt = `■ 投稿する記事：${data.title}（${pub} 公開）\n\n■ 本文（画像${files.length}枚をつけて、この1つだけを投稿）※${weight(post)}/280\n${post}\n\n■ 投稿画面を開くリンク（画像は自分でつけてください）\n${intent}\n`;
fs.writeFileSync(path.join(outDir, `${id}.txt`), txt);
console.log(files.map((f) => path.relative(root, f)).join('\n'));
console.log(`投稿文：${path.relative(root, path.join(outDir, `${id}.txt`))}（${weight(post)}/280）`);
