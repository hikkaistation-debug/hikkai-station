// サイト全体の基本設定
// ※運営者の本名・事務所名・住所などは絶対に書かないでください。
export const SITE = {
  name: '筆界ステーション',
  tagline: '筆界・境界まわりの情報が集まる駅',
  description:
    '筆界・境界まわりのニュース、制度、通達、便利なツールや資料のリンクを集めた、非公式・個人運営の情報まとめサイトです。',
  operator: '筆界ステーション運営者',
  lang: 'ja',
};

// サイト内のおもな行き先（路線図ナビ・メニューで使います）
// ready: false のページは「準備中」と表示します。
export const STATIONS = [
  { href: '/', label: 'トップ', code: '00', ready: true },
  { href: '/news/', label: 'ニュース', code: '01', ready: true },
  { href: '/kiso/', label: '基礎解説', code: '02', ready: true },
  { href: '/tsutatsu/', label: '通達ナビ', code: '03', ready: false },
  { href: '/links/', label: 'リンク集', code: '04', ready: false },
  { href: '/about/', label: 'このサイトについて', code: '05', ready: true },
  { href: '/contact/', label: 'お問い合わせ', code: '06', ready: true },
] as const;
