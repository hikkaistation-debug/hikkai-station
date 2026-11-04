// 記事（Markdown）に書く項目のルール
// 書き忘れや書き間違いがあると、画面にエラーで教えてくれます。
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LINE_IDS } from './data/lines';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(), // タイトル
    pubDate: z.coerce.date(), // 公開日
    updatedDate: z.coerce.date().optional(), // 更新日（任意）
    category: z.enum(LINE_IDS), // カテゴリ（1つ）
    level: z.enum(['easy', 'normal', 'expert']), // 対象バッジ
    sourceName: z.string(), // 出典名
    sourceUrl: z.string().url(), // 出典URL
    summary: z.string(), // 要約（自分の言葉で）
    comment: z.string(), // 一言コメント
    tags: z.array(z.string()).default([]), // タグ（任意）
    sample: z.boolean().default(false), // サンプル記事なら true
    draft: z.boolean().default(false), // true の間はサイトに出ません
  }),
});

export const collections = { articles };
