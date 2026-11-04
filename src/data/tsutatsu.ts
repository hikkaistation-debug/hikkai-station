// 通達ナビのデータ
// ・名称・日付・番号は、必ず法務省などの公式ページで確かめてから書いてください。
// ・summary は「何についての通達か」がわかる程度の短い説明にとどめ、本文の転載はしません。
// ・url は公式のPDFやページ。sourcePage はそのPDFが載っている一覧ページ。
export type TsutatsuField = '登記事務全般' | '相続登記' | '住所等の変更登記' | '筆界・地図' | 'その他';
export const TSUTATSU_FIELDS: TsutatsuField[] = ['登記事務全般', '相続登記', '住所等の変更登記', '筆界・地図', 'その他'];

export type Tsutatsu = {
  id: string; // アドレス（/tsutatsu/○○/）
  title: string; // 正式な名称
  date: string; // 発出日（YYYY-MM-DD）
  number: string; // 番号（例：法務省民二第927号）
  issuer: string; // 発出者
  fields: TsutatsuField[];
  laws: string[]; // 関係する法令・条文
  summary: string; // ひとことで（このサイトの説明）
  url: string; // 本文（公式）
  sourcePage?: { label: string; href: string }; // 掲載されている公式の一覧ページ
  checkedDate: string; // このサイトで最後に確かめた日（YYYY-MM-DD）
};

export const TSUTATSU: Tsutatsu[] = [
  {
    id: 'r080327-525',
    title: '民法等の一部を改正する法律の施行に伴う不動産登記事務の取扱いについて（符号の表示関係及び職権による住所等変更登記関係）',
    date: '2026-03-27',
    number: '法務省民二第525号',
    issuer: '法務省民事局長',
    fields: ['住所等の変更登記'],
    laws: ['不動産登記法', '民法等の一部を改正する法律（令和3年法律第24号）'],
    summary: '住所等変更登記の義務化（2026年4月1日施行）にあわせて、登記官が職権で住所等の変更の登記をする場合の取扱いや、「符号の表示」についての取扱いを示した通達です。',
    url: 'https://www.moj.go.jp/content/001459424.pdf',
    sourcePage: { label: '法務省：住所等変更登記の義務化の関係法令等', href: 'https://www.moj.go.jp/MINJI/minji05_00696.html' },
    checkedDate: '2026-11-04',
  },
  {
    id: 'r071030-915',
    title: '民法等の一部を改正する法律の施行に伴う不動産登記事務の取扱いについて（住所等変更登記の義務化関係）',
    date: '2025-10-30',
    number: '法務省民二第915号',
    issuer: '法務省民事局長',
    fields: ['住所等の変更登記'],
    laws: ['不動産登記法', '民法等の一部を改正する法律（令和3年法律第24号）'],
    summary: '所有権の登記名義人の住所・氏名などが変わったときの変更登記の申請義務化（2026年4月1日施行）について、登記所での事務の取扱いを示した通達です。',
    url: 'https://www.moj.go.jp/content/001449408.pdf',
    sourcePage: { label: '法務省：住所等変更登記の義務化の関係法令等', href: 'https://www.moj.go.jp/MINJI/minji05_00696.html' },
    checkedDate: '2026-11-04',
  },
  {
    id: 'r060315-535',
    title: '民法等の一部を改正する法律の施行に伴う不動産登記事務の取扱いについて（相続人申告登記関係）',
    date: '2024-03-15',
    number: '法務省民二第535号',
    issuer: '法務省民事局長',
    fields: ['相続登記'],
    laws: ['不動産登記法76条の3', '民法等の一部を改正する法律（令和3年法律第24号）'],
    summary: '相続人が「自分が相続人である」と登記官に申し出る「相続人申告登記」について、登記所での手続きの取扱いを示した通達です。',
    url: 'https://www.moj.go.jp/content/001462018.pdf',
    sourcePage: { label: '法務省：相続登記の申請義務化の関係法令等', href: 'https://www.moj.go.jp/MINJI/minji05_00601.html' },
    checkedDate: '2026-11-04',
  },
  {
    id: 'r050912-927',
    title: '民法等の一部を改正する法律の施行に伴う不動産登記事務の取扱いについて（相続登記等の申請義務化関係）',
    date: '2023-09-12',
    number: '法務省民二第927号',
    issuer: '法務省民事局長',
    fields: ['相続登記'],
    laws: ['不動産登記法76条の2', '不動産登記法164条', '民法等の一部を改正する法律（令和3年法律第24号）'],
    summary: '相続登記の申請義務化（2024年4月1日施行）について、登記所での事務の取扱いを示した通達です。法定相続分で登記した後に遺産分割が成立した場合の申請義務なども扱っています。',
    url: 'https://www.moj.go.jp/content/001408564.pdf',
    sourcePage: { label: '法務省：相続登記の申請義務化の関係法令等', href: 'https://www.moj.go.jp/MINJI/minji05_00601.html' },
    checkedDate: '2026-11-04',
  },
  {
    id: 'h170225-456',
    title: '不動産登記事務取扱手続準則',
    date: '2005-02-25',
    number: '法務省民二第456号',
    issuer: '法務省民事局長',
    fields: ['登記事務全般', '筆界・地図'],
    laws: ['不動産登記法', '不動産登記規則'],
    summary: '登記所での不動産登記の事務の進め方を、細かく定めた通達です。地図や地積測量図、土地・建物の表示に関する登記の扱いなども含まれ、実務でよく参照されます。何度も改正されているので、最新の版を確かめてください。',
    url: 'https://www.moj.go.jp/content/001394394.pdf',
    checkedDate: '2026-11-04',
  },
];

// 新しい順
export const sortedTsutatsu = () => [...TSUTATSU].sort((a, b) => b.date.localeCompare(a.date));

// 和暦の表示（令和・平成）
export function wareki(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const era = y >= 2019 && !(y === 2019 && m < 5) ? ['令和', y - 2018] : ['平成', y - 1988];
  const n = era[1] === 1 ? '元' : String(era[1]);
  return `${era[0]}${n}年${m}月${d}日`;
}
export const seireki = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
};
