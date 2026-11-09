// 筆界ステーションチェックのページ（Claude アプリの、運営者だけが見られる非公開ページ）を作る。
// 使い方：STATION_CHECK_DRAFTS=1 npx astro build --outDir <作業用のフォルダ> のあと
//         node scripts/station-check-page.mjs <出力するHTMLのパス> [比べる相手。ふつうは origin/main] [ビルドしたフォルダ。ふつうは dist]
//   STATION_CHECK_DRAFTS=1 でビルドすると、ふつうの下書き（発車標だけのものを除く）も記事のページになり、チェックに並ぶ。
//   本物の公開用の dist/ には入れないこと（作業用のフォルダにビルドする）。
//   dist/ の記事ページから本文を取り出し、図解（SVG）はページの中に埋めこむ。
//   比べる相手（ふつうは公開中の main）から変わった記事には「今回変わった」の印をつける。
//   記事ごとに「中身の指紋（rev）」を入れておき、OK のあとで中身が変わったら、もう一度「まだ」にもどす。
// チェックの結果は、そのページのデータ（checks/<記事のid>）に保存され、Claude が直接読む。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = process.argv[2];
const base = process.argv[3] ?? 'origin/main';
const distDir = path.resolve(process.argv[4] ?? path.join(root, 'dist'));
if (!out) {
  console.error('使い方：node scripts/station-check-page.mjs <出力するHTMLのパス> [比べる相手]');
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 記事の前書き（--- で囲まれた部分）から、使う項目だけを読む
function front(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const get = (k) => {
    const r = m?.[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
    return r ? r[1].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '').trim() : '';
  };
  return { title: get('title'), category: get('category'), level: get('level'), draft: get('draft') === 'true', feed: get('feed') === 'true', summary: get('summary'), pubDate: get('pubDate'), draftNo: get('draftNo') };
}

// <div class="prose"> の中身を取り出す（div の入れ子を数える）
function prose(html) {
  const start = html.indexOf('<div class="prose">');
  if (start < 0) return '';
  let i = start + '<div class="prose">'.length;
  let depth = 1;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = i;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(i, m.index);
  }
  return '';
}

const LINES = { kyokai: ['境界', '#c4122f'], toki: ['登記', '#0a7d3e'], sokuryo: ['測量', '#b45309'], kiki: ['ツール', '#be185d'], seido: ['制度', '#0b62b4'], shiken: ['調査士試験', '#0f766e'], kiso: ['基礎', '#6d28a8'] };
const LEVELS = { easy: 'やさしい', normal: 'ふつう', expert: '専門' };

// 公開中の main から変わったファイル
let changed = new Set();
try {
  changed = new Set(execSync(`git diff --name-only ${base}...HEAD`, { cwd: root }).toString().split('\n').filter(Boolean));
} catch {
  console.warn(`${base} と比べられなかったので、「今回変わった」の印はつけません`);
}

const svgData = (src) => {
  const f = path.join(root, 'public', src);
  if (!fs.existsSync(f)) return null;
  return 'data:image/svg+xml;base64,' + fs.readFileSync(f).toString('base64');
};

const dir = path.join(root, 'src/content/articles');
const items = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const md = fs.readFileSync(path.join(dir, file), 'utf8');
  const fm = front(md);
  if (fm.feed && fm.draft) continue; // 発車標だけの下書きは記事ではないので出さない（図解もいらない）
  const htmlFile = path.join(distDir, 'articles', id, 'index.html');
  if (!fs.existsSync(htmlFile)) continue;
  let body = prose(fs.readFileSync(htmlFile, 'utf8'));
  const figs = [];
  // 図解はページの中に埋めこむ。サイト内リンクは本物のサイトへ
  body = body.replace(/<a href="(\/images\/[^"]+\.svg)"[^>]*>(<img[^>]*>)<\/a>/g, (_, s, img) => img);
  body = body.replace(/<img src="(\/images\/[^"]+\.svg)"([^>]*)>/g, (all, src, rest) => {
    const data = svgData(src);
    const alt = rest.match(/alt="([^"]*)"/)?.[1] ?? '';
    const isNew = changed.has(`public${src}`);
    figs.push({ src, alt, isNew });
    return data ? `<img src="${data}"${rest.replace(/\sloading="lazy"/, '')} data-fig="${esc(src)}"${isNew ? ' data-new="1"' : ''}>` : all;
  });
  body = body.replace(/href="\/(?!\/)/g, 'href="https://hikkai-station.com/');
  const figHashes = figs.map((f) => (fs.existsSync(path.join(root, 'public', f.src)) ? fs.readFileSync(path.join(root, 'public', f.src)) : '')).join('|');
  // draft・draftNo の行は指紋に入れない（下書きを外して公開しただけで「まだ」にもどらないように）
  const rev = crypto.createHash('sha1').update(md.replace(/^(draft|draftNo):.*\n/gm, '')).update(figHashes).digest('hex').slice(0, 12);
  const mdChanged = changed.has(`src/content/articles/${file}`);
  items.push({ id, ...fm, body, figs, rev, isChanged: mdChanged || figs.some((f) => f.isNew) });
}
items.sort((a, b) => Number(b.draft) - Number(a.draft) || Number(b.isChanged) - Number(a.isChanged) || (b.pubDate > a.pubDate ? 1 : -1));

const made = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
const nChanged = items.filter((i) => i.isChanged).length;

const cards = items
  .map((it, n) => {
    const [ln, lc] = LINES[it.category] ?? [it.category, '#1f2a44'];
    return `<article class="card" id="a-${it.id}" data-id="${it.id}" data-rev="${it.rev}" data-changed="${it.isChanged ? 1 : 0}" data-draft="${it.draft ? 1 : 0}" data-title="${esc(it.title)}">
  <div class="head">
    <span class="num">${n + 1}</span>
    <span class="badge" style="background:${lc}">${esc(ln)}</span>
    <span class="badge badge--soft">${LEVELS[it.level] ?? ''}</span>
    ${it.draft ? `<span class="badge badge--draft">下書き${it.draftNo ? ` No.${it.draftNo}` : ''}</span>` : ''}
    ${it.isChanged && !it.draft ? '<span class="badge badge--new">今回変わった</span>' : ''}
    <span class="state" data-state></span>
  </div>
  <h2>${esc(it.title)}</h2>
  <p class="sum">${esc(it.summary)}</p>
  <div class="figs">${it.figs
    .map((f) => {
      const data = svgData(f.src);
      return data ? `<figure${f.isNew ? ' class="is-new"' : ''}><img src="${data}" alt="${esc(f.alt)}">${f.isNew ? '<figcaption>新しい図</figcaption>' : ''}</figure>` : '';
    })
    .join('')}${it.figs.length ? '' : '<p class="nofig">図解がありません</p>'}</div>
  <details class="body"><summary>本文を読む</summary><div class="prose">${it.body}</div>${it.draft ? '' : `<p class="open"><a href="https://hikkai-station.com/articles/${it.id}/">サイトで見る（公開中の内容）</a></p>`}</details>
  <div class="actions">
    <button type="button" class="ok" data-act="ok">OK</button>
    <button type="button" class="fix" data-act="fix">直してほしい</button>
  </div>
  <div class="note" hidden>
    <textarea rows="3" placeholder="直してほしいところ（例：2枚目の図の「期間の目安」を〇〇に）"></textarea>
    <button type="button" class="save-note">メモを保存して次へ</button>
  </div>
</article>`;
  })
  .join('\n');

const page = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>筆界ステーションチェック</title>
<style>
  :root { --navy:#1f2a44; --ink:#1a1d24; --soft:#5b6270; --line:#d9dce2; --bg:#f4f3ee; --ok:#1a7f37; --fix:#c4122f; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:'Hiragino Sans','Yu Gothic','Meiryo','Noto Sans JP',sans-serif; color:var(--ink); background:var(--bg); line-height:1.7; }
  header.top { position:sticky; top:0; z-index:5; background:var(--navy); color:#fff; padding:0.6rem 0.9rem 0.5rem; }
  header.top h1 { font-size:0.95rem; margin:0; }
  .meta { font-size:0.7rem; opacity:0.85; margin:0.1rem 0 0.4rem; }
  .bar { height:8px; background:rgb(255 255 255 / 0.25); border-radius:99px; overflow:hidden; }
  .bar span { display:block; height:100%; width:0; background:#4ade80; transition:width .3s; }
  .count { font-size:0.85rem; font-weight:700; margin:0.35rem 0 0.4rem; }
  .tabs { display:flex; gap:0.35rem; overflow-x:auto; padding-bottom:0.15rem; }
  .tabs button { flex:none; font:inherit; font-size:0.85rem; font-weight:700; color:#fff; background:transparent; border:1.5px solid rgb(255 255 255 / 0.6); border-radius:99px; padding:0.2rem 0.75rem; cursor:pointer; }
  .tabs button[aria-pressed="true"] { background:#fff; color:var(--navy); border-color:#fff; }
  main { max-width:760px; margin:0 auto; padding:0.8rem; }
  .status { font-size:0.85rem; color:var(--soft); margin:0 0 0.6rem; }
  .status[data-bad] { color:var(--fix); font-weight:700; }
  .card { background:#fff; border:1px solid var(--line); border-left:8px solid var(--line); border-radius:12px; padding:0.8rem 0.9rem; margin-bottom:0.9rem; scroll-margin-top:9rem; }
  .card[data-s="ok"] { border-left-color:var(--ok); }
  .card[data-s="fix"] { border-left-color:var(--fix); }
  .card[hidden] { display:none; }
  .head { display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center; }
  .num { font-weight:800; color:var(--soft); font-size:0.85rem; }
  .badge { font-size:0.75rem; font-weight:700; color:#fff; border-radius:99px; padding:0.05rem 0.55rem; }
  .badge--soft { background:#eef0f4; color:var(--soft); }
  .badge--new { background:#f59e0b; color:#1a1d24; }
  .badge--draft { background:#c4122f; }
  .state { margin-left:auto; font-size:0.8rem; font-weight:800; }
  .card[data-s="ok"] .state { color:var(--ok); }
  .card[data-s="fix"] .state { color:var(--fix); }
  h2 { font-size:1.05rem; margin:0.4rem 0 0.2rem; line-height:1.5; }
  .sum { font-size:0.88rem; color:var(--soft); margin:0 0 0.5rem; }
  .figs figure { margin:0 0 0.6rem; }
  .figs img, .prose img { display:block; width:100%; height:auto; border:1px solid var(--line); border-radius:8px; background:#fff; }
  .figs figure.is-new img { border:3px solid #f59e0b; }
  .figs figcaption { font-size:0.75rem; font-weight:800; color:#b45309; }
  .nofig { color:var(--fix); font-weight:700; font-size:0.9rem; }
  details.body summary { cursor:pointer; font-weight:700; color:var(--navy); padding:0.3rem 0; }
  .prose { font-size:0.95rem; border-top:1px dashed var(--line); padding-top:0.4rem; }
  .prose h2 { font-size:1.02rem; border-bottom:2px solid var(--line); padding-bottom:0.15rem; margin-top:1.1rem; }
  .prose table { display:block; overflow-x:auto; border-collapse:collapse; font-size:0.88rem; margin:0.6rem 0; }
  .prose th, .prose td { border:1px solid var(--line); padding:0.35rem 0.55rem; text-align:left; vertical-align:top; min-width:5.5em; }
  .prose thead th { background:var(--navy); color:#fff; }
  .prose figure { margin:0.8rem 0; }
  .prose figcaption { font-size:0.82rem; color:var(--soft); }
  .prose img[data-new] { border:3px solid #f59e0b; }
  .prose blockquote { margin:0.6rem 0; padding:0.3rem 0.8rem; border-left:4px solid var(--line); color:var(--soft); }
  .open { font-size:0.85rem; }
  .actions { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:0.6rem; }
  .actions button, .save-note { font:inherit; font-size:1rem; font-weight:800; border-radius:12px; padding:0.75rem; cursor:pointer; border:2px solid; }
  .ok { color:var(--ok); background:#fff; border-color:var(--ok); }
  .fix { color:var(--fix); background:#fff; border-color:var(--fix); }
  .card[data-s="ok"] .ok { background:var(--ok); color:#fff; }
  .card[data-s="fix"] .fix { background:var(--fix); color:#fff; }
  .note { margin-top:0.5rem; }
  .note textarea { width:100%; font:inherit; font-size:1rem; border:1.5px solid var(--fix); border-radius:10px; padding:0.5rem 0.6rem; }
  .save-note { width:100%; margin-top:0.4rem; color:#fff; background:var(--fix); border-color:var(--fix); }
  .empty { text-align:center; color:var(--soft); padding:2rem 0; font-weight:700; }
</style>
</head>
<body>
<header class="top">
  <h1>筆界ステーションチェック</h1>
  <p class="meta">記事 ${items.length}本（下書き ${items.filter((i) => i.draft).length}本・今回変わった ${nChanged}本）・${esc(made)} に作成</p>
  <div class="bar"><span id="bar"></span></div>
  <p class="count" id="count">読み込み中…</p>
  <div class="tabs" role="group" aria-label="しぼりこみ">
    <button type="button" data-tab="todo" aria-pressed="true">まだ</button>
    <button type="button" data-tab="draft" aria-pressed="false">下書き</button>
    <button type="button" data-tab="changed" aria-pressed="false">今回変わった</button>
    <button type="button" data-tab="fix" aria-pressed="false">直してほしい</button>
    <button type="button" data-tab="ok" aria-pressed="false">OK</button>
    <button type="button" data-tab="all" aria-pressed="false">すべて</button>
  </div>
</header>
<main>
  <p class="status" id="status">保存のしくみにつないでいます…</p>
  ${cards}
  <p class="empty" id="empty" hidden>このしぼりこみに当てはまる記事はありません。</p>
</main>
<script>
(() => {
  const cards = [...document.querySelectorAll('.card')];
  const byId = Object.fromEntries(cards.map((c) => [c.dataset.id, c]));
  const statusEl = document.getElementById('status');
  let tab = 'todo';
  const keep = new Set(); // 押したばかりの記事は、しぼりこみが変わるまで画面に残す
  let db = null, me = null;
  const state = {}; // id -> {status, note, rev}

  const cur = (c) => {
    const s = state[c.dataset.id];
    // OK のあとで中身が変わっていたら「まだ」にもどす
    if (!s || s.rev !== c.dataset.rev) return { status: '', note: s && s.rev === c.dataset.rev ? s.note : '' , stale: !!s };
    return s;
  };
  const paint = () => {
    let ok = 0, fix = 0, shown = 0;
    for (const c of cards) {
      const s = cur(c);
      c.dataset.s = s.status;
      c.querySelector('[data-state]').textContent = s.status === 'ok' ? '✓ OK' : s.status === 'fix' ? '直してほしい' : s.stale ? '変わったので もう一度' : '';
      if (s.status === 'ok') ok++;
      if (s.status === 'fix') fix++;
      const show = keep.has(c.dataset.id) || tab === 'all' || (tab === 'todo' && !s.status) || (tab === 'changed' && c.dataset.changed === '1') || (tab === 'draft' && c.dataset.draft === '1') || (tab === s.status);
      c.hidden = !show;
      if (show) shown++;
    }
    const done = ok + fix;
    document.getElementById('bar').style.width = (done / cards.length) * 100 + '%';
    document.getElementById('count').textContent = 'OK ' + ok + '本・直してほしい ' + fix + '本・まだ ' + (cards.length - done) + '本';
    document.getElementById('empty').hidden = shown > 0;
  };
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    keep.clear();
    document.querySelectorAll('.tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    paint();
    window.scrollTo({ top: 0 });
  }));

  const next = (c) => {
    const i = cards.indexOf(c);
    const n = cards.slice(i + 1).find((x) => !x.hidden && !cur(x).status) || cards.find((x) => !x.hidden && !cur(x).status && x !== c);
    if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  // 同じ記事の書きこみは1つずつ
  const queue = {};
  const save = (c, data) => {
    const id = c.dataset.id;
    keep.add(id);
    state[id] = { ...data, rev: c.dataset.rev };
    paint();
    if (!db) { statusEl.textContent = '保存のしくみにつながっていないので、この画面を閉じると消えます。'; statusEl.dataset.bad = '1'; return; }
    const doc = { status: data.status, note: data.note || '', rev: c.dataset.rev, title: c.dataset.title, updated: new Date().toISOString(), by: me || '' };
    queue[id] = (queue[id] || Promise.resolve()).then(() => db.doc('checks/' + id).set(doc)).then(() => {
      statusEl.textContent = '保存しました（' + new Date().toLocaleTimeString('ja-JP') + '）。Claude はこの結果を直接読みます。';
      delete statusEl.dataset.bad;
    }).catch(() => { statusEl.textContent = '保存できませんでした。通信を確かめて、もう一度押してください。'; statusEl.dataset.bad = '1'; });
  };

  for (const c of cards) {
    const note = c.querySelector('.note');
    const ta = note.querySelector('textarea');
    c.querySelector('[data-act=ok]').addEventListener('click', () => { note.hidden = true; save(c, { status: 'ok', note: '' }); next(c); });
    c.querySelector('[data-act=fix]').addEventListener('click', () => { note.hidden = false; ta.value = cur(c).note || ta.value; ta.focus(); save(c, { status: 'fix', note: ta.value.trim() }); });
    c.querySelector('.save-note').addEventListener('click', () => { save(c, { status: 'fix', note: ta.value.trim() }); note.hidden = true; next(c); });
  }

  paint();
  const timer = setTimeout(() => { if (!db) { statusEl.textContent = '保存のしくみにつながりませんでした。Claude アプリにログインして開き直してください。'; statusEl.dataset.bad = '1'; } }, 10000);
  (async () => {
    try {
      db = window.claude && (await window.claude.use('db'));
      const user = window.claude && (await window.claude.use('user'));
      try { me = user ? await user.id() : null; } catch {}
    } catch { db = null; }
    if (!db) return;
    db.collection('checks').onSnapshot((snap) => {
      clearTimeout(timer);
      (snap.docs || snap).forEach((d) => { const v = d.data ? d.data() : d; const id = d.id; if (byId[id]) state[id] = { status: v.status, note: v.note, rev: v.rev }; });
      for (const c of cards) { const s = cur(c); if (s.status === 'fix') { const ta = c.querySelector('textarea'); if (document.activeElement !== ta) ta.value = s.note || ''; } }
      statusEl.textContent = 'つながりました。押すと自動で保存され、ほかの端末にもすぐ反映されます。';
      delete statusEl.dataset.bad;
      paint();
    }, () => { statusEl.textContent = '保存した結果を読めませんでした。開き直してください。'; statusEl.dataset.bad = '1'; });
  })();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(out, page);
console.log(`${out} を作りました（記事 ${items.length}本、今回変わった ${nChanged}本、${Math.round(page.length / 1024)}KB）`);
