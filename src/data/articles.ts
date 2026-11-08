import { existsSync } from 'node:fs';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getLine } from './lines';

export type Article = CollectionEntry<'articles'>;

// 公開する記事を新しい順に取り出す（draft: true は除く）
// ただし手元の確認用画面（npm run dev）では、自分で書いた下書きも表示する（Googleアラートの inbox と、発車標だけに出すもの〈feed: true の下書き〉は除く）。
// 本番のサイト（ビルド）には、下書きは出ない。
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection(
    'articles',
    ({ id, data }) => !data.draft || (import.meta.env.DEV && !id.startsWith('inbox/') && !data.feed),
  );
  return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export const isKiso = (a: Article) => getLine(a.data.category).isKiso;

// 基礎知識のページで「まずはここから」として最初に出す記事（ファイル名から .md を除いた名前。書いた順に並ぶ）
export const KISO_FIRST = ['hikkai-to-shoyukenkai', 'chousashi-towa'];

export function formatDate(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// 路線図に出す短い駅名（station があればそれ、なければタイトルを短くする）
export function stationName(a: Article, max = 16) {
  if (a.data.station) return a.data.station;
  const t = [...a.data.title];
  return t.length > max ? t.slice(0, max).join('') + '…' : a.data.title;
}

export const articleHref = (a: Article) => `/articles/${a.id}/`;

// ─────────────────────────────────────────────
// 路線のつながり
//   本線：その路線の記事のうち、支線ではないもの（新しい順＝ターミナルに近い順）
//   支線：branchFrom で分かれ元を指定した記事（branchOrder の順、なければ公開日の古い順）
// ─────────────────────────────────────────────
export type Tracks = {
  main: (lineId: string) => Article[];
  branchOf: (parentId: string) => Article[];
  parentOf: (a: Article) => Article | undefined;
};

export function buildTracks(all: Article[]): Tracks {
  const byId = new Map(all.map((a) => [a.id, a]));
  const branches = new Map<string, Article[]>();
  // 分かれ元がまだ下書き（本番に出ない）なら、その支線の記事は本線にもどして表示する
  const fromOf = (a: Article) => {
    const from = a.data.branchFrom;
    if (!from || byId.has(from)) return from;
    if (existsSync(`src/content/articles/${from}.md`)) return undefined;
    return from;
  };
  for (const a of all) {
    const from = fromOf(a);
    if (!from) continue;
    if (!byId.has(from)) {
      throw new Error(`記事「${a.id}」の branchFrom「${from}」という記事が見つかりません（ファイル名から .md を除いた名前を書いてください）`);
    }
    if (from === a.id) throw new Error(`記事「${a.id}」の branchFrom に自分自身が指定されています`);
    branches.set(from, [...(branches.get(from) ?? []), a]);
  }
  for (const list of branches.values()) {
    list.sort(
      (x, y) =>
        (x.data.branchOrder ?? Infinity) - (y.data.branchOrder ?? Infinity) ||
        x.data.pubDate.getTime() - y.data.pubDate.getTime(),
    );
  }
  return {
    main: (lineId) => all.filter((a) => a.data.category === lineId && !fromOf(a)),
    branchOf: (parentId) => branches.get(parentId) ?? [],
    parentOf: (a) => {
      const from = fromOf(a);
      return from ? byId.get(from) : undefined;
    },
  };
}
