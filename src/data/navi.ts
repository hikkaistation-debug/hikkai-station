// 法令ナビ・通達ナビで共通に使う「分野」の一覧
// 細かく分けて、探しやすくしています。分野を足すときは、ここに1行足してください（並び順＝ボタンの順）。
export const NAVI_FIELD_GROUPS = [
  { title: '境界・図面', fields: ['筆界・境界', '筆界特定', '地図・公図', '地積測量図', '測量・公差'] },
  { title: '土地の登記', fields: ['土地の表示登記', '地目', '地積', '分筆・合筆'] },
  { title: '建物の登記', fields: ['建物の表示登記', '建物の認定', '建物の種類・床面積'] },
  { title: '相続・名義', fields: ['相続登記', '相続人申告登記', '住所・氏名の変更登記', '職権による登記'] },
  { title: 'そのほか', fields: ['申請の期限・過料', '登記官の調査', '登記事務全般'] },
] as const;

export type NaviField = (typeof NAVI_FIELD_GROUPS)[number]['fields'][number];
export const NAVI_FIELDS: NaviField[] = NAVI_FIELD_GROUPS.flatMap((g) => [...g.fields]);
