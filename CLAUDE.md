# hikkai-station で作業するときの決まり

## 公開は運営者が確認してから（運営者の指示・2026-11-09）

- main への push はサイトの公開になる。**運営者が内容を確認して「公開して」と言うまで、main に入れない**。記事・発車標・ツールなど、どの変更も同じ。
- それまでの作業は、作業ブランチ（claude/…）までにする。

## 「公開して」と言われたあとの入れ方

- `git fetch origin main` のあと、main が作業ブランチの祖先なら `git push origin HEAD:main`（早送り）。
  main が先に進んでいたら（毎朝のGoogleアラートや毎晩の自動公開のコミットなど）、作業ブランチに `git merge origin/main` してから push する。ぶつかったら直してから入れる。
- main への push で「GitHub Pagesに公開」が動き、サイトが更新される。入れる前に `npm run build` が通ることを確かめる。
- GitHub Actions からワークフローのファイル（.github/workflows/）は書きかえられないので、自動で main に入れるワークフローは作らない。
