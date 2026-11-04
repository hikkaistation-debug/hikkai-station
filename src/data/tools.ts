// 計算ツールの一覧（駅の施設「計算ツール」）
// ツールを増やしたら、ここに1行足してください。トップの一覧と、各ツールの駅名標に使います。
export type Tool = {
  id: string; // アドレス（/tools/○○/）
  name: string;
  short: string; // 駅名標の「となりの駅」などに使う短い名前
  desc: string;
  who: string; // だれ向けか
};

export const TOOLS: Tool[] = [
  {
    id: 'tsubo',
    name: '坪・平方メートル換算',
    short: '坪⇔㎡',
    desc: '坪と平方メートル（㎡）を相互に換算します。畝（せ）・反（たん）・町（ちょう）、アール・ヘクタールにも対応しています。',
    who: 'どなたでも',
  },
  {
    id: 'zahyo-menseki',
    name: '座標から面積を計算（座標法）',
    short: '座標面積',
    desc: '筆界点の座標（X・Y）から、面積・倍面積・辺の長さを計算し、求積表の形で表示します。',
    who: '実務者・受験生',
  },
  {
    id: 'kousa',
    name: '公差の計算（地積・距離）',
    short: '公差',
    desc: '国土調査法施行令 別表第四の精度区分（甲一〜乙三）にもとづいて、地積測定の公差と、筆界点間の距離の公差を計算します。',
    who: '実務者・受験生',
  },
];

export const toolHref = (id: string) => `/tools/${id}/`;
export const TOOLS_TOP = { label: '計算ツール', href: '/tools/' };
