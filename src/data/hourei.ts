// 法令ナビのデータ（条文ごとのメモ）
// ・条文の番号・見出し・内容は、必ず e-Gov法令検索の原文で確かめてから書いてください。
// ・summary は条文の言い換え（やさしい説明）。条文そのものの全文転載はしません。
// ・keywords は検索で引っかかってほしい言葉（言いかえ・よみ・実務の呼び方など）。多くてかまいません。
import type { NaviField } from './navi';

export const LAWS = {
  fudosantokiho: { name: '不動産登記法', num: '平成16年法律第123号', id: '416AC0000000123' },
  kisoku: { name: '不動産登記規則', num: '平成17年法務省令第18号', id: '417M60000010018' },
  kokuchorei: { name: '国土調査法施行令', num: '昭和27年政令第59号', id: '327CO0000000059' },
} as const;
export type LawKey = keyof typeof LAWS;

export type Hourei = {
  id: string; // ページ内の位置（/hourei/#○○）
  law: LawKey;
  article: string; // 表示用（例：76条の2）
  anchor?: string; // e-Gov の条のしるし（例：76_2）。なければ法令のトップへ
  heading: string; // 条文の見出し
  summary: string;
  fields: NaviField[];
  keywords: string[];
  links?: { label: string; href: string }[]; // このサイトの関連ページ
  checkedDate: string; // 原文で確かめた日
};

export const HOUREI: Hourei[] = [
  // ── 不動産登記法 ──
  {
    id: 'fudosantokiho-2',
    law: 'fudosantokiho', article: '2条', anchor: '2', heading: '定義',
    summary: '「不動産」は土地または建物のこと。「表示に関する登記」「権利に関する登記」など、法律で使う言葉の意味を決めています。',
    fields: ['登記事務全般'],
    keywords: ['不動産とは', '表示に関する登記', '権利に関する登記', '登記記録', '表題部', '用語の定義'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-14',
    law: 'fudosantokiho', article: '14条', anchor: '14', heading: '地図等',
    summary: '登記所には地図と建物所在図を置きます（1項）。地図は土地ごとに区画を明確にし、地番を表示します（2項）。地図ができるまでは「地図に準ずる図面」を置くことができます（4項）。',
    fields: ['地図・公図'],
    keywords: ['14条地図', '14条1項地図', '法14条地図', '地図に準ずる図面', '公図', '建物所在図', '旧土地台帳附属地図'],
    links: [{ label: '用語：公図', href: '/annai/#g-kouzu' }, { label: '用語：14条1項地図', href: '/annai/#g-chizu14' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-29',
    law: 'fudosantokiho', article: '29条', anchor: '29', heading: '登記官による調査',
    summary: '表示に関する登記の申請などがあったとき、登記官は必要があれば不動産の調査（実地調査）をすることができます。',
    fields: ['登記官の調査', '土地の表示登記', '建物の表示登記'],
    keywords: ['実地調査', '登記官の調査', '現地調査', '立入り', '質問'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-34',
    law: 'fudosantokiho', article: '34条', anchor: '34', heading: '土地の表示に関する登記の登記事項',
    summary: '土地の表示に関する登記には、所在（市区町村・字）、地番、地目、地積などを記録します。',
    fields: ['土地の表示登記', '地目', '地積'],
    keywords: ['登記事項', '所在', '地番', '地目', '地積', '表題部'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-36',
    law: 'fudosantokiho', article: '36条', anchor: '36', heading: '土地の表題登記の申請',
    summary: '新しくできた土地や、表題登記がない土地の所有権を取得した人は、取得の日から1か月以内に表題登記を申請しなければなりません。',
    fields: ['土地の表示登記', '申請の期限・過料'],
    keywords: ['土地表題登記', '表題登記', '1か月以内', '一月以内', '未登記の土地', '埋立地'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-37',
    law: 'fudosantokiho', article: '37条', anchor: '37', heading: '地目又は地積の変更の登記の申請',
    summary: '地目や地積が変わったときは、変更があった日から1か月以内に、変更の登記を申請しなければなりません。',
    fields: ['地目', '地積', '申請の期限・過料'],
    keywords: ['地目変更登記', '地積変更登記', '農地から宅地', '1か月以内', '一月以内'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-39',
    law: 'fudosantokiho', article: '39条', anchor: '39', heading: '分筆又は合筆の登記',
    summary: '分筆・合筆の登記は、表題部所有者または所有権の登記名義人しか申請できません（1項）。土地の一部が別の地目になったときなどは、登記官が職権で分筆します（2項）。',
    fields: ['分筆・合筆', '職権による登記'],
    keywords: ['分筆登記', '合筆登記', '申請人', '職権分筆', '一部地目変更'],
    links: [{ label: '用語：分筆', href: '/annai/#g-bunpitsu' }, { label: '用語：合筆', href: '/annai/#g-gappitsu' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-44',
    law: 'fudosantokiho', article: '44条', anchor: '44', heading: '建物の表示に関する登記の登記事項',
    summary: '建物の表示に関する登記には、所在、家屋番号、種類・構造・床面積、附属建物などを記録します。',
    fields: ['建物の表示登記', '建物の種類・床面積'],
    keywords: ['登記事項', '家屋番号', '種類', '構造', '床面積', '附属建物', '区分建物'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-47',
    law: 'fudosantokiho', article: '47条', anchor: '47', heading: '建物の表題登記の申請',
    summary: '建物を新築した人や、表題登記がない建物の所有権を取得した人は、取得の日から1か月以内に表題登記を申請しなければなりません。',
    fields: ['建物の表示登記', '申請の期限・過料'],
    keywords: ['建物表題登記', '新築', '表題登記', '1か月以内', '一月以内', '未登記建物'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-51',
    law: 'fudosantokiho', article: '51条', anchor: '51', heading: '建物の表題部の変更の登記',
    summary: '建物の種類・構造・床面積など表題部の内容が変わったときは、変更があった日から1か月以内に変更の登記を申請しなければなりません。',
    fields: ['建物の表示登記', '建物の種類・床面積', '申請の期限・過料'],
    keywords: ['建物表題部変更登記', '増築', '床面積の変更', '種類の変更', '構造の変更', '1か月以内'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-76-2',
    law: 'fudosantokiho', article: '76条の2', anchor: '76_2', heading: '相続等による所有権の移転の登記の申請',
    summary: '相続で所有権を取得した人は、相続の開始と取得を知った日から3年以内に、所有権の移転の登記（相続登記）を申請しなければなりません（1項）。法定相続分で登記した後の遺産分割で多く取得した人は、遺産分割の日から3年以内（2項）。',
    fields: ['相続登記', '申請の期限・過料'],
    keywords: ['相続登記の義務化', '申請義務', '3年以内', '三年以内', '遺産分割', '法定相続分', '遺贈', '名義変更'],
    links: [{ label: '用語：相続登記', href: '/annai/#g-souzokutouki' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-76-3',
    law: 'fudosantokiho', article: '76条の3', anchor: '76_3', heading: '相続人である旨の申出等',
    summary: '相続登記の義務がある人は、相続が始まったことと自分が相続人であることを登記官に申し出られます（1項）。期限内に申し出れば、申請の義務を果たしたものとみなされます（2項）。',
    fields: ['相続人申告登記', '相続登記'],
    keywords: ['相続人申告登記', '相続人である旨の申出', '申出', '義務の履行', '付記'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-76-5',
    law: 'fudosantokiho', article: '76条の5', anchor: '76_5', heading: '所有権の登記名義人の氏名等の変更の登記の申請',
    summary: '所有権の登記名義人の氏名・名称・住所が変わったときは、変更があった日から2年以内に変更の登記を申請しなければなりません。',
    fields: ['住所・氏名の変更登記', '申請の期限・過料'],
    keywords: ['住所変更登記', '氏名変更登記', '住所等変更登記の義務化', '引っ越し', '結婚', '2年以内', '二年以内'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-76-6',
    law: 'fudosantokiho', article: '76条の6', anchor: '76_6', heading: '職権による氏名等の変更の登記',
    summary: '法務省令で定める場合には、登記官が職権で氏名・名称・住所の変更の登記をすることができます。個人の場合は、その人の申出があるときに限ります。',
    fields: ['住所・氏名の変更登記', '職権による登記'],
    keywords: ['職権', '住所変更', '申出', 'スマート変更登記'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-123',
    law: 'fudosantokiho', article: '123条', anchor: '123', heading: '定義（筆界・筆界特定など）',
    summary: '「筆界」は、土地が登記されたときにその境を構成するとされた点とそれを結ぶ直線（1号）。「筆界特定」は、筆界の現地での位置を特定すること。位置を特定できないときは、位置の範囲を特定します（2号）。',
    fields: ['筆界・境界', '筆界特定'],
    keywords: ['筆界とは', '筆界の定義', '境界', '公法上の境界', '筆界特定とは', '位置の範囲', '対象土地', '関係土地'],
    links: [{ label: '用語：筆界', href: '/annai/#g-hikkai' }, { label: '用語：筆界特定制度', href: '/annai/#g-tokutei' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-131',
    law: 'fudosantokiho', article: '131条', anchor: '131', heading: '筆界特定の申請',
    summary: '土地の所有権登記名義人などは、筆界特定登記官に筆界特定を申請できます。申請には手数料がかかります。',
    fields: ['筆界特定'],
    keywords: ['筆界特定の申請', '申請人', '手数料', '筆界特定登記官', '地方公共団体'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-132',
    law: 'fudosantokiho', article: '132条', anchor: '132', heading: '申請の却下',
    summary: '所有権の境界（どこまでがだれの物か）の特定を目的とする申請や、すでに筆界確定の判決が確定しているときなどは、筆界特定の申請は却下されます。',
    fields: ['筆界特定', '筆界・境界'],
    keywords: ['却下', '所有権の境界', '所有権界', '筆界確定訴訟', '判決'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-143',
    law: 'fudosantokiho', article: '143条', anchor: '143', heading: '筆界特定',
    summary: '筆界特定登記官は、筆界調査委員の意見をふまえ、登記記録・地図・地形・境界標などの事情を総合的に考えて筆界特定をし、筆界特定書を作ります。',
    fields: ['筆界特定'],
    keywords: ['筆界特定書', '筆界調査委員', '総合的に考慮', '境界標', '囲障'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'fudosantokiho-164',
    law: 'fudosantokiho', article: '164条', anchor: '164', heading: '過料',
    summary: '表題登記・地目や地積の変更・相続登記などの申請義務がある人が、正当な理由なく申請を怠ると10万円以下の過料（1項）。住所等の変更の登記は5万円以下の過料（2項）。',
    fields: ['申請の期限・過料'],
    keywords: ['過料', '罰則', '10万円', '5万円', '正当な理由', '申請を怠った'],
    checkedDate: '2026-11-05',
  },
  // ── 不動産登記規則 ──
  {
    id: 'kisoku-10',
    law: 'kisoku', article: '10条', anchor: '10', heading: '地図',
    summary: '地図の縮尺（市街地は1/250か1/500など）や、作るときの測量の基準、地域ごとの精度区分（市街地は甲二まで、村落・農耕地は乙一まで、山林・原野は乙三まで）を定めています。',
    fields: ['地図・公図', '測量・公差'],
    keywords: ['精度区分', '甲二', '乙一', '乙三', '縮尺', '基本三角点等', '誤差の限度', '公差'],
    links: [{ label: '公差の計算ツール', href: '/tools/kousa/' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-77',
    law: 'kisoku', article: '77条', anchor: '77', heading: '地積測量図の内容',
    summary: '地積測量図に書くこと（地番、方位、縮尺、地積と求積方法、筆界点間の距離、座標値、境界標など）と、原則1/250の縮尺で作ることを定めています。精度は10条4項を準用します（5項）。',
    fields: ['地積測量図', '測量・公差'],
    keywords: ['地積測量図の記載事項', '求積方法', '筆界点の座標', '境界標の表示', '縮尺250分の1', '平面直角座標系'],
    links: [{ label: '用語：地積測量図', href: '/annai/#g-sokuryozu' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-78',
    law: 'kisoku', article: '78条', anchor: '78', heading: '分筆の登記の場合の地積測量図',
    summary: '分筆の登記の地積測量図には、分筆前の土地を描き、分筆線を明らかにして、分筆後の各土地に符号を付けます。',
    fields: ['地積測量図', '分筆・合筆'],
    keywords: ['分筆線', '分筆後の土地', '符号'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-93',
    law: 'kisoku', article: '93条', anchor: '93', heading: '実地調査',
    summary: '表示に関する登記をするときは、登記官は原則として実地調査を行います。土地家屋調査士の調査報告などで必要がないと認めるときは、この限りではありません。',
    fields: ['登記官の調査', '土地の表示登記', '建物の表示登記'],
    keywords: ['実地調査', '調査報告', '不動産調査報告書', '土地家屋調査士'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-99',
    law: 'kisoku', article: '99条', anchor: '99', heading: '地目',
    summary: '地目は、土地の主な用途によって、田・畑・宅地・山林・原野・公衆用道路・雑種地など23種類に分けて定めます。',
    fields: ['地目'],
    keywords: ['地目の種類', '田', '畑', '宅地', '山林', '原野', '雑種地', '公衆用道路', '用悪水路', '23種類'],
    links: [{ label: '用語：地目', href: '/annai/#g-chimoku' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-100',
    law: 'kisoku', article: '100条', anchor: '100', heading: '地積',
    summary: '地積は水平投影面積で、平方メートル単位。1㎡の100分の1未満は切り捨て（宅地・鉱泉地以外で10㎡を超える土地は1㎡未満を切り捨て）。',
    fields: ['地積'],
    keywords: ['地積の端数', '切り捨て', '水平投影面積', '平方メートル', '小数点以下'],
    links: [{ label: '座標から面積を計算', href: '/tools/zahyo-menseki/' }, { label: '用語：地積', href: '/annai/#g-chiseki' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-111',
    law: 'kisoku', article: '111条', anchor: '111', heading: '建物',
    summary: '建物は、屋根と周壁（またはこれに類するもの）があり（外気分断性）、土地に定着していて（定着性）、目的とする用途に使える状態にある（用途性）ものでなければなりません。建物として登記できるかの基準です。',
    fields: ['建物の認定', '建物の表示登記'],
    keywords: ['建物の定義', '建物の認定', '建物認定', '外気分断性', '定着性', '用途性', '屋根', '周壁', '登記できる建物', 'コンテナ', 'ビニールハウス', 'カーポート'],
    links: [{ label: '用語：外気分断性', href: '/annai/#g-gaiki' }],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-113',
    law: 'kisoku', article: '113条', anchor: '113', heading: '建物の種類',
    summary: '建物の種類は、主な用途によって居宅・店舗・共同住宅・事務所・倉庫・車庫などに分けて定めます。用途が2つ以上なら、その用途で定めます。',
    fields: ['建物の種類・床面積'],
    keywords: ['建物の種類', '居宅', '店舗', '共同住宅', '事務所', '倉庫', '車庫', '居宅・店舗'],
    checkedDate: '2026-11-05',
  },
  {
    id: 'kisoku-115',
    law: 'kisoku', article: '115条', anchor: '115', heading: '建物の床面積',
    summary: '床面積は、各階ごとに壁などの中心線（区分建物は内側線）で囲まれた部分の水平投影面積で、1㎡の100分の1未満は切り捨てます。',
    fields: ['建物の種類・床面積'],
    keywords: ['床面積', '壁芯', '壁心', '内法', '区分建物', '水平投影面積', '切り捨て'],
    checkedDate: '2026-11-05',
  },
  // ── 国土調査法施行令 ──
  {
    id: 'kokuchorei-beppyo4',
    law: 'kokuchorei', article: '別表第四', heading: '一筆地測量及び地積測定の誤差の限度',
    summary: '精度区分（甲一〜乙三）ごとに、筆界点の位置誤差、筆界点間の距離の公差、地積測定の公差を定めた表です。法務局の地図や地積測量図の精度の基準にも使われます。',
    fields: ['測量・公差', '地積測量図', '地積'],
    keywords: ['公差', '精度区分', '甲一', '甲二', '甲三', '乙一', '乙二', '乙三', '位置誤差', '平均二乗誤差', '地積の公差', '距離の公差'],
    links: [{ label: '公差の計算ツール', href: '/tools/kousa/' }],
    checkedDate: '2026-11-05',
  },
];

export const lawUrl = (h: Hourei) => {
  const base = `https://laws.e-gov.go.jp/law/${LAWS[h.law].id}`;
  return h.anchor ? `${base}#Mp-At_${h.anchor}` : base;
};
export const houreiTitle = (h: Hourei) => `${LAWS[h.law].name} ${h.article}（${h.heading}）`;
