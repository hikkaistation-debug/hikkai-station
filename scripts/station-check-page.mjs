// 筆界ステーションチェックのページ（Claude アプリの、運営者だけが見られる非公開ページ）を作る。
// ひとつのページに、報告（今やること・週報・日報）と、チェック（記事と図解・ニュースの仕分け・通達・読み物のX投稿）をまとめる。
//
// 使い方：STATION_CHECK_DRAFTS=1 npx astro build --outDir <作業用のフォルダ> のあと
//         node scripts/station-check-page.mjs <出力するHTMLのパス> [比べる相手。ふつうは origin/main] [ビルドしたフォルダ。ふつうは dist]
//   STATION_CHECK_DRAFTS=1 でビルドすると、ふつうの下書き（発車標だけのものを除く）も記事のページになり、チェックに並ぶ。
//   本物の公開用の dist/ には入れないこと（作業用のフォルダにビルドする）。
//   日報・週報は git の記録から作るので、浅い clone のときは先に git fetch --unshallow origin をしておく。
//
// チェックの結果は、そのページのデータに保存され、Claude が直接読む（db_list の collection）：
//   checks/<記事のid>        記事と図解      status: ok／fix、note
//   news/<下書きのファイル名>  ニュースの仕分け status: feed（発車標に出す）／skip（出さない）、note
//   tsutatsu/<通達のid>      通達            status: ok／fix、note
//   xposts/<列車>-<番号>      読み物のX投稿   status: posted（投稿・予約した）
// どれも「中身の指紋（rev）」を入れておき、チェックのあとで中身が変わったら、もう一度「まだ」にもどす（X投稿は除く）。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2];
const base = process.argv[3] ?? 'origin/main';
const distDir = path.resolve(process.argv[4] ?? path.join(root, 'dist'));
if (!out) {
  console.error('使い方：node scripts/station-check-page.mjs <出力するHTMLのパス> [比べる相手] [ビルドしたフォルダ]');
  process.exit(1);
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hash = (...parts) => {
  const h = crypto.createHash('sha1');
  for (const p of parts) h.update(p);
  return h.digest('hex').slice(0, 12);
};
const git = (cmd) => execFileSync('git', Array.isArray(cmd) ? cmd : cmd.split(' '), { cwd: root, maxBuffer: 256 << 20, env: { ...process.env, TZ: 'Asia/Tokyo' } }).toString();
const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' }); // YYYY-MM-DD
const made = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const md2 = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
const dayLabel = (d) => `${md2(d)}（${WD[new Date(d + 'T00:00:00Z').getUTCDay()]}）`;
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const monday = (d) => addDays(d, -((new Date(d + 'T00:00:00Z').getUTCDay() + 6) % 7));

// 前書き（--- で囲まれた部分）から、1行で書いてある項目を読む
function front(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const get = (k) => {
    const r = m?.[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
    return r ? r[1].replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '').trim() : '';
  };
  return { title: get('title'), category: get('category'), level: get('level'), draft: get('draft') === 'true', feed: get('feed') === 'true', summary: get('summary'), comment: get('comment'), pubDate: get('pubDate'), draftNo: get('draftNo'), sourceName: get('sourceName'), sourceUrl: get('sourceUrl'), train: get('train'), no: get('no') };
}

// <div class="prose"> の中身を取り出す（div の入れ子を数える）
function prose(html) {
  const start = html.indexOf('<div class="prose">');
  if (start < 0) return '';
  const i = start + '<div class="prose">'.length;
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
const TRAINS = { kakueki: ['各駅停車', '#4d7c0f'], tokkyu: ['特急', '#7c2d12'] };

// 公開中の main から変わったファイル
let changed = new Set();
try {
  changed = new Set(git(`diff --name-only ${base}...HEAD`).split('\n').filter(Boolean));
} catch {
  console.warn(`${base} と比べられなかったので、「今回変わった」の印はつけません`);
}

const svgData = (src) => {
  const f = path.join(root, 'public', src);
  if (!fs.existsSync(f)) return null;
  return 'data:image/svg+xml;base64,' + fs.readFileSync(f).toString('base64');
};

// ───────── 記事と図解 ─────────
const artDir = path.join(root, 'src/content/articles');
const articles = [];
const articleTitles = {};
for (const file of fs.readdirSync(artDir).filter((f) => f.endsWith('.md'))) {
  const id = file.replace(/\.md$/, '');
  const md = fs.readFileSync(path.join(artDir, file), 'utf8');
  const fm = front(md);
  articleTitles[id] = fm.title;
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
  const rev = hash(md, figHashes);
  const mdChanged = changed.has(`src/content/articles/${file}`);
  articles.push({ id, ...fm, body, figs, rev, isChanged: mdChanged || figs.some((f) => f.isNew) });
}
articles.sort((a, b) => Number(b.draft) - Number(a.draft) || Number(b.isChanged) - Number(a.isChanged) || (b.pubDate > a.pubDate ? 1 : -1));

// ───────── ニュース（Googleアラートの下書きで、まだ発車標に出していないもの） ─────────
const inboxDir = path.join(artDir, 'inbox');
const news = [];
for (const file of fs.existsSync(inboxDir) ? fs.readdirSync(inboxDir).filter((f) => f.endsWith('.md')).sort().reverse() : []) {
  const md = fs.readFileSync(path.join(inboxDir, file), 'utf8');
  const fm = front(md);
  if (fm.feed || !fm.draft) continue; // もう発車標に出したもの・記事にしたものは仕分け済み
  const id = file.replace(/\.md$/, '');
  const bodyText = md.replace(/^---\n[\s\S]*?\n---\n?/, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  news.push({ id, ...fm, bodyText, rev: hash(md) });
}

// ───────── 通達 ─────────
let tsutatsu = [];
try {
  const mod = await import(pathToFileURL(path.join(root, 'src/data/tsutatsu.ts')).href);
  tsutatsu = mod.sortedTsutatsu ? mod.sortedTsutatsu() : mod.TSUTATSU;
} catch (e) {
  console.warn('通達のデータを読めませんでした（node --experimental-strip-types で動かしてください）：' + e.message);
}

// ───────── 読み物（小説） ─────────
const storyDir = path.join(root, 'src/content/stories');
const stories = [];
for (const train of fs.existsSync(storyDir) ? fs.readdirSync(storyDir) : []) {
  for (const file of fs.readdirSync(path.join(storyDir, train)).filter((f) => f.endsWith('.md'))) {
    const fm = front(fs.readFileSync(path.join(storyDir, train, file), 'utf8'));
    const no = Number(fm.no || file.replace(/\.md$/, ''));
    stories.push({ key: `${train}-${String(no).padStart(2, '0')}`, path: `${train}/${file.replace(/\.md$/, '')}`, train, no, title: fm.title, pubDate: fm.pubDate, summary: fm.summary });
  }
}
stories.sort((a, b) => (a.pubDate === b.pubDate ? a.train.localeCompare(b.train) || a.no - b.no : a.pubDate < b.pubDate ? -1 : 1));
const storyName = (s) => `${TRAINS[s.train]?.[0] ?? s.train} 第${s.no}話「${s.title}」`;

// ───────── 日報・週報（git の記録から） ─────────
let shallow = false;
try {
  shallow = git('rev-parse --is-shallow-repository').trim() === 'true';
} catch {}
const published = new Set();
try {
  git(`rev-list ${base}`).split('\n').filter(Boolean).forEach((h) => published.add(h));
} catch {}
const commits = [];
try {
  const raw = git(['log', base, 'HEAD', '--no-merges', '--date=format-local:%Y-%m-%d\t%H:%M', '--format=%x1e%H%x1f%ad%x1f%s', '--name-status']);
  for (const rec of raw.split('\x1e').slice(1)) {
    const [head, ...rest] = rec.split('\n');
    const [h, ad, subject] = head.split('\x1f');
    const [date, time] = ad.split('\t');
    const files = rest.filter(Boolean).map((l) => l.split('\t'));
    commits.push({ h, date, time, subject, files, live: published.has(h) });
  }
} catch (e) {
  console.warn('git の記録を読めませんでした：' + e.message);
}

// コミットを、報告に書く1行にする
function describe(c) {
  const added = (re) => c.files.filter(([s, p]) => s === 'A' && re.test(p)).map(([, p]) => p);
  const newArticles = added(/^src\/content\/articles\/[^/]+\.md$/).map((p) => path.basename(p, '.md'));
  const newFigs = added(/^public\/images\/.+\.svg$/).length;
  const newAlerts = added(/^src\/content\/articles\/inbox\/.+\.md$/).length;
  let kind = 'work';
  if (/^自動公開/.test(c.subject)) kind = 'auto';
  else if (/^Googleアラートから下書き/.test(c.subject)) kind = 'alert';
  else if (/^main を取りこむ$|^Merge /.test(c.subject)) kind = 'merge';
  return { kind, newArticles, newFigs, newAlerts };
}
const shorten = (s, n = 90) => (s.length > n ? s.slice(0, n) + '…' : s);

const days = {}; // date -> { works:[], alerts, articles:Set, figs, stories:[] }
const dayOf = (d) => (days[d] ??= { works: [], alerts: 0, articles: new Set(), figs: 0, stories: [] });
for (const c of commits) {
  const d = describe(c);
  if (d.kind === 'auto' || d.kind === 'merge') continue; // 読み物の公開は話の公開日から書く
  const day = dayOf(c.date);
  if (d.kind === 'alert') {
    day.alerts += d.newAlerts;
    continue;
  }
  d.newArticles.forEach((a) => day.articles.add(a));
  day.figs += d.newFigs;
  day.works.push({ time: c.time, text: c.subject, live: c.live });
}
const firstDay = Object.keys(days).sort()[0] ?? today;
for (const s of stories) if (s.pubDate && s.pubDate <= today && s.pubDate >= firstDay) dayOf(s.pubDate).stories.push(s);

const dayKeys = Object.keys(days).sort().reverse();
const weeks = {};
for (const d of dayKeys) (weeks[monday(d)] ??= []).push(d);
const weekKeys = Object.keys(weeks).sort().reverse();

function weekSummary(w) {
  const ds = weeks[w];
  const arts = new Set();
  let works = 0, figs = 0, alerts = 0, unpub = 0;
  const st = [];
  for (const d of ds) {
    const x = days[d];
    x.articles.forEach((a) => arts.add(a));
    works += x.works.length;
    unpub += x.works.filter((y) => !y.live).length;
    figs += x.figs;
    alerts += x.alerts;
    st.push(...x.stories);
  }
  return { arts: [...arts], works, figs, alerts, st, unpub, active: ds.filter((d) => days[d].works.length).length };
}

// 公開を待っている作業ブランチ（main に入っていないコミットがあるもの）
const waiting = [];
try {
  for (const b of git(['branch', '-r', '--format=%(refname:short)']).split('\n').filter((x) => x.startsWith('origin/claude/'))) {
    const n = Number(git(`rev-list --count --no-merges ${base}..${b}`).trim());
    if (!n) continue;
    const subs = git(`log --no-merges --format=%s ${base}..${b}`).split('\n').filter(Boolean);
    const last = git(`log -1 --date=format-local:%Y-%m-%d --format=%ad ${b}`).trim();
    waiting.push({ branch: b.replace('origin/', ''), n, subs, last });
  }
} catch {}
waiting.sort((a, b) => (a.last < b.last ? 1 : -1));

const upcoming = stories.filter((s) => s.pubDate > today && s.pubDate <= addDays(today, 7));

// ───────── HTML を組み立てる ─────────
const badge = (text, color, cls = '') => `<span class="badge ${cls}"${color ? ` style="background:${color}"` : ''}>${esc(text)}</span>`;

// チェックのカード（記事・ニュース・通達・読み物で共通の形）
// acts：[値, ボタンの文字, 色の種類, メモを書くか]
function card({ col, id, rev, title, changedMark, draft, acts, head, bodyHtml, cls = '' }) {
  return `<article class="card ${cls}" data-col="${col}" data-id="${esc(id)}" data-rev="${rev}" data-title="${esc(title)}" data-changed="${changedMark ? 1 : 0}" data-draft="${draft ? 1 : 0}" data-acts="${acts.map((a) => a[0]).join(',')}" data-noteacts="${acts.filter((a) => a[3]).map((a) => a[0]).join(',')}">
  <div class="head">${head}<span class="state" data-state></span></div>
  ${bodyHtml}
  <div class="actions" style="grid-template-columns:repeat(${acts.length},1fr)">${acts.map(([v, label, kind]) => `<button type="button" class="act act--${kind}" data-act="${v}">${esc(label)}</button>`).join('')}</div>
  <div class="note" hidden>
    <textarea rows="3" placeholder="直してほしいところ・気になったこと"></textarea>
    <button type="button" class="save-note">メモを保存して次へ</button>
  </div>
</article>`;
}

const ACT_CHECK = [['ok', 'OK', 'ok', false], ['fix', '直してほしい', 'fix', true]];

const articleCards = articles
  .map((it, n) => {
    const [ln, lc] = LINES[it.category] ?? [it.category, '#1f2a44'];
    return card({
      col: 'checks', id: it.id, rev: it.rev, title: it.title, changedMark: it.isChanged, draft: it.draft, acts: ACT_CHECK,
      head: `<span class="num">${n + 1}</span>${badge(ln, lc)}${badge(LEVELS[it.level] ?? '', '', 'badge--soft')}${it.draft ? badge(`下書き${it.draftNo ? ` No.${it.draftNo}` : ''}`, '', 'badge--draft') : ''}${it.isChanged && !it.draft ? badge('今回変わった', '', 'badge--new') : ''}`,
      bodyHtml: `<h3>${esc(it.title)}</h3>
  <p class="sum">${esc(it.summary)}</p>
  <div class="figs">${it.figs
    .map((f) => {
      const data = svgData(f.src);
      return data ? `<figure${f.isNew ? ' class="is-new"' : ''}><img src="${data}" alt="${esc(f.alt)}">${f.isNew ? '<figcaption>新しい図</figcaption>' : ''}</figure>` : '';
    })
    .join('')}${it.figs.length ? '' : '<p class="nofig">図解がありません</p>'}</div>
  <details class="body"><summary>本文を読む</summary><div class="prose">${it.body}</div>${it.draft ? '' : `<p class="open"><a href="https://hikkai-station.com/articles/${it.id}/" target="_blank" rel="noopener">サイトで見る（公開中の内容）</a></p>`}</details>`,
    });
  })
  .join('\n');

const newsCards = news
  .map((it) => {
    const [ln, lc] = LINES[it.category] ?? [it.category, '#1f2a44'];
    return card({
      col: 'news', id: it.id, rev: it.rev, title: it.title, acts: [['feed', '発車標に出す', 'ok', true], ['skip', '出さない', 'fix', false]],
      head: `${badge(`${md2(it.pubDate)} のアラート`, '', 'badge--soft')}${badge(`路線の案：${ln}`, lc)}`,
      bodyHtml: `<h3>${esc(it.title)}</h3>
  <p class="sum">${it.sourceUrl ? `<a href="${esc(it.sourceUrl)}" target="_blank" rel="noopener">元の記事を開く（${esc(it.sourceName || 'リンク')}）↗</a>` : esc(it.sourceName)}</p>
  ${it.bodyText ? `<details class="body"><summary>アラートの抜き書き</summary><div class="prose"><p>${esc(it.bodyText).replace(/\n+/g, '<br>')}</p></div></details>` : ''}`,
    });
  })
  .join('\n');

const tsutatsuCards = tsutatsu
  .map((t) =>
    card({
      col: 'tsutatsu', id: t.id, rev: hash(JSON.stringify(t)), title: t.title, acts: ACT_CHECK,
      head: `${badge(t.number, '#1f2a44')}${badge(`確かめた日 ${md2(t.checkedDate)}`, '', 'badge--soft')}`,
      bodyHtml: `<h3>${esc(t.title)}</h3>
  <p class="sum">${esc(t.date)}付け・${esc(t.issuer)}</p>
  <p class="text">${esc(t.summary)}</p>
  <p class="links"><a href="https://hikkai-station.com/tsutatsu/${esc(t.id)}/" target="_blank" rel="noopener">サイトの通達ナビで見る</a>　<a href="${esc(t.url)}" target="_blank" rel="noopener">本文（公式）↗</a></p>`,
    }),
  )
  .join('\n');

const storyCards = stories
  .map((s) => {
    const [tn, tc] = TRAINS[s.train] ?? [s.train, '#1f2a44'];
    const isLive = s.pubDate <= today;
    return card({
      col: 'xposts', id: s.key, rev: 'x', title: storyName(s), acts: [['posted', 'X に投稿した（予約した）', 'ok', false]], cls: 'card--story',
      head: `${badge(tn, tc)}${badge(`${dayLabel(s.pubDate)} ${isLive ? '公開済み' : '公開予定'}`, '', isLive ? 'badge--soft' : 'badge--new')}`,
      bodyHtml: `<h3>第${s.no}話「${esc(s.title)}」</h3><p class="sum">${esc(s.summary)}</p>${isLive ? `<p class="links"><a href="https://hikkai-station.com/yomimono/${esc(s.path)}/" target="_blank" rel="noopener">サイトで読む</a></p>` : ''}`,
    });
  })
  .join('\n');

// 報告
const weekHtml = weekKeys
  .map((w, i) => {
    const s = weekSummary(w);
    const end = addDays(w, 6);
    const nums = [
      ['作業', s.works, '件'],
      ['新しい記事', s.arts.length, '本'],
      ['新しい図解', s.figs, '枚'],
      ['読み物の公開', s.st.length, '話'],
      ['ニュースの下書き', s.alerts, '件'],
    ];
    return `<details class="week"${i < 2 ? ' open' : ''}>
  <summary><b>${md2(w)}〜${md2(end)} の週</b>${w === monday(today) ? badge('今週', '', 'badge--new') : ''}<span class="wk-sub">作業した日 ${s.active}日</span></summary>
  <div class="nums">${nums.map(([l, v, u]) => `<div class="numbox"><span class="nv">${v}<small>${u}</small></span><span class="nl">${l}</span></div>`).join('')}</div>
  ${s.arts.length ? `<p class="wk-h">新しく入れた記事</p><ul>${s.arts.map((a) => `<li>${esc(articleTitles[a] || a)}</li>`).join('')}</ul>` : ''}
  ${s.st.length ? `<p class="wk-h">公開した読み物</p><ul>${s.st.map((x) => `<li>${esc(storyName(x))}（${md2(x.pubDate)}）</li>`).join('')}</ul>` : ''}
  ${s.unpub ? `<p class="wk-note">このうち ${s.unpub}件は、まだ main に入っていない作業です（公開待ち）。</p>` : ''}
</details>`;
  })
  .join('\n');

const dayHtml = dayKeys
  .map((d, i) => {
    const x = days[d];
    const chips = [
      x.works.length && `作業 ${x.works.length}件`,
      x.articles.size && `記事 +${x.articles.size}`,
      x.figs && `図解 +${x.figs}`,
      x.stories.length && `読み物 ${x.stories.length}話`,
      x.alerts && `ニュース下書き +${x.alerts}`,
    ].filter(Boolean);
    const lines = [
      ...x.stories.map((s) => `<li class="ln ln--story"><span class="t">0:05</span><span>読み物を公開：${esc(storyName(s))}</span></li>`),
      ...(x.alerts ? [`<li class="ln ln--alert"><span class="t">朝</span><span>Googleアラートからニュースの下書きを ${x.alerts}件 追加</span></li>`] : []),
      ...[...x.works].reverse().map((w) => `<li class="ln"><span class="t">${w.time}</span><span>${esc(shorten(w.text))}${w.live ? '' : ' <em class="wait">公開待ち</em>'}</span></li>`),
    ];
    return `<details class="day"${i < 3 ? ' open' : ''}>
  <summary><b>${dayLabel(d)}</b>${d === today ? badge('今日', '', 'badge--new') : ''}<span class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</span></summary>
  <ul class="lines">${lines.join('')}</ul>
</details>`;
  })
  .join('\n');

const waitingHtml = waiting.length
  ? `<ul class="todo-list">${waiting.map((w) => `<li><b>${esc(w.subs[w.subs.length - 1] ? shorten(w.subs[w.subs.length - 1], 60) : w.branch)}</b><br><span class="muted">作業ブランチ ${esc(w.branch)}・${w.n}件・最後の作業 ${md2(w.last)}</span>${w.subs.length > 1 ? `<details><summary>中身</summary><ul>${w.subs.map((s) => `<li>${esc(shorten(s))}</li>`).join('')}</ul></details>` : ''}</li>`).join('')}</ul>`
  : '<p class="muted">ありません。作業はすべて公開ずみです。</p>';

const upcomingHtml = upcoming.length
  ? `<ul class="todo-list">${upcoming.map((s) => `<li>${dayLabel(s.pubDate)}　${esc(storyName(s))}</li>`).join('')}</ul>`
  : '<p class="muted">この1週間に公開する話はありません。</p>';

const page = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>筆界ステーションチェック</title>
<style>
  :root { --navy:#1f2a44; --ink:#1a1d24; --soft:#5b6270; --line:#d9dce2; --bg:#f4f3ee; --ok:#1a7f37; --fix:#c4122f; --amber:#f59e0b; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:'Hiragino Sans','Yu Gothic','Meiryo','Noto Sans JP',sans-serif; color:var(--ink); background:var(--bg); line-height:1.7; }
  header.top { position:sticky; top:0; z-index:5; background:var(--navy); color:#fff; padding:0.55rem 0.9rem 0.45rem; }
  header.top h1 { font-size:0.95rem; margin:0; }
  .meta { font-size:0.7rem; opacity:0.85; margin:0.05rem 0 0.4rem; }
  nav.sections { display:flex; gap:0.3rem; overflow-x:auto; padding-bottom:0.1rem; }
  nav.sections button { flex:none; font:inherit; font-size:0.85rem; font-weight:800; color:#fff; background:transparent; border:0; border-bottom:3px solid transparent; padding:0.25rem 0.55rem; cursor:pointer; }
  nav.sections button[aria-pressed="true"] { border-bottom-color:#4ade80; }
  nav.sections .cnt { display:inline-block; min-width:1.4em; margin-left:0.25rem; font-size:0.7rem; background:var(--fix); color:#fff; border-radius:99px; padding:0 0.35rem; }
  nav.sections .cnt:empty { display:none; }
  main { max-width:760px; margin:0 auto; padding:0.8rem; }
  section[hidden] { display:none; }
  .lead { font-size:0.88rem; color:var(--soft); margin:0 0 0.6rem; }
  .status { font-size:0.85rem; color:var(--soft); margin:0 0 0.6rem; }
  .status[data-bad] { color:var(--fix); font-weight:700; }
  .progress { background:#fff; border:1px solid var(--line); border-radius:12px; padding:0.55rem 0.8rem; margin-bottom:0.7rem; }
  .bar { height:8px; background:#e6e8ec; border-radius:99px; overflow:hidden; }
  .bar span { display:block; height:100%; width:0; background:var(--ok); transition:width .3s; }
  .count { font-size:0.88rem; font-weight:800; margin:0.3rem 0 0.35rem; }
  .filters { display:flex; gap:0.35rem; overflow-x:auto; }
  .filters button { flex:none; font:inherit; font-size:0.8rem; font-weight:700; color:var(--navy); background:#fff; border:1.5px solid var(--navy); border-radius:99px; padding:0.1rem 0.7rem; cursor:pointer; }
  .filters button[aria-pressed="true"] { background:var(--navy); color:#fff; }
  .card { background:#fff; border:1px solid var(--line); border-left:8px solid var(--line); border-radius:12px; padding:0.8rem 0.9rem; margin-bottom:0.9rem; scroll-margin-top:7rem; }
  .card[data-s="ok"], .card[data-s="feed"], .card[data-s="posted"] { border-left-color:var(--ok); }
  .card[data-s="fix"] { border-left-color:var(--fix); }
  .card[data-s="skip"] { border-left-color:#9ca3af; }
  .card[hidden] { display:none; }
  .card--story { padding:0.6rem 0.8rem; }
  .card--story h3 { font-size:0.98rem; }
  .head { display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center; }
  .num { font-weight:800; color:var(--soft); font-size:0.85rem; }
  .badge { font-size:0.75rem; font-weight:700; color:#fff; border-radius:99px; padding:0.05rem 0.55rem; background:var(--navy); }
  .badge--soft { background:#eef0f4; color:var(--soft); }
  .badge--new { background:var(--amber); color:#1a1d24; }
  .badge--draft { background:var(--fix); }
  .state { margin-left:auto; font-size:0.8rem; font-weight:800; }
  .card[data-s="ok"] .state, .card[data-s="feed"] .state, .card[data-s="posted"] .state { color:var(--ok); }
  .card[data-s="fix"] .state { color:var(--fix); }
  .card[data-s="skip"] .state { color:var(--soft); }
  h2 { font-size:1.05rem; margin:1rem 0 0.4rem; }
  h3 { font-size:1.03rem; margin:0.4rem 0 0.2rem; line-height:1.5; }
  .sum { font-size:0.88rem; color:var(--soft); margin:0 0 0.4rem; }
  .text { font-size:0.92rem; margin:0 0 0.3rem; }
  .links { font-size:0.85rem; margin:0.2rem 0 0; }
  .figs figure { margin:0 0 0.6rem; }
  .figs img, .prose img { display:block; width:100%; height:auto; border:1px solid var(--line); border-radius:8px; background:#fff; }
  .figs figure.is-new img { border:3px solid var(--amber); }
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
  .prose img[data-new] { border:3px solid var(--amber); }
  .prose blockquote { margin:0.6rem 0; padding:0.3rem 0.8rem; border-left:4px solid var(--line); color:var(--soft); }
  .open { font-size:0.85rem; }
  .actions { display:grid; gap:0.5rem; margin-top:0.6rem; }
  .act, .save-note { font:inherit; font-size:0.98rem; font-weight:800; border-radius:12px; padding:0.7rem 0.4rem; cursor:pointer; border:2px solid; background:#fff; }
  .card--story .act { padding:0.45rem; font-size:0.9rem; }
  .act--ok { color:var(--ok); border-color:var(--ok); }
  .act--fix { color:var(--fix); border-color:var(--fix); }
  .act--ok[aria-pressed="true"] { background:var(--ok); color:#fff; }
  .act--fix[aria-pressed="true"] { background:var(--fix); color:#fff; }
  .card[data-s="skip"] .act--fix[aria-pressed="true"] { background:#6b7280; border-color:#6b7280; }
  .note { margin-top:0.5rem; }
  .note textarea { width:100%; font:inherit; font-size:1rem; border:1.5px solid var(--navy); border-radius:10px; padding:0.5rem 0.6rem; }
  .save-note { width:100%; margin-top:0.4rem; color:#fff; background:var(--navy); border-color:var(--navy); }
  .empty { text-align:center; color:var(--soft); padding:2rem 0; font-weight:700; }
  /* 報告 */
  .panel { background:#fff; border:1px solid var(--line); border-radius:12px; padding:0.7rem 0.9rem; margin-bottom:0.9rem; }
  .panel h2 { margin:0 0 0.4rem; font-size:1rem; }
  .todo-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr)); gap:0.5rem; }
  .todo-box { font:inherit; text-align:left; border:1.5px solid var(--line); border-radius:10px; padding:0.45rem 0.6rem; background:#fafaf7; cursor:pointer; }
  .todo-box b { display:block; font-size:1.5rem; line-height:1.2; }
  .todo-box span { font-size:0.8rem; color:var(--soft); font-weight:700; }
  .todo-box[data-hot] { border-color:var(--fix); background:#fff5f6; }
  .todo-box[data-hot] b { color:var(--fix); }
  .todo-list { margin:0.2rem 0 0; padding-left:1.1rem; font-size:0.9rem; }
  .todo-list li { margin-bottom:0.35rem; }
  .fixnote { font-size:0.88rem; background:#fff5f6; border-left:3px solid var(--fix); padding:0.2rem 0.5rem; margin:0.15rem 0 0; white-space:pre-wrap; }
  .muted { color:var(--soft); font-size:0.85rem; }
  details.week, details.day { background:#fff; border:1px solid var(--line); border-radius:12px; padding:0.55rem 0.8rem; margin-bottom:0.6rem; }
  details.week > summary, details.day > summary { cursor:pointer; display:flex; flex-wrap:wrap; align-items:center; gap:0.4rem; }
  .wk-sub { font-size:0.8rem; color:var(--soft); margin-left:auto; }
  .nums { display:grid; grid-template-columns:repeat(5,1fr); gap:0.35rem; margin:0.5rem 0 0.3rem; }
  .numbox { background:#f4f5f8; border-radius:8px; text-align:center; padding:0.3rem 0.1rem; }
  .nv { display:block; font-size:1.25rem; font-weight:800; line-height:1.2; }
  .nv small { font-size:0.7rem; margin-left:1px; }
  .nl { font-size:0.68rem; color:var(--soft); font-weight:700; }
  .wk-h { font-size:0.82rem; font-weight:800; margin:0.4rem 0 0.1rem; }
  details.week ul { margin:0; padding-left:1.1rem; font-size:0.88rem; }
  .wk-note { font-size:0.82rem; color:#b45309; font-weight:700; margin:0.3rem 0 0; }
  .chips { display:flex; flex-wrap:wrap; gap:0.25rem; margin-left:auto; }
  .chip { font-size:0.7rem; font-weight:700; background:#eef0f4; color:var(--soft); border-radius:99px; padding:0 0.45rem; }
  ul.lines { list-style:none; margin:0.4rem 0 0; padding:0; font-size:0.88rem; }
  .ln { display:grid; grid-template-columns:2.8rem 1fr; gap:0.3rem; padding:0.25rem 0; border-top:1px dashed var(--line); }
  .ln .t { color:var(--soft); font-variant-numeric:tabular-nums; font-size:0.8rem; padding-top:0.1rem; }
  .ln--story span:last-child { color:#4d7c0f; font-weight:700; }
  .ln--alert span:last-child { color:var(--soft); }
  em.wait { font-style:normal; font-size:0.72rem; font-weight:800; background:var(--amber); color:#1a1d24; border-radius:99px; padding:0 0.4rem; }
  @media (max-width:420px) { .nums { grid-template-columns:repeat(3,1fr); } }
</style>
</head>
<body>
<header class="top">
  <h1>筆界ステーションチェック</h1>
  <p class="meta">${esc(made)} に作成</p>
  <nav class="sections" aria-label="ページの切りかえ">
    <button type="button" data-sec="report" aria-pressed="true">報告</button>
    <button type="button" data-sec="checks" aria-pressed="false">記事<span class="cnt" data-cnt="checks"></span></button>
    <button type="button" data-sec="news" aria-pressed="false">ニュース<span class="cnt" data-cnt="news"></span></button>
    <button type="button" data-sec="tsutatsu" aria-pressed="false">通達<span class="cnt" data-cnt="tsutatsu"></span></button>
    <button type="button" data-sec="xposts" aria-pressed="false">読み物<span class="cnt" data-cnt="xposts"></span></button>
  </nav>
</header>
<main>
  <p class="status" id="status">保存のしくみにつないでいます…</p>

  <section data-section="report">
    <div class="panel">
      <h2>今やること</h2>
      <div class="todo-grid">
        <button type="button" class="todo-box" data-go="checks" data-todo="checks"><b>–</b><span>まだ見ていない記事</span></button>
        <button type="button" class="todo-box" data-go="news" data-todo="news"><b>–</b><span>仕分け待ちのニュース</span></button>
        <button type="button" class="todo-box" data-go="tsutatsu" data-todo="tsutatsu"><b>–</b><span>まだ見ていない通達</span></button>
        <button type="button" class="todo-box" data-go="xposts" data-todo="xposts"><b>–</b><span>X に未投稿の公開済みの話</span></button>
      </div>
    </div>
    <div class="panel">
      <h2>Claude が直すもの（「直してほしい」）</h2>
      <div id="fix-list"><p class="muted">読み込み中…</p></div>
    </div>
    <div class="panel">
      <h2>公開を待っている作業</h2>
      <p class="muted">main にまだ入っていない作業です。確かめて「公開して」と伝えると、サイトに出ます。</p>
      ${waitingHtml}
    </div>
    <div class="panel">
      <h2>これから1週間の読み物</h2>
      ${upcomingHtml}
    </div>
    <h2>週報</h2>
    ${shallow ? '<p class="status" data-bad>記録の一部しか読めなかったので、古い日の報告が欠けています。</p>' : ''}
    ${weekHtml || '<p class="muted">記録がありません。</p>'}
    <h2>日報</h2>
    <p class="lead">その日に入れた作業（コミット）・公開した読み物・Googleアラートの下書きです。「公開待ち」は、まだ main に入っていない作業です。</p>
    ${dayHtml || '<p class="muted">記録がありません。</p>'}
  </section>

  <section data-section="checks" hidden>
    <p class="lead">記事の本文と図解を確かめて、「OK」か「直してほしい」を押します。OK のあとで中身が変わった記事は、自動で「まだ」にもどります。</p>
    <div class="progress" data-progress="checks"><div class="bar"><span></span></div><p class="count"></p>
      <div class="filters"><button type="button" data-f="todo" aria-pressed="true">まだ</button><button type="button" data-f="draft">下書き</button><button type="button" data-f="changed">今回変わった</button><button type="button" data-f="fix">直してほしい</button><button type="button" data-f="ok">OK</button><button type="button" data-f="all">すべて</button></div></div>
    ${articleCards}
  </section>

  <section data-section="news" hidden>
    <p class="lead">毎朝の Googleアラートから作った下書きのうち、まだ発車標（ニュース）に出していないものです。「発車標に出す」か「出さない」を選ぶと、Claude が仕分けます（出すものは、ひとことをメモに書けます）。</p>
    <div class="progress" data-progress="news"><div class="bar"><span></span></div><p class="count"></p>
      <div class="filters"><button type="button" data-f="todo" aria-pressed="true">まだ</button><button type="button" data-f="feed">出す</button><button type="button" data-f="skip">出さない</button><button type="button" data-f="all">すべて</button></div></div>
    ${newsCards || '<p class="empty">仕分け待ちのニュースはありません。</p>'}
  </section>

  <section data-section="tsutatsu" hidden>
    <p class="lead">通達ナビに載っている通達です。名称・番号・説明を確かめて、「OK」か「直してほしい」を押します。（まだ載せていない通達の候補は、パソコンの通達チェックにあります）</p>
    <div class="progress" data-progress="tsutatsu"><div class="bar"><span></span></div><p class="count"></p>
      <div class="filters"><button type="button" data-f="todo" aria-pressed="true">まだ</button><button type="button" data-f="fix">直してほしい</button><button type="button" data-f="ok">OK</button><button type="button" data-f="all">すべて</button></div></div>
    ${tsutatsuCards}
  </section>

  <section data-section="xposts" hidden>
    <p class="lead">車内の読み物の話ごとに、X に投稿（予約）したかの印をつけます。投稿文と画像はパソコンの brand/x/stories/ にあります。もう一度押すと印が外れます。</p>
    <div class="progress" data-progress="xposts"><div class="bar"><span></span></div><p class="count"></p>
      <div class="filters"><button type="button" data-f="todo" aria-pressed="true">まだ</button><button type="button" data-f="posted">投稿した</button><button type="button" data-f="all">すべて</button></div></div>
    ${storyCards}
  </section>
  <p class="empty" id="empty" hidden>このしぼりこみに当てはまるものはありません。</p>
</main>
<script>
(() => {
  const TODAY = ${JSON.stringify(today)};
  const LABEL = { ok: '✓ OK', fix: '直してほしい', feed: '✓ 発車標に出す', skip: '出さない', posted: '✓ 投稿した' };
  const SEC_NAME = { checks: '記事', news: 'ニュース', tsutatsu: '通達', xposts: '読み物' };
  const cards = [...document.querySelectorAll('.card')];
  const key = (c) => c.dataset.col + '/' + c.dataset.id;
  const byKey = Object.fromEntries(cards.map((c) => [key(c), c]));
  const statusEl = document.getElementById('status');
  let sec = 'report';
  const filter = { checks: 'todo', news: 'todo', tsutatsu: 'todo', xposts: 'todo' };
  const keep = new Set(); // 押したばかりのものは、しぼりこみが変わるまで画面に残す
  let db = null, me = null;
  const state = {}; // key -> {status, note, rev}

  const cur = (c) => {
    const s = state[key(c)];
    if (!s) return { status: '', note: '' };
    if (c.dataset.col !== 'xposts' && s.rev !== c.dataset.rev) return { status: '', note: '', stale: !!s.status };
    return s;
  };
  // 読み物は、公開済みの話だけを「まだ」に数える（予定の話は前もって予約してもよい）
  const isLiveStory = (c) => c.querySelector('.badge--soft') !== null;
  const counts = (col) => {
    let todo = 0, done = 0, fix = 0, total = 0;
    for (const c of cards) {
      if (c.dataset.col !== col) continue;
      const s = cur(c).status;
      if (col === 'xposts' && !isLiveStory(c) && !s) continue;
      total++;
      if (!s) todo++; else done++;
      if (s === 'fix') fix++;
    }
    return { todo, done, fix, total };
  };

  const paint = () => {
    let shown = 0;
    for (const c of cards) {
      const s = cur(c);
      c.dataset.s = s.status || '';
      c.querySelector('[data-state]').textContent = LABEL[s.status] || (s.stale ? '変わったので もう一度' : '');
      c.querySelectorAll('.act').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.act === s.status)));
      const col = c.dataset.col;
      const f = filter[col];
      const show = sec === col && (keep.has(key(c)) || f === 'all' || (f === 'todo' && !s.status) || (f === 'changed' && c.dataset.changed === '1') || (f === 'draft' && c.dataset.draft === '1') || f === s.status);
      c.hidden = !show;
      if (show) shown++;
    }
    for (const col of Object.keys(filter)) {
      const n = counts(col);
      const box = document.querySelector('[data-progress="' + col + '"]');
      if (box) {
        box.querySelector('.bar span').style.width = (n.total ? (n.done / n.total) * 100 : 0) + '%';
        const parts = { checks: ['OK', 'ok', '直してほしい', 'fix'], news: ['出す', 'feed', '出さない', 'skip'], tsutatsu: ['OK', 'ok', '直してほしい', 'fix'], xposts: ['投稿した', 'posted'] }[col];
        const by = (v) => cards.filter((c) => c.dataset.col === col && cur(c).status === v).length;
        let txt = parts[0] + ' ' + by(parts[1]);
        if (parts[2]) txt += '・' + parts[2] + ' ' + by(parts[3]);
        box.querySelector('.count').textContent = txt + '・まだ ' + n.todo;
      }
      const cnt = document.querySelector('[data-cnt="' + col + '"]');
      if (cnt) cnt.textContent = n.todo || '';
      const tb = document.querySelector('[data-todo="' + col + '"]');
      if (tb) { tb.querySelector('b').textContent = n.todo; if (n.todo) tb.dataset.hot = '1'; else delete tb.dataset.hot; }
    }
    // 直してほしいの一覧
    const fixes = cards.filter((c) => cur(c).status === 'fix' || (c.dataset.col === 'news' && cur(c).status === 'feed' && cur(c).note));
    const fl = document.getElementById('fix-list');
    fl.innerHTML = fixes.length
      ? '<ul class="todo-list">' + fixes.map((c) => '<li><a href="#" data-jump="' + key(c).replace(/"/g, '&quot;') + '">［' + SEC_NAME[c.dataset.col] + '］' + escH(c.dataset.title) + '</a>' + (cur(c).note ? '<p class="fixnote">' + escH(cur(c).note) + '</p>' : '<p class="muted">メモなし</p>') + '</li>').join('') + '</ul>'
      : '<p class="muted">ありません。</p>';
    document.getElementById('empty').hidden = sec === 'report' || shown > 0;
  };
  const escH = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

  const goSec = (s) => {
    sec = s;
    keep.clear();
    document.querySelectorAll('nav.sections button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sec === s)));
    document.querySelectorAll('section[data-section]').forEach((el) => (el.hidden = el.dataset.section !== s));
    paint();
    window.scrollTo({ top: 0 });
  };
  document.querySelectorAll('nav.sections button').forEach((b) => b.addEventListener('click', () => goSec(b.dataset.sec)));
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => goSec(b.dataset.go)));
  document.getElementById('fix-list').addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    const c = byKey[a.dataset.jump];
    goSec(c.dataset.col);
    keep.add(key(c));
    paint();
    c.scrollIntoView({ block: 'start' });
  });
  document.querySelectorAll('.filters').forEach((box) => {
    const col = box.closest('[data-progress]').dataset.progress;
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      filter[col] = b.dataset.f;
      keep.clear();
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      paint();
    }));
  });

  const next = (c) => {
    const i = cards.indexOf(c);
    const n = cards.slice(i + 1).find((x) => !x.hidden && !cur(x).status);
    if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const queue = {}; // 同じものの書きこみは1つずつ
  const save = (c, data) => {
    const k = key(c);
    keep.add(k);
    state[k] = { ...data, rev: c.dataset.rev };
    paint();
    if (!db) { statusEl.textContent = '保存のしくみにつながっていないので、この画面を閉じると消えます。'; statusEl.dataset.bad = '1'; return; }
    const doc = { status: data.status, note: data.note || '', rev: c.dataset.rev, title: c.dataset.title, updated: new Date().toISOString(), by: me || '' };
    queue[k] = (queue[k] || Promise.resolve()).then(() => db.doc(k).set(doc)).then(() => {
      statusEl.textContent = '保存しました（' + new Date().toLocaleTimeString('ja-JP') + '）。Claude はこの結果を直接読みます。';
      delete statusEl.dataset.bad;
    }).catch(() => { statusEl.textContent = '保存できませんでした。通信を確かめて、もう一度押してください。'; statusEl.dataset.bad = '1'; });
  };

  for (const c of cards) {
    const note = c.querySelector('.note');
    const ta = note.querySelector('textarea');
    const noteActs = c.dataset.noteacts.split(',').filter(Boolean);
    if (c.dataset.col === 'news') ta.placeholder = '出すとき：ひとこと・路線の希望など（なくてもかまいません）';
    let noteFor = '';
    c.querySelectorAll('.act').forEach((b) => b.addEventListener('click', () => {
      const v = b.dataset.act;
      if (cur(c).status === v) { note.hidden = true; save(c, { status: '', note: '' }); return; } // もう一度押すと取り消し
      if (noteActs.includes(v)) {
        noteFor = v;
        note.hidden = false;
        ta.value = cur(c).status === v ? cur(c).note || '' : '';
        ta.focus();
        save(c, { status: v, note: ta.value.trim() });
      } else {
        note.hidden = true;
        save(c, { status: v, note: '' });
        next(c);
      }
    }));
    c.querySelector('.save-note').addEventListener('click', () => { save(c, { status: noteFor || cur(c).status, note: ta.value.trim() }); note.hidden = true; next(c); });
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
    for (const col of ['checks', 'news', 'tsutatsu', 'xposts']) {
      db.collection(col).onSnapshot((snap) => {
        clearTimeout(timer);
        (snap.docs || snap).forEach((d) => { const v = d.data ? d.data() : d; const k = col + '/' + d.id; if (byKey[k]) state[k] = { status: v.status, note: v.note, rev: v.rev }; });
        statusEl.textContent = 'つながりました。押すと自動で保存され、ほかの端末にもすぐ反映されます。';
        delete statusEl.dataset.bad;
        paint();
      }, () => { statusEl.textContent = '保存した結果を読めませんでした。開き直してください。'; statusEl.dataset.bad = '1'; });
    }
  })();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(out, page);
console.log(`${out} を作りました（記事 ${articles.length}本・ニュース ${news.length}件・通達 ${tsutatsu.length}件・読み物 ${stories.length}話・日報 ${dayKeys.length}日分・${Math.round(page.length / 1024)}KB）`);
