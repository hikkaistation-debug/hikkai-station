// 用語さくいん（逆引き案内所で使います）
// 言葉を増やすときは、この一覧に足してください。並びは「よみ」の五十音順に自動でそろいます。
//   id      : ページ内のしるし（半角英数字）
//   term    : 言葉
//   yomi    : よみ（ひらがな）
//   desc    : ひとことの説明（自分の言葉で）
//   related : 関連する記事のアドレス（任意）
export type Term = { id: string; term: string; yomi: string; desc: string; related?: { label: string; href: string }[] };

const RAW: Term[] = [
  { id: 'fude', term: '筆（ふで）', yomi: 'ふで', desc: '土地を数える単位です。登記の上の1つの土地を「1筆（いっぴつ）」と数えます。',
    related: [{ label: '「筆界」と「所有権の境」はちがうもの？', href: '/articles/hikkai-to-shoyukenkai/' }] },
  { id: 'hikkai', term: '筆界', yomi: 'ひっかい', desc: '土地が登記されたときに決まった、隣の土地との公的な境目です。持ち主どうしの話し合いでは動かせません。',
    related: [{ label: '「筆界」と「所有権の境」はちがうもの？', href: '/articles/hikkai-to-shoyukenkai/' }] },
  { id: 'shoyuken', term: '所有権の境', yomi: 'しょゆうけんのさかい', desc: '「どこまでがだれの持ち物か」の境目です。売買や持ち主どうしの約束で変わることがあり、筆界とずれる場合があります。',
    related: [{ label: '「筆界」と「所有権の境」はちがうもの？', href: '/articles/hikkai-to-shoyukenkai/' }] },
  { id: 'kyokaihyo', term: '境界標', yomi: 'きょうかいひょう', desc: '土地の角などに入れる、境目の目印です。コンクリートの杭、金属のプレートや鋲（びょう）などがあります。',
    related: [{ label: '実家の「境界」と「越境」、年内に確認しておきたいポイント', href: '/articles/kyokai-ekkyo-nennai-check/' }] },
  { id: 'chiban', term: '地番', yomi: 'ちばん', desc: '登記所が土地1筆ごとにつける番号です。郵便などで使う住所（住居表示）とは別の番号になっていることが多いです。' },
  { id: 'chimoku', term: '地目', yomi: 'ちもく', desc: '土地の使い方による区分です。宅地・田・畑・山林などがあり、登記に記録されます。' },
  { id: 'chiseki', term: '地積', yomi: 'ちせき', desc: '登記に記録されている土地の面積です。実際に測った面積と違うこともあります。' },
  { id: 'bunpitsu', term: '分筆', yomi: 'ぶんぴつ', desc: '1つの土地を、登記の上で2つ以上に分けることです。土地の一部を売るときなどに行います。測量が必要です。',
    related: [{ label: '「筆界」と「所有権の境」はちがうもの？（分筆の図あり）', href: '/articles/hikkai-to-shoyukenkai/' }] },
  { id: 'gappitsu', term: '合筆', yomi: 'がっぴつ', desc: '隣り合った複数の土地を、登記の上で1つにまとめることです。まとめると、その間の筆界はなくなります。' },
  { id: 'kouzu', term: '公図', yomi: 'こうず', desc: '法務局にある図面のうち、「地図に準ずる図面」として置かれている古い図面の通称です。土地のおおよその位置や形を知る手がかりになりますが、正確さには限りがあります。',
    related: [{ label: '法務局の「地図」と「地図に準ずる図面」', href: '/articles/14jou-chizu/' }] },
  { id: 'chizu14', term: '14条地図', yomi: 'じゅうよんじょうちず', desc: '不動産登記法14条1項にもとづいて法務局に置かれる、精度の高い測量で作られた地図です。',
    related: [{ label: '法務局の「地図」と「地図に準ずる図面」', href: '/articles/14jou-chizu/' }] },
  { id: 'sokuryozu', term: '地積測量図', yomi: 'ちせきそくりょうず', desc: '分筆などの登記のときに法務局に出される、土地の形や面積を測った図面です。法務局で写しを取ることができます。' },
  { id: 'hyoji', term: '表示に関する登記', yomi: 'ひょうじにかんするとうき', desc: '土地や建物の場所・形・面積・種類など、「もの」としての状態を記録する登記です。土地家屋調査士が専門としています。' },
  { id: 'kenri', term: '権利に関する登記', yomi: 'けんりにかんするとうき', desc: '所有権や抵当権など、「だれの権利か」を記録する登記です。相続登記もこの一つで、司法書士が専門としています。' },
  { id: 'shomeisho', term: '登記事項証明書', yomi: 'とうきじこうしょうめいしょ', desc: '登記の内容を証明する書面です。いわゆる「登記簿謄本」のことで、法務局で取ることができます。' },
  { id: 'tokutei', term: '筆界特定制度', yomi: 'ひっかいとくていせいど', desc: '法務局の筆界特定登記官が、専門家の意見をふまえて筆界の位置を調べて示す制度です。位置をはっきり示せず、範囲で示されることもあります。',
    related: [{ label: '裁判をしなくても使える「筆界特定制度」のしくみ', href: '/articles/hikkai-tokutei-seido/' }] },
  { id: 'kakutei', term: '筆界確定訴訟', yomi: 'ひっかいかくていそしょう', desc: '裁判所に筆界を決めてもらう裁判です。筆界特定の結果に納得できないときにも使われます。',
    related: [{ label: '裁判をしなくても使える「筆界特定制度」のしくみ', href: '/articles/hikkai-tokutei-seido/' }] },
  { id: 'tachiai', term: '境界の立ち会い', yomi: 'きょうかいのたちあい', desc: '隣の土地の持ち主などと現地で一緒に境目を確認することです。測量や分筆の前に行うことが多いです。' },
  { id: 'kanmin', term: '官民境界', yomi: 'かんみんきょうかい', desc: '道路や水路など、国や市町村の土地と、個人や会社の土地との境目です。',
    related: [{ label: '久留米市、官民境界確定図のダウンロードと無人の情報交付機を開始', href: '/articles/kurume-kanmin-kyokai-download/' }] },
  { id: 'ekkyo', term: '越境', yomi: 'えっきょう', desc: '塀・建物・木の枝などが、境目を越えて隣の土地に出ていることです。',
    related: [{ label: '実家の「境界」と「越境」、年内に確認しておきたいポイント', href: '/articles/kyokai-ekkyo-nennai-check/' }] },
  { id: 'souzokutouki', term: '相続登記', yomi: 'そうぞくとうき', desc: '相続で受け継いだ土地や建物の名義を、相続した人に変える登記です。2024年4月から義務になりました。',
    related: [{ label: '相続登記の申請が義務になりました', href: '/articles/souzoku-touki-gimuka/' }] },
  { id: 'kokko', term: '相続土地国庫帰属制度', yomi: 'そうぞくとちこっこきぞくせいど', desc: '相続した土地を、一定の条件を満たせば国に引き取ってもらえる制度です。2023年4月に始まりました。',
    related: [{ label: 'いらない土地を国に引き取ってもらえる「相続土地国庫帰属制度」', href: '/articles/souzoku-tochi-kokko-kizoku/' }] },
  { id: 'fumei', term: '所有者不明土地', yomi: 'しょゆうしゃふめいとち', desc: '登記を見ても持ち主がわからない、または持ち主に連絡がつかない土地のことです。',
    related: [{ label: '共有者が59人に──相続登記をしないまま代替わりが続いた森林の例', href: '/articles/kyoyu-shinrin-souzoku/' }] },
  { id: 'kyoyu', term: '共有', yomi: 'きょうゆう', desc: '1つの土地を、複数の人で持っていることです。売るときなどに、ほかの共有者の同意が必要になります。',
    related: [{ label: '共有者が59人に──相続登記をしないまま代替わりが続いた森林の例', href: '/articles/kyoyu-shinrin-souzoku/' }] },
  { id: 'chousashi', term: '土地家屋調査士', yomi: 'とちかおくちょうさし', desc: '土地や建物の調査・測量をして、表示に関する登記の手続きを行う国家資格者です。境目の調査や分筆の相談先になります。',
    related: [{ label: '土地家屋調査士試験のしくみ', href: '/articles/shiken-shikumi/' }] },
  { id: 'shihoushoshi', term: '司法書士', yomi: 'しほうしょし', desc: '相続登記など、権利に関する登記の手続きを行う国家資格者です。' },
];

export const GLOSSARY = [...RAW].sort((a, b) => a.yomi.localeCompare(b.yomi, 'ja'));
