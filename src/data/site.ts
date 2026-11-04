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

// サイト内のおもな行き先（路線図ナビ・メニューで使います）
// ready: false のページは「準備中」と表示します。
export const STATIONS = [
  { href: '/', label: 'トップ', ready: true },
  { href: '/news/', label: 'ニュース', ready: true },
  { href: '/kiso/', label: '基礎解説', ready: true },
  { href: '/shiken/', label: '調査士試験', ready: true },
  { href: '/annai/', label: '逆引き案内所', ready: true },
  { href: '/tsutatsu/', label: '通達ナビ', ready: false },
  { href: '/links/', label: 'リンク集', ready: false },
  { href: '/about/', label: 'このサイトについて', ready: true },
  { href: '/contact/', label: 'お問い合わせ', ready: true },
] as const;
