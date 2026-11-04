// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// site: 公開するときのアドレス（RSS・サイトマップ・SNS共有の表示に使います）
export default defineConfig({
  site: 'https://hikkai-station.com',
  integrations: [sitemap()],
});
