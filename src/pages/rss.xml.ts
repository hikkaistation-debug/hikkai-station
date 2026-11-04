// RSSフィード（新着記事をRSSリーダーで受け取れるようにする）
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';
import { getPublishedArticles } from '../data/articles';

export async function GET(context: APIContext) {
  const articles = await getPublishedArticles();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.pubDate,
      description: a.data.summary,
      link: `/articles/${a.id}/`,
      categories: [a.data.category, ...a.data.tags],
    })),
    customData: '<language>ja</language>',
  });
}
