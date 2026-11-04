// Googleアラート（RSSフィード）を読み込んで、新しい話題ごとに「下書き記事」を作るスクリプト
//
// ・フィードのアドレスは、環境変数 ALERT_FEEDS に入れます（1行に1つ）。
//   GitHubでは「Secrets（秘密の設定）」に入れるので、公開されるファイルには残りません。
// ・作った下書きは src/content/articles/inbox/ に入ります。
//   draft: true なので、サイトには表示されません。
// ・一度下書きにしたリンクは src/data/alerts-seen.json に記録し、二度は作りません。
//
// 手元で試すとき： ALERT_FEEDS="https://..." npm run alerts
// ファイルで試すとき： node scripts/fetch-alerts.mjs --file テスト用.xml

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = path.join(ROOT, 'src', 'content', 'articles', 'inbox');
const SEEN_FILE = path.join(ROOT, 'src', 'data', 'alerts-seen.json');
const MAX_PER_RUN = 30; // 1回に作る下書きの上限（作りすぎ防止）
const SEEN_LIMIT = 2000; // 記録しておくリンクの上限

// --- 文字の整形 ---
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
const stripTags = (s) => s.replace(/<[^>]*>/g, '');
// XMLの中にHTMLが入っている形なので、2段階で元の文字に戻す
const clean = (s) => decodeEntities(stripTags(decodeEntities(s ?? ''))).replace(/\s+/g, ' ').trim();

// Googleアラートのリンクは google.com を経由する形なので、元記事のアドレスを取り出す
function realUrl(link) {
  try {
    const u = new URL(decodeEntities(link));
    if (u.hostname.endsWith('google.com') && u.pathname === '/url') {
      return u.searchParams.get('url') || u.searchParams.get('q') || u.href;
    }
    return u.href;
  } catch {
    return null;
  }
}

// Atom / RSS のどちらにも対応した、かんたんな読み取り
function parseFeed(xml) {
  const items = [];
  const blocks = xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) ?? xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  for (const b of blocks) {
    const pick = (tag) => b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? '';
    const href = b.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? clean(pick('link'));
    const url = realUrl(href);
    if (!url) continue;
    items.push({
      title: clean(pick('title').replace(/^<!\[CDATA\[|\]\]>$/g, '')),
      url,
      published: clean(pick('published') || pick('updated') || pick('pubDate')),
    });
  }
  return items;
}

const yamlStr = (s) => JSON.stringify(s); // JSONの文字列はYAMLとしても正しい
const hostOf = (u) => new URL(u).hostname.replace(/^www\./, '');
const today = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // 日本時間の日付

function draftMarkdown(item) {
  const date = today();
  return `---
# ▼ Googleアラートから自動で作った下書きです（サイトには出ません）
# 使うときは、要約・ひとこと・カテゴリ・対象を書き、元記事を確認してから draft: false にします。
# 使わないときは、このファイルを削除してください。
title: ${yamlStr(item.title || '（タイトルを書く）')}
pubDate: ${date}
category: seido   # seido / souzoku / kyokai / gijutsu / kiso / shiken
level: normal     # easy / normal / expert
sourceName: ${yamlStr(hostOf(item.url))}
sourceUrl: ${yamlStr(item.url)}
summary: "（要約を自分の言葉で書く）"
comment: "（ひとことを書く）"
tags: []
draft: true
---

<!-- 取得日：${date}／アラート上の日時：${item.published || '不明'} -->
`;
}

async function loadSeen() {
  if (!existsSync(SEEN_FILE)) return [];
  return JSON.parse(await readFile(SEEN_FILE, 'utf8'));
}

async function main() {
  const fileArg = process.argv.indexOf('--file');
  const sources = [];
  if (fileArg !== -1) {
    sources.push({ name: process.argv[fileArg + 1], xml: await readFile(process.argv[fileArg + 1], 'utf8') });
  } else {
    const feeds = (process.env.ALERT_FEEDS ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (feeds.length === 0) {
      console.log('ALERT_FEEDS が設定されていないので、何もしません。');
      return;
    }
    for (const [i, f] of feeds.entries()) {
      try {
        const res = await fetch(f, { headers: { 'User-Agent': 'hikkai-station-alerts' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        sources.push({ name: `フィード${i + 1}`, xml: await res.text() });
      } catch (e) {
        // フィードのアドレスはログに出さない（秘密の設定のため）
        console.warn(`フィード${i + 1} を読み込めませんでした：${e.message}`);
      }
    }
  }

  const seen = await loadSeen();
  const seenSet = new Set(seen);
  await mkdir(INBOX, { recursive: true });

  let created = 0;
  for (const src of sources) {
    for (const item of parseFeed(src.xml)) {
      if (created >= MAX_PER_RUN) break;
      if (seenSet.has(item.url)) continue;
      seenSet.add(item.url);
      seen.push(item.url);
      const id = createHash('sha1').update(item.url).digest('hex').slice(0, 8);
      const file = path.join(INBOX, `${today()}-${id}.md`);
      if (existsSync(file)) continue;
      await writeFile(file, draftMarkdown(item), 'utf8');
      created++;
      console.log(`下書きを作成：${item.title}`);
    }
  }

  await writeFile(SEEN_FILE, JSON.stringify(seen.slice(-SEEN_LIMIT), null, 2) + '\n', 'utf8');
  console.log(`新しい下書き：${created}件`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
