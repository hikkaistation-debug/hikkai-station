// サイト全体の基本設定
// ※運営者の本名・事務所名・住所などは絶対に書かないでください。
export const SITE = {
  name: '筆界ステーション',
  tagline: '筆界・境界まわりの情報が集まる駅',
  description:
    '筆界・境界まわりのニュース、制度、通達、便利なツールや資料のリンクを集めた、非公式・個人運営の情報まとめサイトです。',
  operator: '筆界ステーション運営者',
  lang: 'ja',
  // お問い合わせ用の Googleフォームのアドレス（空のままなら「準備中」と表示）
  contactFormUrl: 'https://forms.gle/5qNVMSbHERXpndb66',
  // サイト専用の Xアカウントのユーザー名（@は付けない。空のままなら表示しない）
  xUser: 'hikkai_station',
};

// ─────────────────────────────────────────────
// サイトの組み立て（駅にたとえています）
//   筆界ステーション（トップ）＝ ターミナル駅
//   のりば   … 読者別の入口（src/data/platforms.ts）
//   路線     … 記事の分類。ターミナル → 路線のページ → 新しい記事 → … → 古い記事（終点）
//   駅の施設 … 調べものの道具
//   ご案内   … サイトについて
// メニューとトップの「サイトの案内図」は、この MENU を使います。
// ready: false のページは「準備中」と表示します。
// ─────────────────────────────────────────────
import { PLATFORMS } from './platforms';

export type MenuItem = { href: string; label: string; ready: boolean; num?: string; color?: string };
export type MenuGroup = { id: string; title: string; items: MenuItem[] };

export const MENU: MenuGroup[] = [
  {
    id: 'platforms',
    title: 'のりば',
    items: PLATFORMS.map((p) => ({ href: p.href, label: p.dest, ready: true, num: p.num, color: p.color })),
  },
  {
    id: 'facilities',
    title: '駅の施設',
    items: [
      { href: '/rosenzu/', label: '路線図', ready: true },
      { href: '/tags/', label: 'テーマ一覧', ready: true },
      { href: '/annai/', label: '逆引き案内所', ready: true },
      { href: '/search/', label: 'さがす', ready: true },
      { href: '/yomimono/', label: '車内の読み物', ready: true },
      { href: '/tsutatsu/', label: '通達ナビ', ready: false },
      { href: '/links/', label: 'リンク集', ready: false },
    ],
  },
  {
    id: 'info',
    title: 'ご案内',
    items: [
      { href: '/about/', label: 'このサイトについて', ready: true },
      { href: '/contact/', label: 'お問い合わせ', ready: true },
    ],
  },
];

// 駅名標の「となりの駅」で使う、ターミナル駅（トップ）
export const TERMINAL = { label: SITE.name, href: '/' };
