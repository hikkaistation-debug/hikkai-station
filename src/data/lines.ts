// カテゴリ ＝「路線」の一覧
// 新しいカテゴリを増やすときは、この一覧に1行足すだけでOKです。
//   id     : 記事のMarkdownの category: に書く名前（半角英字）
//   name   : 表示名
//   code   : 駅ナンバリング風の記号（アルファベット1文字）
//   mark   : 色が見分けにくい人のための形の記号
//   color  : 路線カラー（色だけに頼らず、code と mark も必ず一緒に表示します）
//   isKiso : true なら「基礎解説」コーナーに並びます
export const LINES = [
  { id: 'kyokai', name: '境界について', short: '境界', code: 'K', mark: '▲', color: '#c4122f', isKiso: false },
  { id: 'toki', name: '登記について', short: '登記', code: 'R', mark: '▼', color: '#0a7d3e', isKiso: false },
  { id: 'sokuryo', name: '測量実務について', short: '測量', code: 'G', mark: '■', color: '#b45309', isKiso: false },
  { id: 'kiki', name: '測量ツールについて', short: 'ツール', code: 'E', mark: '●', color: '#be185d', isKiso: false },
  { id: 'seido', name: '制度・法改正について', short: '制度', code: 'H', mark: '◆', color: '#0b62b4', isKiso: false },
  { id: 'shiken', name: '調査士試験について', short: '調査士試験', code: 'T', mark: '◎', color: '#0f766e', isKiso: false },
  { id: 'kiso', name: '基礎解説', short: '基礎', code: 'B', mark: '★', color: '#6d28a8', isKiso: true },
] as const;

export type LineId = (typeof LINES)[number]['id'];

export const LINE_IDS = LINES.map((l) => l.id) as [LineId, ...LineId[]];

export function getLine(id: string) {
  const line = LINES.find((l) => l.id === id);
  if (!line) throw new Error(`カテゴリ「${id}」は src/data/lines.ts にありません`);
  return line;
}

// 対象バッジ（読者のレベル）
export const LEVELS = {
  easy: { label: 'やさしい', note: '一般向け' },
  normal: { label: 'ふつう', note: '' },
  expert: { label: '専門', note: '実務者向け' },
} as const;

export type LevelId = keyof typeof LEVELS;
