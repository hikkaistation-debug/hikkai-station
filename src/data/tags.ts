// タグ辞書：記事に付けられるタグの一覧（テーマごと）
// 記事の tags: には、ここにある「name」だけを書けます（ほかの言葉を書くとエラーで知らせます）。
// 新しいタグが必要になったら、この一覧に1行足してください。
//   id      : タグのページのアドレスに使う名前（半角英数字）
//   name    : タグの名前（記事に書く言葉）
//   glossary: 用語さくいん（src/data/glossary.ts）の id。あればタグのページに説明を出します（任意）
export const TAG_GROUPS = [
  {
    id: 'kihon',
    title: '基本',
    tags: [
      { id: 'hikkai', name: '筆界', glossary: 'hikkai' },
      { id: 'kyokai', name: '境界' },
      { id: 'nyumon', name: '入門' },
    ],
  },
  {
    id: 'tetsuzuki',
    title: '手続き・制度',
    tags: [
      { id: 'souzokutouki', name: '相続登記', glossary: 'souzokutouki' },
      { id: 'bunpitsu', name: '分筆', glossary: 'bunpitsu' },
      { id: 'gappitsu', name: '合筆', glossary: 'gappitsu' },
      { id: 'hikkaitokutei', name: '筆界特定', glossary: 'tokutei' },
      { id: 'kokko', name: '相続土地国庫帰属制度', glossary: 'kokko' },
      { id: 'houkaisei', name: '法改正' },
    ],
  },
  {
    id: 'shiryo',
    title: '図面・資料',
    tags: [
      { id: 'kouzu', name: '公図', glossary: 'kouzu' },
      { id: 'chizu14', name: '14条1項地図', glossary: 'chizu14' },
      { id: 'sokuryozu', name: '地積測量図', glossary: 'sokuryozu' },
      { id: 'kanmin', name: '官民境界', glossary: 'kanmin' },
      { id: 'fudosantokiho', name: '不動産登記法' },
    ],
  },
  {
    id: 'genchi',
    title: '現地・トラブル',
    tags: [
      { id: 'kyokaihyo', name: '境界標', glossary: 'kyokaihyo' },
      { id: 'ekkyo', name: '越境', glossary: 'ekkyo' },
      { id: 'tachiai', name: '立ち会い', glossary: 'tachiai' },
      { id: 'trouble', name: '境界トラブル' },
    ],
  },
  {
    id: 'tochi',
    title: '土地の問題',
    tags: [
      { id: 'souzoku', name: '相続' },
      { id: 'kyoyu', name: '共有', glossary: 'kyoyu' },
      { id: 'fumei', name: '所有者不明土地', glossary: 'fumei' },
      { id: 'shinrin', name: '森林' },
    ],
  },
  {
    id: 'shikaku',
    title: '試験・資格',
    tags: [{ id: 'shiken', name: '土地家屋調査士試験', glossary: 'chousashi' }],
  },
  {
    id: 'sonota',
    title: 'その他',
    tags: [{ id: 'jichitai', name: '自治体' }],
  },
] as const;

export type TagName = (typeof TAG_GROUPS)[number]['tags'][number]['name'];
export type Tag = { id: string; name: string; glossary?: string; group: string };

export const TAGS: Tag[] = TAG_GROUPS.flatMap((g) => g.tags.map((t) => ({ ...t, group: g.title })));
export const TAG_NAMES = TAGS.map((t) => t.name) as [TagName, ...TagName[]];

export function tagByName(name: string) {
  const t = TAGS.find((x) => x.name === name);
  if (!t) throw new Error(`タグ「${name}」は src/data/tags.ts にありません`);
  return t;
}
export const tagHref = (name: string) => `/tags/${tagByName(name).id}/`;
