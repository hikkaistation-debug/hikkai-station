// 便利ツールの一覧（駅の施設「便利ツール」。2026-11-05 に「計算ツール」から名前を変えた）
// ツールを増やしたら、ここに1行足してください。トップの一覧と、各ツールの駅名標に使います。
export type ToolGroupId = 'keisan' | 'shiraberu' | 'benkyou';

export type Tool = {
  id: string; // アドレス（/tools/○○/）
  name: string;
  short: string; // 駅名標の「となりの駅」などに使う短い名前
  desc: string;
  who: string; // だれ向けか
  group: ToolGroupId; // 一覧での分け方（計算する／調べる・診断する／勉強する）
};

// 一覧ページの分け方。/tools/ の外にあるページ（境界トラブル診断など）は extra に書く。
export const TOOL_GROUPS: {
  id: ToolGroupId;
  label: string;
  extra?: { name: string; href: string; desc: string; who: string }[];
}[] = [
  { id: 'keisan', label: '計算する' },
  {
    id: 'shiraberu',
    label: '調べる・診断する',
    extra: [
      {
        name: '境界トラブル診断',
        href: '/shindan/',
        desc: 'いくつかの質問に答えると、境界の困りごとをどこに相談すればよいか（土地家屋調査士・法務局・弁護士など）の目安がわかります。',
        who: 'どなたでも',
      },
    ],
  },
  { id: 'benkyou', label: '勉強する' },
];

export const TOOLS: Tool[] = [
  {
    id: 'tsubo',
    name: '坪・平方メートル換算',
    short: '坪⇔㎡',
    desc: '坪と平方メートル（㎡）を相互に換算します。畝（せ）・反（たん）・町（ちょう）、アール・ヘクタールにも対応しています。',
    who: 'どなたでも',
    group: 'keisan',
  },
  {
    id: 'zahyo-menseki',
    name: '座標から面積を計算（座標法）',
    short: '座標面積',
    desc: '筆界点の座標（X・Y）から、面積・倍面積・辺の長さを計算し、求積表の形で表示します。',
    who: '実務者・受験生',
    group: 'keisan',
  },
  {
    id: 'kousa',
    name: '公差の計算（地積・距離）',
    short: '公差',
    desc: '国土調査法施行令 別表第四の精度区分（甲一〜乙三）にもとづいて、地積測定の公差と、筆界点間の距離の公差を計算します。',
    who: '実務者・受験生',
    group: 'keisan',
  },
  {
    id: 'sim',
    name: '地積測量図からSIMデータを作る（OCR）',
    short: '測量図→SIM',
    desc: '地積測量図のPDF・画像の座標求積表を文字読み取り（OCR）で表にし、面積の検算をしてから、SIMA形式（.sim）で保存します。ファイルはパソコンの中だけで処理し、どこにも送りません。',
    who: '実務者',
    group: 'keisan',
  },
  {
    id: 'benkyou',
    name: '勉強プランナー（土地家屋調査士試験）',
    short: '勉強プランナー',
    desc: '試験日までの残り日数と、平日・休日の勉強時間から、目標の勉強時間に届くかを計算します。過去問（令和3〜7年度）のチェック表つき。入力はブラウザの中だけに保存されます。',
    who: '受験生',
    group: 'benkyou',
  },
  {
    id: 'sakuzu',
    name: '作図の練習（座標から図をかく）',
    short: '作図の練習',
    desc: '点の座標と土地ごとの点の順番を入れると、縮尺どおりの図・辺の長さ・面積（座標法）を表示します。分筆のように複数の土地も描けて、A4に印刷できます。試験の作図の答え合わせに。',
    who: '受験生',
    group: 'benkyou',
  },
  {
    id: 'anaume',
    name: '条文の穴埋め練習（土地家屋調査士試験）',
    short: '穴埋め練習',
    desc: '土地家屋調査士法・不動産登記法の大事な条文を、穴埋めで覚えます。空欄を押すと答えが出て、「覚えた」の印も付けられます。条文は e-Gov の原文どおり。',
    who: '受験生',
    group: 'benkyou',
  },
];

export const toolHref = (id: string) => `/tools/${id}/`;
export const TOOLS_TOP = { label: '便利ツール', href: '/tools/' };
// 一覧ページの名前の下に出す短い説明
export const TOOLS_LEAD = '面積の計算・公差・境界トラブルの診断・勉強の計画など';
