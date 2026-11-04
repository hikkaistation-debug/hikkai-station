// 記事（Markdown）に書く項目のルール
// 書き忘れや書き間違いがあると、画面にエラーで教えてくれます。
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LINE_IDS } from './data/lines';
import { TAG_NAMES } from './data/tags';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z
    .object({
      title: z.string(), // タイトル
      pubDate: z.coerce.date(), // 公開日
      updatedDate: z.coerce.date().optional(), // 更新日（任意）
      category: z.enum(LINE_IDS), // カテゴリ（1つ）
      level: z.enum(['easy', 'normal', 'expert']), // 対象バッジ
      sourceName: z.string(), // 出典名
      sourceUrl: z.string().url(), // 出典URL
      summary: z.string(), // 要約（自分の言葉で。1〜2文・100字くらい）
      comment: z.string(), // 一言コメント
      tags: z.array(z.enum(TAG_NAMES)).default([]), // タグ（任意。src/data/tags.ts の一覧から選ぶ）
      relatedLines: z.array(z.enum(LINE_IDS)).default([]), // 関連する駅（路線）（任意）
      station: z.string().optional(), // 路線図に出す短い駅名（任意。なければタイトルを短くして使う）
      // ▼ 支線：ある記事から枝分かれしたシリーズ記事にするとき（任意）
      branchFrom: z.string().optional(), // 分かれ元の記事のファイル名（.md を除く）
      branchOrder: z.number().optional(), // 支線の中での順番（1, 2, 3…。なければ公開日の古い順）
      // ▼ 測量ツール（category: kiki）の記事だけ書く項目
      product: z
        .object({
          name: z.string(), // 機器・ソフトの名前
          kind: z.enum(['機器', 'ソフト', 'アプリ']), // 種類
          use: z.string(), // 用途
          officialUrl: z.string().url(), // 公式サイトのURL
          makerDocUrl: z.string().url().optional(), // メーカー資料のURL（任意）
          checkedDate: z.coerce.date(), // 最終確認日
        })
        .optional(),
      sample: z.boolean().default(false), // サンプル記事なら true
      draft: z.boolean().default(false), // true の間はサイトに出ません
    })
    .superRefine((d, ctx) => {
      if (d.category === 'kiki' && !d.product) {
        ctx.addIssue({ code: 'custom', path: ['product'], message: '測量ツールの記事には product（名前・種類・用途・公式サイト・最終確認日）が必要です' });
      }
    }),
});

// ─────────────────────────────────────────────
// 車内の読み物（小説）… src/content/stories/<列車>/<番号>.md
// ─────────────────────────────────────────────
const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(), // 話のタイトル（「第1話」は自動で付きます）
    train: z.enum(['kakueki', 'tokkyu']), // 列車（src/data/trains.ts）
    no: z.number(), // 第何話か
    pubDate: z.coerce.date(), // 公開日（この日の0時すぎの自動公開から出ます）
    summary: z.string(), // ひとことあらすじ（一覧に出ます）
    point: z.string(), // 今日のひとこと（この話で学べること）
    learn: z.array(reference('articles')).default([]), // もっと知りたい方へ：関連する記事のファイル名（.md を除く）
    draft: z.boolean().default(false), // true の間はサイトに出ません
  }),
});

export const collections = { articles, stories };
