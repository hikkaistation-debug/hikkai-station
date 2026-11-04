// サイト内検索用のデータ（用語さくいん＋記事のタイトル・要約・タグなどの一覧）
import { getLine } from '../data/lines';
import { getPublishedArticles, formatDate } from '../data/articles';
import { GLOSSARY } from '../data/glossary';

export async function GET() {
  // 言葉の意味を先に出す
  const terms = GLOSSARY.map((t) => ({
    url: `/annai/#g-${t.id}`,
    title: `${t.term}（${t.yomi}）`,
    summary: t.desc,
    comment: '',
    tags: [t.yomi],
    category: '用語さくいん',
    date: '',
  }));
  const articles = (await getPublishedArticles()).map((a) => ({
    url: `/articles/${a.id}/`,
    title: a.data.title,
    summary: a.data.summary,
    comment: a.data.comment,
    tags: a.data.tags,
    category: getLine(a.data.category).name,
    date: formatDate(a.data.pubDate),
  }));
  return new Response(JSON.stringify([...terms, ...articles]), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
