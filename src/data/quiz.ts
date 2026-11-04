// 駅のクイズの問題
// ・正解の根拠が条文ではっきり言えるものだけにする（basis に法令ナビの条文の id を書く。条文は e-Gov で確認済みのもの）
// ・難しすぎず、「なるほど」と思えるもの。解説は短く。
// ・draft: true の問題は、確認用画面（npm run dev）だけに出る。運営者のチェックが済んだら draft を消す。
// ・問題を足すときは、id を連番で（q21, q22 …）。一度公開した id は変えない（Xのリンクが切れるため）。
export type QuizLevel = 'general' | 'exam';
export const QUIZ_LEVELS: Record<QuizLevel, string> = { general: '一般向け', exam: '受験生向け' };

export type Quiz = {
  id: string;
  level: QuizLevel;
  q: string; // 問題文
  choices: string[]; // ○×なら ['○', '×']
  answer: number; // 正解の番号（0から）
  explain: string; // 解説
  basis: string[]; // 根拠：法令ナビの条文の id（src/data/hourei.ts）
  basisNote?: string; // 根拠の補足（何条何項何号か など）
  links?: { label: string; href: string }[]; // 関連する用語・記事・ツール
  draft?: boolean;
};

const OX = ['○', '×'];

export const QUIZZES: Quiz[] = [
  {
    id: 'q01', level: 'general',
    q: '隣の土地との「筆界」は、持ち主どうしが話し合って合意すれば、動かすことができる。',
    choices: OX, answer: 1,
    explain: '筆界は、土地が登記されたときに決まった公的な境目で、話し合いでは動かせません。話し合いで変えられるのは「どこまでがだれの物か」という所有権の境です。筆界を変えたいときは、分筆・合筆の登記をします。',
    basis: ['fudosantokiho-123'], basisNote: '不動産登記法123条1号（筆界の定義）',
    links: [{ label: '用語：筆界', href: '/annai/#g-hikkai' }, { label: '記事：「筆界」と「所有権の境」はちがうもの？', href: '/articles/hikkai-to-shoyukenkai/' }],
  },
  {
    id: 'q02', level: 'general',
    q: '登記できる「建物」と認められるための要件に、ふくまれないものはどれ？',
    choices: ['外気分断性（屋根と周りの壁がある）', '定着性（土地に固定されている）', '耐震性（地震に強い）'], answer: 2,
    explain: '建物と認められるには、屋根と周壁などがあり（外気分断性）、土地に定着していて（定着性）、目的の用途に使える状態にある（用途性）ことが必要です。耐震性は、登記の「建物」の要件ではありません。',
    basis: ['kisoku-111'], basisNote: '不動産登記規則111条',
    links: [{ label: '用語：外気分断性', href: '/annai/#g-gaiki' }],
  },
  {
    id: 'q03', level: 'general',
    q: '相続で土地を取得したことを知ったら、何年以内に相続登記を申請しなければならない？',
    choices: ['1年以内', '3年以内', '5年以内'], answer: 1,
    explain: '相続の開始と、所有権を取得したことを知った日から3年以内です。2024年4月1日から義務になりました。',
    basis: ['fudosantokiho-76-2'], basisNote: '不動産登記法76条の2第1項',
    links: [{ label: '用語：相続登記', href: '/annai/#g-souzokutouki' }],
  },
  {
    id: 'q04', level: 'general',
    q: '畑に家を建てたら、登記の地目は自動で「宅地」に変わる。',
    choices: OX, answer: 1,
    explain: '自動では変わりません。地目が変わったときは、持ち主が変更があった日から1か月以内に、地目の変更の登記を申請する必要があります（農地の場合は、農地法の手続きが別に必要なこともあります）。',
    basis: ['fudosantokiho-37'], basisNote: '不動産登記法37条1項',
    links: [{ label: '用語：地目', href: '/annai/#g-chimoku' }],
  },
  {
    id: 'q05', level: 'exam',
    q: '不動産登記規則で定められている地目は、全部でいくつ？',
    choices: ['9種類', '15種類', '23種類'], answer: 2,
    explain: '田・畑・宅地・山林・原野・公衆用道路・雑種地など、23種類です。地目は土地の主な用途によって決めます。',
    basis: ['kisoku-99'], basisNote: '不動産登記規則99条',
  },
  {
    id: 'q06', level: 'general',
    q: '筆界特定の制度を使えば、筆界の位置を必ず1本の線ではっきり示してもらえる。',
    choices: OX, answer: 1,
    explain: '筆界の位置を特定できないときは、「位置の範囲」で示されることがあります。必ず1本の線になるとは限りません。',
    basis: ['fudosantokiho-123'], basisNote: '不動産登記法123条2号（筆界特定の定義）',
    links: [{ label: '用語：筆界特定制度', href: '/annai/#g-tokutei' }],
  },
  {
    id: 'q07', level: 'general',
    q: '土地の持ち主（所有権の登記名義人）が引っ越して住所が変わったとき、住所の変更登記は何年以内に申請しなければならない？',
    choices: ['6か月以内', '1年以内', '2年以内'], answer: 2,
    explain: '変更があった日から2年以内です。2026年4月1日から義務になりました。',
    basis: ['fudosantokiho-76-5'], basisNote: '不動産登記法76条の5',
  },
  {
    id: 'q08', level: 'general',
    q: '建物を新築したとき、建物の表題登記（どんな建物かを記録する最初の登記）は、いつまでに申請する？',
    choices: ['1か月以内', '1年以内', '期限はない'], answer: 0,
    explain: '新築した建物の所有権を取得した日から1か月以内です。建物の表題登記は、土地家屋調査士が専門にしている登記です。',
    basis: ['fudosantokiho-47'], basisNote: '不動産登記法47条1項',
    links: [{ label: '用語：表示に関する登記', href: '/annai/#g-hyoji' }],
  },
  {
    id: 'q09', level: 'exam',
    q: '宅地の地積（登記の面積）は、どのけたまで記録される？',
    choices: ['1㎡まで', '0.01㎡まで', '0.001㎡まで'], answer: 1,
    explain: '宅地と鉱泉地は、1㎡の100分の1（0.01㎡）未満を切り捨てて記録します。',
    basis: ['kisoku-100'], basisNote: '不動産登記規則100条',
    links: [{ label: '座標から面積を計算', href: '/tools/zahyo-menseki/' }],
  },
  {
    id: 'q10', level: 'exam',
    q: '500㎡の山林の地積は、小数点以下（1㎡未満）まで登記される。',
    choices: OX, answer: 1,
    explain: '宅地・鉱泉地以外の土地で10㎡を超えるものは、1㎡未満を切り捨てます。500㎡の山林なら、1㎡単位で記録されます。',
    basis: ['kisoku-100'], basisNote: '不動産登記規則100条',
  },
  {
    id: 'q11', level: 'general',
    q: '土地を分ける「分筆」の登記は、その土地を買いたい人でも申請できる。',
    choices: OX, answer: 1,
    explain: '分筆・合筆の登記を申請できるのは、表題部所有者か所有権の登記名義人だけです。買いたい人が自分で申請することはできません。',
    basis: ['fudosantokiho-39'], basisNote: '不動産登記法39条1項',
    links: [{ label: '用語：分筆', href: '/annai/#g-bunpitsu' }],
  },
  {
    id: 'q12', level: 'general',
    q: '遺産分割の話し合いがまとまらなくても、期限内に「相続人申告登記」をすれば、相続登記の申請義務を果たしたことになる。',
    choices: OX, answer: 0,
    explain: '期限内に「自分が相続人である」と登記官に申し出れば、申請の義務を果たしたものとみなされます。ただし、そのあと遺産分割で取得したときは、分割の日から3年以内に登記の申請が必要です。',
    basis: ['fudosantokiho-76-3'], basisNote: '不動産登記法76条の3第2項・第4項',
  },
  {
    id: 'q13', level: 'general',
    q: '正当な理由がないのに相続登記の申請を怠ると、いくら以下の過料の対象になる？',
    choices: ['5万円以下', '10万円以下', '50万円以下'], answer: 1,
    explain: '10万円以下の過料です。「過料」は刑罰ではなく、行政上のペナルティです。',
    basis: ['fudosantokiho-164'], basisNote: '不動産登記法164条1項',
  },
  {
    id: 'q14', level: 'exam',
    q: '正当な理由がないのに住所等の変更登記の申請を怠ったときの過料は？',
    choices: ['5万円以下', '10万円以下', '過料はない'], answer: 0,
    explain: '住所等の変更登記は5万円以下の過料です。相続登記や表題登記など（10万円以下）とは金額がちがいます。',
    basis: ['fudosantokiho-164'], basisNote: '不動産登記法164条2項',
  },
  {
    id: 'q15', level: 'exam',
    q: '14条1項地図がまだない地域で、地図の代わりに法務局に置かれている図面は、不動産登記法で何とよばれている？',
    choices: ['地積測量図', '地図に準ずる図面', '建物所在図'], answer: 1,
    explain: '「地図に準ずる図面」です。いわゆる「公図」の多くがこれにあたり、土地のおおよその位置や形を知る手がかりになりますが、正確さには限りがあります。',
    basis: ['fudosantokiho-14'], basisNote: '不動産登記法14条4項',
    links: [{ label: '用語：公図', href: '/annai/#g-kouzu' }],
  },
  {
    id: 'q16', level: 'exam',
    q: '地積測量図は、原則としてどの縮尺で作る？',
    choices: ['100分の1', '250分の1', '500分の1'], answer: 1,
    explain: '原則は250分の1です。土地の状況などによって、それが適当でないときは別の縮尺にできます。',
    basis: ['kisoku-77'], basisNote: '不動産登記規則77条4項',
    links: [{ label: '用語：地積測量図', href: '/annai/#g-sokuryozu' }],
  },
  {
    id: 'q17', level: 'general',
    q: '筆界特定を申請すれば、「どこまでが自分の物か」という所有権の境目も決めてもらえる。',
    choices: OX, answer: 1,
    explain: '筆界特定は、公的な境目である「筆界」の位置を調べる制度です。所有権の境の特定を目的とする申請は、却下されます。所有権の争いは、弁護士に相談してください。',
    basis: ['fudosantokiho-132', 'fudosantokiho-123'], basisNote: '不動産登記法132条1項5号',
  },
  {
    id: 'q18', level: 'exam',
    q: '市街地地域の地図（14条1項地図）を作るときに求められる精度区分は？',
    choices: ['甲二まで', '乙一まで', '乙三まで'], answer: 0,
    explain: '市街地地域は甲二まで、村落・農耕地域は乙一まで、山林・原野地域は乙三までです。地積測量図にも準用されます。',
    basis: ['kisoku-10', 'kokuchorei-beppyo4'], basisNote: '不動産登記規則10条4項（77条5項で地積測量図に準用）',
    links: [{ label: '公差の計算ツール', href: '/tools/kousa/' }],
  },
  {
    id: 'q19', level: 'exam',
    q: '土地の地目は、何によって決める？',
    choices: ['土地の主な用途', '土地の面積', '持ち主の希望'], answer: 0,
    explain: '地目は、土地の主な用途によって決めます。たとえば、家が建っていて住まいとして使っていれば「宅地」です。',
    basis: ['kisoku-99'], basisNote: '不動産登記規則99条',
  },
  {
    id: 'q20', level: 'general',
    q: '坂になっている土地の地積は、斜面にそって測った面積で登記される。',
    choices: OX, answer: 1,
    explain: '地積は「水平投影面積」、つまり真上から見た面積で決めます。斜面にそって測ると、実際より広くなってしまうからです。',
    basis: ['kisoku-100'], basisNote: '不動産登記規則100条',
  },
];

// 本番では、チェック済み（draft でない）の問題だけ
export const getQuizzes = () => QUIZZES.filter((q) => !q.draft || import.meta.env.DEV);
