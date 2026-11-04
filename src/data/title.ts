// タイトルを「見出し」と「2行目」に分ける（画面で2行にして読みやすくするため）
// 分ける場所（最初に見つかったもの）：
//   1. 「？」のあとに続きがあるとき → 「？」までが1行目
//   2. 「―」「──」があるとき → その前が1行目、うしろが2行目（線は消す）
//   3. 最後が「（…）」のとき → かっこの前が1行目、かっこが2行目
// どれにも当てはまらないときは、1行のまま。ページの <title> やSNSでは元のタイトルをそのまま使う。
export function splitTitle(title: string): [string] | [string, string] {
  const q = title.indexOf('？');
  if (q !== -1 && q < title.length - 1) {
    const rest = title.slice(q + 1).trim();
    if (rest) return [title.slice(0, q + 1), rest];
  }
  const dash = title.match(/\s*(?:──|―)\s*/);
  if (dash && dash.index && dash.index > 0) {
    const rest = title.slice(dash.index + dash[0].length).trim();
    if (rest) return [title.slice(0, dash.index).trim(), rest];
  }
  const paren = title.match(/^(.+?)(（[^（）]+）)$/);
  if (paren) return [paren[1], paren[2]];
  return [title];
}
