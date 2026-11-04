// 車内の読み物の1話を、X に載せる画像（1080×1350、最大4枚）にします。
// 使い方：node scripts/story-images.mjs kakueki 01
//         node scripts/story-images.mjs kakueki 01 --text-only（投稿文だけ作り直す）
// 投稿文の1行目は scripts/x-hooks.json（新しい話を書いたら、そこにも1行足す）
// できる場所：brand/x/stories/<投稿する日>/（GitHub には送りません）
//   投稿する日＝その話の公開日（pubDate）。例：brand/x/stories/2026-11-05/
//   その中に kakueki-03-1.png, kakueki-03-2.png … と、投稿文（kakueki-03.txt）
// Microsoft Edge を使って画像にします。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';

const [train, no] = process.argv.slice(2);
if (!train || !no) {
  console.error('使い方：node scripts/story-images.mjs kakueki 01');
  process.exit(1);
}
const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'src/content/stories', train, `${no}.md`);
const md = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');
const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const data = parse(m[1]);
const pub = data.pubDate instanceof Date ? data.pubDate.toISOString().slice(0, 10) : String(data.pubDate).slice(0, 10);
const paras = m[2]
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter(Boolean)
  .map((p) => (/^<hr/.test(p) ? '◇' : p.replace(/<[^>]+>/g, '')));

const TRAINS = {
  kakueki: { kind: '各駅停車', title: 'みのりの境界日誌', color: '#4d7c0f' },
  tokkyu: { kind: '特急', title: 'ばあちゃんの杭', color: '#7c2d12' },
};
const t = TRAINS[train];

// ── ページ分け（文字数から行数を見積もる） ──
const CPL = 24; // 1行の文字数
const FIRST = 15.5; // 1枚目に入る行数（見出しがあるぶん少ない）
const OTHER = 19.5; // 2枚目以降に入る行数
const lines = (p) => (p === '◇' ? 1.5 : Math.ceil([...p].length / CPL) + 0.35);
const pointLines = Math.ceil([...data.point].length / 26) + 2.6;
const pages = [[]];
let used = 0;
for (const p of paras) {
  const cap = pages.length === 1 ? FIRST : OTHER;
  if (used + lines(p) > cap && pages.at(-1).length) {
    pages.push([]);
    used = 0;
  }
  pages.at(-1).push(p);
  used += lines(p);
}
const lastCap = pages.length === 1 ? FIRST : OTHER;
const pointOnOwnPage = used + pointLines > lastCap;
if (pointOnOwnPage) pages.push([]);
if (pages.length > 4) console.warn(`※ ${pages.length}枚になりました。X に一度に載せられるのは4枚までです。`);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const css = `
*{box-sizing:border-box;margin:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{background:#f7f6f2;color:#1a1d24;font-family:'Yu Mincho','YuMincho','Hiragino Mincho ProN','Noto Serif JP',serif;font-weight:500;
  display:flex;flex-direction:column;border:14px solid ${t.color}}
.head{background:#1f2a44;color:#fff;padding:34px 56px 30px;border-bottom:12px solid ${t.color};font-family:'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif}
.kind{display:inline-block;background:${t.color};color:#fff;font-weight:800;font-size:26px;padding:2px 16px;border-radius:8px;letter-spacing:.1em}
.series{display:inline-block;margin-left:14px;color:#ffd23f;font-weight:800;font-size:30px;letter-spacing:.06em;vertical-align:middle}
.title{margin-top:12px;font-size:52px;font-weight:800;letter-spacing:.06em}
.body{flex:1;padding:48px 70px 0;font-size:36px;line-height:1.85;letter-spacing:.02em}
.body p{margin-bottom:.35em}
.body p.sep{text-align:center;color:#8a8f99;letter-spacing:.4em;margin:.4em 0 .6em}
.point{margin-top:28px;background:#fff;border-left:12px solid #ffd23f;border-radius:10px;padding:22px 28px;font-family:'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif;font-size:30px;line-height:1.7;font-weight:600}
.point b{display:block;font-size:30px;margin-bottom:6px}
.foot{display:flex;justify-content:space-between;align-items:center;padding:22px 56px 26px;font-family:'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif;font-size:26px;font-weight:700;color:#464c58}
.foot .brand{display:flex;align-items:center;gap:12px}
.foot .mark{display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#1f2a44;color:#fff;font-weight:800}
`;
const outDir = path.join(root, 'brand/x/stories', pub);
fs.mkdirSync(outDir, { recursive: true });
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
// --text-only を付けると、画像は作り直さず、投稿文（txt）だけ作り直す
const textOnly = process.argv.includes('--text-only');
const files = textOnly
  ? fs.readdirSync(outDir).filter((f) => f.startsWith(`${train}-${no}-`) && f.endsWith('.png')).sort().map((f) => path.join(outDir, f))
  : [];
if (!textOnly) pages.forEach((ps, i) => {
  const isLast = i === pages.length - 1;
  const html = `<!doctype html><meta charset="utf-8"><style>${css}</style>
${i === 0 ? `<div class="head"><span class="kind">${t.kind}</span><span class="series">${t.title}</span><div class="title">第${data.no}話　${esc(data.title)}</div></div>` : ''}
<div class="body">${ps.map((p) => (p === '◇' ? '<p class="sep">◇◇◇</p>' : `<p>${esc(p)}</p>`)).join('')}
${isLast ? `<div class="point"><b>📍 今日のひとこと</b>${esc(data.point)}</div>` : ''}</div>
<div class="foot"><span class="brand"><span class="mark">筆</span>筆界ステーション｜車内の読み物｜hikkai-station.com</span><span>${isLast ? 'おわり　' : 'つづく →　'}${i + 1}/${pages.length}</span></div>`;
  const htmlPath = path.join(outDir, `_tmp-${i}.html`);
  fs.writeFileSync(htmlPath, html);
  const png = path.join(outDir, `${train}-${no}-${i + 1}.png`);
  execFileSync(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1350', `--screenshot=${png}`, 'file:///' + htmlPath.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.unlinkSync(htmlPath);
  files.push(png);
});

// 投稿文（本文は画像なので、文は短く。サイトのリンクも本文に入れて、1つの投稿で予約投稿できるようにする）
// 形：1行目＝暮らしの中の疑問（scripts/x-hooks.json）→ 🚃毎朝6時の1分小説 → 話数・題名 → リンク → 次の駅 → タグ
const url = `https://hikkai-station.com/yomimono/${train}/${no}/`;
// X の文字数（日本語は1字＝2、URLは23）
const weight = (s) => [...s.replace(/https?:\/\/\S+/g, 'x'.repeat(23))].reduce((n, ch) => n + (ch.codePointAt(0) < 0x1100 ? 1 : 2), 0);
const hooks = JSON.parse(fs.readFileSync(path.join(root, 'scripts/x-hooks.json'), 'utf8'));
const hook = hooks[train]?.[Number(data.no)];
if (!hook) console.warn(`⚠ scripts/x-hooks.json に ${train} の第${data.no}話の1行目がありません。題名だけの投稿文にします`);
// 次の話（あれば）
const nextNo = String(Number(no) + 1).padStart(2, '0');
const nextSrc = path.join(root, 'src/content/stories', train, `${nextNo}.md`);
const nextTitle = fs.existsSync(nextSrc) ? (fs.readFileSync(nextSrc, 'utf8').match(/^title:\s*(.+)$/m) || [])[1]?.trim() : null;
const lead = train === 'kakueki' ? '🚃毎朝6時の1分小説' : `🚄${t.kind}`;
const build = (withNote, withNext) => [
  ...(hook ? [hook.hook, ''] : []),
  lead,
  `${t.title} 第${data.no}話「${data.title}」`, '',
  ...(withNote ? ['▼解説つきで、サイトでも読めます'] : []),
  url,
  ...(withNext ? [nextTitle ? `次の駅▶第${Number(nextNo)}話「${nextTitle}」` : '次の駅は、ただいま準備中です'] : []),
  `#連載小説${hook ? ` #${hook.tag}` : ' #土地家屋調査士'} #筆界ステーション`,
].join('\n');
let post = build(true, true);
if (weight(post) > 280) post = build(false, true); // 長すぎたら短くする
if (weight(post) > 280) post = build(false, false);
const intent = `https://x.com/intent/post?text=${encodeURIComponent(post)}`;
const txt = `■ 投稿する日時：${pub} 6:00（予約投稿）\n\n■ 本文（画像${files.length}枚をつけて、この1つだけを予約投稿）※${weight(post)}/280\n${post}\n\n■ 投稿画面を開くリンク（画像は自分でつけてください）\n${intent}\n`;
fs.writeFileSync(path.join(outDir, `${train}-${no}.txt`), txt);
console.log(files.map((f) => path.relative(root, f)).join('\n'));
console.log(`投稿文：${path.relative(root, path.join(outDir, `${train}-${no}.txt`))}（${weight(post)}/280）`);
