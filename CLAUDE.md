# hikkai-station で作業するときの決まり

## 作業が終わったら main にも入れる

- 変更をコミットして作業ブランチ（claude/…）に push したら、続けて **main にも入れて push する**（持ち主の了承ずみ。毎回きかなくてよい）。
- 入れ方：`git fetch origin main` のあと、main が作業ブランチの祖先なら `git push origin HEAD:main`（早送り）。
  main が先に進んでいたら（毎朝のGoogleアラートや毎晩の自動公開のコミットなど）、作業ブランチに `git merge origin/main` してから push する。ぶつかったら直してから入れる。
- main への push で「GitHub Pagesに公開」が動き、サイトが更新される。入れる前に `npm run build` が通ることを確かめる。
- GitHub Actions からワークフローのファイル（.github/workflows/）は書きかえられないので、自動で main に入れるワークフローは作らない。
