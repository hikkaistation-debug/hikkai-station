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

// site: 公開するときのアドレス（RSS・サイトマップ・SNS共有の表示に使います）
export default defineConfig({
  site: 'https://hikkai-station.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/shitagaki-check/') })],
  vite: { plugins: [shitagakiReview()] },
});
