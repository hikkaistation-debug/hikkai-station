// 発車標（ニュース）… Googleアラートなどで集めた新着ニュースを、見出し・出典・日付・リンクだけで並べる
//
// ・記事（src/content/articles/ のMarkdown）に feed: true と書くと、発車標に出ます。
//   Googleアラートの下書き（inbox）は draft: true のままでかまいません（記事のページは作られず、元の記事へのリンクだけが出ます）。
// ・要約やひとことは出しません（他サイトの文章をなぞらないため）。
// ・古いニュースも消しません。トップや各のりばの発車標には新しい順に数件だけ、/news/ には月ごとにすべて並べます（バックナンバー）。
//   元の記事が消えてリンクが切れたものは、見つけしだいファイルを削除するか feed: false にします。
// ・路線の色の印は category で決まります。下書きの category を合わせてから feed: true にしてください。
import { getCollection, type CollectionEntry } from 'astro:content';
import { getLine } from './lines';

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  date: Date;
  line: ReturnType<typeof getLine>;
  level: CollectionEntry<'articles'>['data']['level'];
};

// よく出るサイトの表示名（なければアドレスの名前をそのまま出す）
const SOURCE_NAMES: Record<string, string> = {
  'prtimes.jp': 'PR TIMES',
  'news.yahoo.co.jp': 'Yahoo!ニュース',
  'excite.co.jp': 'エキサイトニュース',
  'nikkei.com': '日本経済新聞',
  'asahi.com': '朝日新聞',
  'mainichi.jp': '毎日新聞',
  'yomiuri.co.jp': '読売新聞',
  'sankei.com': '産経新聞',
  'nhk.or.jp': 'NHK',
  'www3.nhk.or.jp': 'NHK',
  'moj.go.jp': '法務省',
  'mlit.go.jp': '国土交通省',
  'rakumachi.jp': '楽待',
  'mbp-japan.com': 'マイベストプロ',
};

const looksLikeHost = (s: string) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s);

// タイトルの最後の「 - PR TIMES」「｜有冨秀政」のような媒体名を、見出しと出典に分ける
function splitTitle(title: string): { title: string; suffix?: string } {
  const m = title.match(/^(.*\S)\s*(?:\s[-–—]\s|[｜|])\s*([^-–—｜|]{1,30})$/);
  if (!m || [...m[1]].length < 8) return { title };
  return { title: m[1].replace(/\s*…$/, '…'), suffix: m[2].trim() };
}

function toItem(a: CollectionEntry<'articles'>): NewsItem {
  const { title, suffix } = splitTitle(a.data.title);
  const host = new URL(a.data.sourceUrl).hostname.replace(/^www\./, '');
  // sourceName を自分で書きかえていれば、それを使う（アドレスのままなら、タイトルの媒体名か表示名の一覧から）
  const source = looksLikeHost(a.data.sourceName) ? (SOURCE_NAMES[host] ?? suffix ?? host) : a.data.sourceName;
  return {
    id: a.id,
    title,
    source,
    url: a.data.sourceUrl,
    date: a.data.pubDate,
    line: getLine(a.data.category),
    level: a.data.level,
  };
}

// 発車標に出すニュースを新しい順に取り出す
//   lines：この路線のニュースだけ（省略ならすべて）
//   level：この対象（やさしい・ふつう・専門）を除く
//   limit：いちばん多くて何件
export async function getNews(opts: { lines?: string[]; excludeLevel?: string; limit?: number } = {}): Promise<NewsItem[]> {
  const list = await getCollection('articles', ({ data }) => data.feed);
  return list
    .filter((a) => !opts.lines || opts.lines.includes(a.data.category))
    .filter((a) => !opts.excludeLevel || a.data.level !== opts.excludeLevel)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime() || a.id.localeCompare(b.id))
    .slice(0, opts.limit ?? Infinity)
    .map(toItem);
}

// 月ごとに分ける（新しい月から）… /news/ のバックナンバー用
export function groupByMonth(items: NewsItem[]): { key: string; label: string; items: NewsItem[] }[] {
  const groups = new Map<string, NewsItem[]>();
  for (const n of items) {
    const key = `${n.date.getFullYear()}-${String(n.date.getMonth() + 1).padStart(2, '0')}`;
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  return [...groups].map(([key, list]) => ({ key, label: `${Number(key.slice(0, 4))}年${Number(key.slice(5))}月`, items: list }));
}
