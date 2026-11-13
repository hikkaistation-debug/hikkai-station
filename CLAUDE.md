# hikkai-station で作業するときの決まり

## 公開は運営者が確認してから（運営者の指示・2026-11-09）

- main への push はサイトの公開になる。**運営者が内容を確認して「公開して」と言うまで、main に入れない**。記事・発車標・ツールなど、どの変更も同じ。
- それまでの作業は、作業ブランチ（claude/…）までにする。

## 記事には図解をつける（運営者の指示・2026-11-09）

- 記事を新しく書くとき・きちんとした記事にするとき（`draft: false`）は、**図解を少なくとも1枚つける**。
  手続きは流れの図、時期で変わる話は年表、2つのものは並べて比べる図、しくみは絵にする。
- 図に書くのは、その記事の本文に書いてあることだけ。本文にない数字・条件・手続きを図で足さない。
- 図は SVG で `public/images/kiso/` に置き、ほかの記事と同じ形（`<figure class="figure">`・中身がわかる `alt`・`figcaption` の最後に「（図を押すと大きく表示します）」）で入れる。
  横幅は640、白い背景、のりば（`src/data/lines.ts`）の色を使う。色だけに頼らず文字でも書く。
- 入れたら、画像にして文字の重なりや切れがないか目で確かめ、運営者に一覧を見せる。
- 発車標（`feed: true` で見出しとリンクだけ出す下書き）には、図はいらない。

## 筆界ステーションチェック（運営者の確認ページ）

- 運営者は、Claude アプリの非公開ページ「筆界ステーションチェック」で記事と図解を確認する（スマホ・どのパソコンからでも開ける）。
  ページ：https://claude.ai/artifact/JuCAon3XbQ6M7s9VUVFpTs（slug：90f4ea9c-5c23-4c2b-8c14-5b92d7414c82）
- 記事や図解を変えたら、確認をたのむ前にページを作り直して出しなおす：
  変更を作業ブランチにコミットしてから、`STATION_CHECK_DRAFTS=1 npx astro build --outDir <作業用のフォルダ>`（下書きも並べるためのビルド。公開用の dist には入れない）→ `git fetch --unshallow origin`（浅い clone のときだけ。日報・週報に昔の記録も入れるため）→ `node --experimental-strip-types scripts/station-check-page.mjs <出力するHTML> origin/main <作業用のフォルダ>` → そのHTMLを `publish_files`（slug と最新の version を指定）。
  下書き（`draft: true`。発車標だけのものは除く）も「下書き」の印つきで並ぶ。
  公開中の main から変わった記事には「今回変わった」の印がつく。OK のあとで中身が変わった記事は、自動で「まだ」にもどる。
- ページには、報告（今やること・「直してほしい」の一覧・公開待ちの作業・週報・日報）と、チェック（記事と図解・ニュースの仕分け・通達・読み物のX投稿）がまとまっている。日報・週報は git の記録から作る。
- チェックの結果は、そのページのデータに入る：`checks/<記事のid>`（status: ok／fix、note）、`news/<下書きのファイル名>`（feed＝発車標に出す／skip＝出さない、note）、`tsutatsu/<通達のid>`（ok／fix、note）、`xposts/<列車>-<番号>`（posted）。
- それぞれ `db_list`（collection: checks／news／tsutatsu／xposts）で読み、「直してほしい」を直し、ニュースは「出す」を発車標に出して「出さない」を消す。直したら作業ブランチまで入れ、ページを出しなおし、公開は「公開して」を待つ。

## 「公開して」と言われたあとの入れ方

- `git fetch origin main` のあと、main が作業ブランチの祖先なら `git push origin HEAD:main`（早送り）。
  main が先に進んでいたら（毎朝のGoogleアラートや毎晩の自動公開のコミットなど）、作業ブランチに `git merge origin/main` してから push する。ぶつかったら直してから入れる。
- main への push で「GitHub Pagesに公開」が動き、サイトが更新される。入れる前に `npm run build` が通ることを確かめる。
- GitHub Actions からワークフローのファイル（.github/workflows/）は書きかえられないので、自動で main に入れるワークフローは作らない。
