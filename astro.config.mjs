// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// 下書きチェックの結果を、手元のファイル（review/shitagaki-check.json）に保存するしくみ。
// 確認用画面（npm run dev）のときだけ動きます。本物のサイトには入りません。
const reviewFile = fileURLToPath(new URL('./review/shitagaki-check.json', import.meta.url));
function shitagakiReview() {
  return {
    name: 'shitagaki-review',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use('/__shitagaki', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method === 'GET') {
          res.end(fs.existsSync(reviewFile) ? fs.readFileSync(reviewFile, 'utf8') : '{}');
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.mkdirSync(fileURLToPath(new URL('./review/', import.meta.url)), { recursive: true });
              fs.writeFileSync(reviewFile, JSON.stringify(data, null, 2) + '\n');
              res.end('{"ok":true}');
            } catch {
              res.statusCode = 400;
              res.end('{"ok":false}');
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end('{}');
      });
    },
  };
}

// X 投稿チェック（/x-check/）のしくみ。確認用画面（npm run dev）のときだけ動きます。
//   /__xcheck … 投稿済み・チェック結果を review/x-check.json に保存／読み出し（送られてきた話の分だけ書きかえる）
//   /__xcheck/handoff … 「保存して Claude に渡す」で review/x-handoff.json に書く（待機中の Claude が読みに来る）
//   /__xcheck/status … Claude が待機中か（scripts/check-watch.sh x が review/.claude-watching-x を更新している）
//   /__xstories/<日付>/<画像> … brand/x/stories/ の画像を見せる（GitHub には送らない画像）
const xReviewDir = fileURLToPath(new URL('./review/', import.meta.url));
const xCheckFile = `${xReviewDir}x-check.json`;
const xHandoffFile = `${xReviewDir}x-handoff.json`;
const xWatchingFile = `${xReviewDir}.claude-watching-x`;
const xStoriesDir = fileURLToPath(new URL('./brand/x/stories/', import.meta.url));
const xRead = (f) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return {};
  }
};
const xWrite = (f, data) => {
  fs.mkdirSync(xReviewDir, { recursive: true });
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
};
function xCheck() {
  return {
    name: 'x-check',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use('/__xcheck', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const path = (req.url ?? '/').split('?')[0];
        if (req.method === 'GET' && path === '/status') {
          let watching = false;
          try {
            watching = Date.now() - fs.statSync(xWatchingFile).mtimeMs < 15000;
          } catch {}
          res.end(JSON.stringify({ watching }));
          return;
        }
        if (req.method === 'GET') {
          res.end(JSON.stringify(xRead(xCheckFile)));
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (path === '/handoff') {
                xWrite(xHandoffFile, { at: new Date().toISOString(), text: String(data.text ?? '') });
                res.end('{"ok":true}');
                return;
              }
              const current = xRead(xCheckFile);
              for (const [id, entry] of Object.entries(data)) {
                if (entry === null) delete current[id];
                else current[id] = entry;
              }
              xWrite(xCheckFile, current);
              res.end(JSON.stringify(current));
            } catch {
              res.statusCode = 400;
              res.end('{"ok":false}');
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end('{}');
      });
      server.middlewares.use('/__xstories', (req, res) => {
        const m = decodeURIComponent((req.url ?? '').split('?')[0]).match(/^\/(\d{4}-\d\d-\d\d)\/([\w-]+\.png)$/);
        const file = m && `${xStoriesDir}${m[1]}/${m[2]}`;
        if (!file || !fs.existsSync(file)) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store');
        res.end(fs.readFileSync(file));
      });
    },
  };
}

// 通達チェック（/tsutatsu-check/）のしくみ。確認用画面（npm run dev）のときだけ動きます。
//   /__tsutatsu … 「気になる」印・メモ・チェック結果を review/tsutatsu-check.json に保存／読み出し
//   送られてきた通達の分だけ書きかえる（null は削除）。
//   /__tsutatsu/handoff … 「保存して Claude に渡す」で review/tsutatsu-handoff.json に書く（待機中の Claude が読みに来る）
//   /__tsutatsu/status … Claude が待機中か（scripts/check-watch.sh tsutatsu が review/.claude-watching-tsutatsu を更新している）
const tsutatsuCheckFile = fileURLToPath(new URL('./review/tsutatsu-check.json', import.meta.url));
const tsutatsuHandoffFile = fileURLToPath(new URL('./review/tsutatsu-handoff.json', import.meta.url));
const tsutatsuWatchingFile = fileURLToPath(new URL('./review/.claude-watching-tsutatsu', import.meta.url));
//   /__tsutatsu/candidates … まだ載せていない通達の候補（review/tsutatsu-candidates.json。毎週の予定タスクや Claude が書く）
//   候補への「載せる／載せない」は、tsutatsu-check.json に "cand:<候補のid>" の行として保存する。
const tsutatsuCandidatesFile = fileURLToPath(new URL('./review/tsutatsu-candidates.json', import.meta.url));
// 通達チェック用の読み書き（ほかのチェックのしくみに頼らず、これだけで動くようにしておく）
const tsRead = (f) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return {};
  }
};
const tsWrite = (f, data) => {
  fs.mkdirSync(fileURLToPath(new URL('./review/', import.meta.url)), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
};
function tsutatsuCheck() {
  return {
    name: 'tsutatsu-check',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use('/__tsutatsu', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const path = (req.url ?? '/').split('?')[0];
        if (req.method === 'GET' && path === '/status') {
          let watching = false;
          try {
            watching = Date.now() - fs.statSync(tsutatsuWatchingFile).mtimeMs < 15000;
          } catch {}
          res.end(JSON.stringify({ watching }));
          return;
        }
        if (req.method === 'GET' && path === '/candidates') {
          res.end(JSON.stringify(tsRead(tsutatsuCandidatesFile)));
          return;
        }
        if (req.method === 'GET') {
          res.end(JSON.stringify(tsRead(tsutatsuCheckFile)));
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (path === '/handoff') {
                tsWrite(tsutatsuHandoffFile, { at: new Date().toISOString(), text: String(data.text ?? '') });
                res.end('{"ok":true}');
                return;
              }
              const current = tsRead(tsutatsuCheckFile);
              for (const [id, entry] of Object.entries(data)) {
                if (entry === null) delete current[id];
                else current[id] = entry;
              }
              tsWrite(tsutatsuCheckFile, current);
              res.end(JSON.stringify(current));
            } catch {
              res.statusCode = 400;
              res.end('{"ok":false}');
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end('{}');
      });
    },
  };
}

// site: 公開するときのアドレス（RSS・サイトマップ・SNS共有の表示に使います）
export default defineConfig({
  site: 'https://hikkai-station.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/shitagaki-check/') })],
  vite: { plugins: [shitagakiReview(), xCheck(), tsutatsuCheck()] },
});
