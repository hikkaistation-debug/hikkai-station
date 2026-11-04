# 筆界ステーション（作業メモ）

## パソコンで見る方法

1. このフォルダでターミナル（文字でパソコンに命令する画面）を開きます。
2. 次のように入力して Enter を押します。

   ```
   npm run dev
   ```

3. ブラウザで http://localhost:4321 を開きます（自分のパソコンの中だけで見られるアドレスです）。
4. 終わるときは、ターミナルで `Ctrl + C` を押します。

## 記事を増やす方法

1. `src/content/articles/` に、半角英数字のファイル名で `.md` ファイルを作ります（例：`2026-11-hoge.md`）。
   ファイル名がそのまま記事のアドレスになります。
2. いちばん上に、次の項目を書きます（`---` で囲みます）。

   ```
   ---
   title: 記事のタイトル
   pubDate: 2026-11-04
   category: souzoku        # seido / souzoku / kyokai / gijutsu / kiso のどれか
   level: easy              # easy（やさしい）/ normal（ふつう）/ expert（専門）
   sourceName: 出典の名前
   sourceUrl: https://...
   summary: 要約（自分の言葉で）
   comment: ひとことコメント
   tags:
     - タグ1
   ---
   ```

3. その下に、本文を書きたければ書きます（なくてもOK）。
4. 下書きの間は `draft: true` を足すと、サイトに出ません。

## カテゴリ（路線）を増やす方法

`src/data/lines.ts` の一覧に1行足します。

## 気をつけること

- 運営者の本名・事務所名・住所・職業など、個人が特定される情報は書かない。
- 依頼者や現場が特定される情報は書かない。
- 他サイトの文章や画像を転載しない。要約には必ず出典リンクを付ける。
- サンプル記事（`sample: true`）は、公開前に内容を確認して `sample: true` の行を消すか、記事ごと削除する。

## おもなファイル

| 場所 | 中身 |
|---|---|
| `src/content/articles/` | 記事（Markdown） |
| `src/data/site.ts` | サイト名・メニュー |
| `src/data/lines.ts` | カテゴリ（路線）の色と記号、対象バッジ |
| `src/pages/` | 各ページ |
| `src/styles/global.css` | デザイン |
| `astro.config.mjs` | 設定（公開アドレス：https://hikkai-station.com） |

## Googleアラートから下書きを作る仕組み

- 毎朝7時（日本時間）に、GitHubが Googleアラートを読み込みます。
- 新しい話題ごとに、`src/content/articles/inbox/` に下書き（`draft: true`）ができます。サイトには出ません。
- 使う話題は、元記事を確認して要約・ひとこと・カテゴリ・対象を書き、`draft: false` にして公開します。
- 使わない話題は、ファイルを削除します（同じリンクは二度と下書きになりません）。
- フィードのアドレスは、GitHubの Settings → Secrets and variables → Actions に `ALERT_FEEDS` という名前で入れます（1行に1つ）。公開されるファイルには書かないでください。
- GitHubで作られた下書きを手元に持ってくるときは `git pull` をします。
