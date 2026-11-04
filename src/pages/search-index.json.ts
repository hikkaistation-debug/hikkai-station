// サイト内検索用のデータ
// ・用語さくいん（言葉・よみ・説明）
// ・記事（タイトル・要約・ひとこと・タグ・カテゴリ・本文）
import { getLine } from '../data/lines';
import { getPublishedArticles, formatDate, isoDate } from '../data/articles';
import { GLOSSARY } from '../data/glossary';

// Markdown の本文から、記号やHTMLを取りのぞいて文字だけにする
function plainText(md: string | undefined) {
  return (md ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET() {
  const terms = GLOSSARY.map((t) => ({
    type: 'term',
    url: `/annai/#g-${t.id}`,
    title: `${t.term}（${t.yomi}）`,
    summary: t.desc,
    text: `${t.term} ${t.yomi} ${t.desc}`,
    category: '用語さくいん',
    level: '',
    date: '',
    dateISO: '',
  }));
  const articles = (await getPublishedArticles()).map((a) => ({
    type: 'article',
    url: `/articles/${a.id}/`,
    title: a.data.title,
    summary: a.data.summary,
    text: [a.data.title, a.data.summary, a.data.comment, a.data.sourceName, ...a.data.tags, getLine(a.data.category).name, plainText(a.body)].join(' '),
    category: getLine(a.data.category).name,
    level: a.data.level,
    line: a.data.category,
    tags: a.data.tags,
    color: getLine(a.data.category).color,
    date: formatDate(a.data.pubDate),
    dateISO: isoDate(a.data.pubDate),
  }));
  // 関連ワード：用語とそのよみ（「ぶんぴつ」で「分筆」を含む記事も見つかるようにする）
  const synonyms = GLOSSARY.map((t) => ({ words: [t.term.replace(/（.*?）/g, ''), t.yomi] }));
  return new Response(JSON.stringify({ terms, articles, synonyms }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
