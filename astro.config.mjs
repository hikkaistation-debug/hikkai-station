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
//   /__xcheck … 投稿済み・チェック結果を review/x-check.json に保存／読み出し
//   /__xstories/<日付>/<画像> … brand/x/stories/ の画像を見せる（GitHub には送らない画像）
const xCheckFile = fileURLToPath(new URL('./review/x-check.json', import.meta.url));
const xStoriesDir = fileURLToPath(new URL('./brand/x/stories/', import.meta.url));
function xCheck() {
  return {
    name: 'x-check',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.middlewares.use('/__xcheck', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method === 'GET') {
          res.end(fs.existsSync(xCheckFile) ? fs.readFileSync(xCheckFile, 'utf8') : '{}');
          return;
        }
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.mkdirSync(fileURLToPath(new URL('./review/', import.meta.url)), { recursive: true });
              fs.writeFileSync(xCheckFile, JSON.stringify(data, null, 2) + '\n');
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

// site: 公開するときのアドレス（RSS・サイトマップ・SNS共有の表示に使います）
export default defineConfig({
  site: 'https://hikkai-station.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/shitagaki-check/') })],
  vite: { plugins: [shitagakiReview(), xCheck()] },
});
