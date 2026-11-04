// 読者別の入口「のりば」
// のりばごとの色は、行き先のページの見出しの帯や、Xのバナーと同じ色にそろえています。
export const PLATFORMS = [
  {
    num: '1',
    who: 'はじめての方',
    short: 'はじめて',
    title: '境界ってそもそも何？',
    desc: '「筆界」「境界」「登記」など、まずは基本の言葉をやさしく解説します。',
    href: '/kiso/',
    color: '#6d28a8', // 紫（基礎解説の路線と同じ）
  },
  {
    num: '2',
    who: 'お困りの方',
    short: 'お困り',
    title: '隣地との境界・相続した土地・登記のこと',
    desc: '隣の土地との境目や、相続した土地のことなど、困りごと別にやさしい記事を集めました。',
    href: '/komarigoto/',
    color: '#c4122f', // 赤（境界の路線と同じ）
  },
  {
    num: '3',
    who: '実務者の方',
    short: '実務者',
    title: '法改正・通達・裁決・技術の情報',
    desc: '制度の動きや実務・技術のニュースを、出典リンク付きでまとめます。',
    href: '/news/',
    color: '#0b62b4', // 青（制度の路線と同じ）
  },
  {
    num: '4',
    who: '受験生の方',
    short: '受験生',
    title: '土地家屋調査士試験',
    desc: '試験のしくみや公式の情報へのリンク、試験に関するニュースをまとめます。',
    href: '/shiken/',
    color: '#0f766e', // 青緑（試験の路線と同じ）
  },
] as const;

export const platformColor = (num: string) => PLATFORMS.find((p) => p.num === num)!.color;
