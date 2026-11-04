import { getCollection, type CollectionEntry } from 'astro:content';
import { getLine } from './lines';

export type Article = CollectionEntry<'articles'>;

// 公開する記事を新しい順に取り出す（draft: true は除く）
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export const isKiso = (a: Article) => getLine(a.data.category).isKiso;

export function formatDate(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
