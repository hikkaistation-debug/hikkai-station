// 条文の穴埋め練習（便利ツール「穴埋め練習」 /tools/anaume/）のデータ
// ・条文は e-Gov 法令検索の原文のとおりに書く（2026-11-05 に API で取得して確認）。法令の条文は著作権の対象外（著作権法13条1号）。
// ・{{ }} で囲んだところが空欄になる。（略）は、このサイトで省いた部分（かっこ書きなど）。
// ・条文を足すときも、必ず e-Gov の原文で確かめてから書く。法改正があったら直す。
// 法律の名前と e-Gov の番号（hourei.ts に頼らず、このファイルだけで完結させる）
const LAWS = {
  chousashiho: { name: '土地家屋調査士法', id: '325AC1000000228' },
  fudosantokiho: { name: '不動産登記法', id: '416AC0000000123' },
} as const;
type LawKey = keyof typeof LAWS;

export type Anaume = {
  id: string; // 保存用のキー（変えない）
  law: LawKey;
  article: string; // 表示用（例：14条1項・4項）
  anchor: string; // e-Gov の条の番号（リンク用）
  heading: string; // 見出し
  text: string; // {{ }} が空欄
  checkedDate: string;
};

export const ANAUME: Anaume[] = [
  // ---------- 土地家屋調査士法 ----------
  {
    id: 'c1',
    law: 'chousashiho', article: '1条', anchor: '1', heading: '土地家屋調査士の使命',
    text: '土地家屋調査士（以下「調査士」という。）は、不動産の{{表示に関する登記}}及び土地の{{筆界}}（略）を明らかにする業務の専門家として、不動産に関する{{権利の明確化}}に寄与し、もつて{{国民生活の安定と向上}}に資することを使命とする。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'c2',
    law: 'chousashiho', article: '2条', anchor: '2', heading: '職責',
    text: '調査士は、常に{{品位}}を保持し、業務に関する{{法令及び実務}}に精通して、{{公正かつ誠実}}にその業務を行わなければならない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'c3',
    law: 'chousashiho', article: '3条1項（1号・2号・4号・6号）', anchor: '3', heading: '業務',
    text: '調査士は、{{他人の依頼}}を受けて、次に掲げる事務を行うことを業とする。\n一　不動産の表示に関する登記について必要な土地又は家屋に関する{{調査又は測量}}\n二　不動産の表示に関する登記の{{申請手続}}又はこれに関する審査請求の手続についての代理\n四　{{筆界特定}}の手続（略）についての代理\n六　前各号に掲げる事務についての{{相談}}',
    checkedDate: '2026-11-05',
  },
  {
    id: 'c4',
    law: 'chousashiho', article: '4条', anchor: '4', heading: '資格',
    text: '次の各号のいずれかに該当する者は、調査士となる資格を有する。\n一　土地家屋調査士試験に{{合格}}した者\n二　法務局又は地方法務局において不動産の表示に関する登記の事務に従事した期間が通算して{{十年以上}}になる者であつて、{{法務大臣}}が前条第一項第一号から第六号までに規定する業務を行うのに必要な知識及び技能を有すると認めたもの',
    checkedDate: '2026-11-05',
  },
  {
    id: 'c22',
    law: 'chousashiho', article: '22条', anchor: '22', heading: '依頼に応ずる義務',
    text: '調査士は、{{正当な事由}}がある場合でなければ、依頼（略）を{{拒んではならない}}。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'c23',
    law: 'chousashiho', article: '23条', anchor: '23', heading: '虚偽の調査、測量の禁止',
    text: '調査士は、その業務に関して{{虚偽}}の{{調査又は測量}}をしてはならない。',
    checkedDate: '2026-11-05',
  },

  // ---------- 不動産登記法 ----------
  {
    id: 'f14a',
    law: 'fudosantokiho', article: '14条1項・4項', anchor: '14', heading: '地図等',
    text: '1　登記所には、{{地図}}及び{{建物所在図}}を備え付けるものとする。\n4　第一項の規定にかかわらず、登記所には、同項の規定により地図が備え付けられるまでの間、これに代えて、{{地図に準ずる図面}}を備え付けることができる。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f14b',
    law: 'fudosantokiho', article: '14条2項・5項', anchor: '14', heading: '地図等',
    text: '2　前項の地図は、一筆又は二筆以上の土地ごとに作成し、各土地の{{区画}}を明確にし、{{地番}}を表示するものとする。\n5　前項の地図に準ずる図面は、一筆又は二筆以上の土地ごとに土地の{{位置、形状}}及び地番を表示するものとする。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f34',
    law: 'fudosantokiho', article: '34条1項', anchor: '34', heading: '土地の表示に関する登記の登記事項',
    text: '土地の表示に関する登記の登記事項は、第二十七条各号に掲げるもののほか、次のとおりとする。\n一　土地の所在する市、区、郡、町、村及び{{字}}\n二　{{地番}}\n三　{{地目}}\n四　{{地積}}',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f36',
    law: 'fudosantokiho', article: '36条', anchor: '36', heading: '土地の表題登記の申請',
    text: '{{新たに生じた土地}}又は表題登記がない土地の所有権を取得した者は、その所有権の取得の日から{{一月以内}}に、{{表題登記}}を申請しなければならない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f37',
    law: 'fudosantokiho', article: '37条1項', anchor: '37', heading: '地目又は地積の変更の登記の申請',
    text: '{{地目又は地積}}について変更があったときは、{{表題部所有者又は所有権の登記名義人}}は、その変更があった日から{{一月以内}}に、当該地目又は地積に関する変更の登記を申請しなければならない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f39',
    law: 'fudosantokiho', article: '39条1項', anchor: '39', heading: '分筆又は合筆の登記',
    text: '{{分筆又は合筆}}の登記は、{{表題部所有者又は所有権の登記名義人以外の者}}は、申請することができない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f42',
    law: 'fudosantokiho', article: '42条', anchor: '42', heading: '土地の滅失の登記の申請',
    text: '土地が{{滅失}}したときは、表題部所有者又は所有権の登記名義人は、その滅失の日から{{一月以内}}に、当該土地の滅失の登記を申請しなければならない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f47',
    law: 'fudosantokiho', article: '47条1項', anchor: '47', heading: '建物の表題登記の申請',
    text: '{{新築}}した建物又は{{区分建物以外}}の表題登記がない建物の所有権を取得した者は、その所有権の取得の日から{{一月以内}}に、表題登記を申請しなければならない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f57',
    law: 'fudosantokiho', article: '57条', anchor: '57', heading: '建物の滅失の登記の申請',
    text: '建物が滅失したときは、表題部所有者又は所有権の登記名義人（略）は、その{{滅失の日}}から{{一月以内}}に、当該建物の滅失の登記を申請しなければならない。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f123a',
    law: 'fudosantokiho', article: '123条1号', anchor: '123', heading: '定義（筆界）',
    text: '筆界　表題登記がある一筆の土地（以下単に「一筆の土地」という。）とこれに隣接する他の土地（表題登記がない土地を含む。以下同じ。）との間において、当該一筆の土地が{{登記された時}}にその境を構成するものとされた{{二以上の点}}及びこれらを結ぶ{{直線}}をいう。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f123b',
    law: 'fudosantokiho', article: '123条2号', anchor: '123', heading: '定義（筆界特定）',
    text: '筆界特定　一筆の土地及びこれに隣接する他の土地について、この章の定めるところにより、筆界の{{現地における位置}}を特定すること（その位置を特定することができないときは、その{{位置の範囲}}を特定すること）をいう。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f131',
    law: 'fudosantokiho', article: '131条1項', anchor: '131', heading: '筆界特定の申請',
    text: '土地の{{所有権登記名義人等}}は、{{筆界特定登記官}}に対し、当該土地とこれに隣接する他の土地との筆界について、筆界特定の申請をすることができる。',
    checkedDate: '2026-11-05',
  },
  {
    id: 'f132',
    law: 'fudosantokiho', article: '132条1項5号', anchor: '132', heading: '申請の却下',
    text: '（筆界特定登記官は、次に掲げる場合には、理由を付した決定で、筆界特定の申請を{{却下}}しなければならない。）\n五　申請が対象土地の{{所有権の境界}}の特定その他筆界特定以外の事項を目的とするものと認められるとき。',
    checkedDate: '2026-11-05',
  },
];

export const anaumeLawName = (a: Anaume) => LAWS[a.law].name;
export const anaumeUrl = (a: Anaume) => `https://laws.e-gov.go.jp/law/${LAWS[a.law].id}#Mp-At_${a.anchor}`;

// {{ }} を区切って、[文字, 空欄, 文字, …] に分ける
export function splitAnaume(text: string): { type: 'text' | 'blank'; value: string }[] {
  const out: { type: 'text' | 'blank'; value: string }[] = [];
  const re = /\{\{(.+?)\}\}/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ type: 'text', value: text.slice(last, m.index) });
    out.push({ type: 'blank', value: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}
