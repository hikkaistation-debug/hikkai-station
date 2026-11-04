// サイト内検索用のデータ（記事のタイトル・要約・タグなどの一覧）
import { getLine } from '../data/lines';
import { getPublishedArticles, formatDate } from '../data/articles';

export async function GET() {
  const articles = await getPublishedArticles();
  const items = articles.map((a) => ({
    url: `/articles/${a.id}/`,
    title: a.data.title,
    summary: a.data.summary,
    comment: a.data.comment,
    tags: a.data.tags,
    category: getLine(a.data.category).name,
    date: formatDate(a.data.pubDate),
  }));
  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
