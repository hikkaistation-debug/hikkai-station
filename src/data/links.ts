// リンク集のデータ（このファイルだけで追加・修正できます）
// 1件ごとに { } で囲んで並べます。説明は自分の言葉で書き、他サイトの文章は写さないこと。
// ロゴや画像は使いません（文字のリンクだけ）。

export const LINK_CATEGORIES = ['地図・GIS', '登記・資料の取得', '法令・制度', '測量・技術', '資格・試験', '相談先'] as const;
export const LINK_KINDS = ['公式', 'ツール', '資料', 'ブログ'] as const;
export const LINK_AUDIENCES = ['一般', '実務者'] as const;
export const LINK_PRICES = ['無料', '一部有料', '有料'] as const;

export type LinkItem = {
  name: string; // 名前
  url: string; // アドレス
  desc: string; // 説明（自分の言葉で。1〜2文）
  category: (typeof LINK_CATEGORIES)[number]; // カテゴリ
  audience: (typeof LINK_AUDIENCES)[number][]; // 対象（一般・実務者のどちらか、または両方）
  kind: (typeof LINK_KINDS)[number]; // 種類
  price: (typeof LINK_PRICES)[number]; // 料金
  checked: string; // 最終確認日（YYYY-MM-DD）
  note?: string; // ひとこと（任意。このサイトからの補足）
  related?: { label: string; href: string }; // 関連する記事（任意）
};

export const LINKS: LinkItem[] = [
  // ---------- 地図・GIS ----------
  {
    name: 'open-hinata3',
    url: 'https://kenzkenz.xsrv.jp/open-hinata3/',
    desc: 'ブラウザで使える地図ツール（WebGIS）です。法務局の登記所備付地図のデータや、自治体が公開している地番図などを、航空写真や地形図に重ねて見られます。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: 'ツール',
    price: '一部有料',
    checked: '2026-11-04',
    note: '個人が開発・運営しているツールです。基本の機能は無料で、一部の機能は有料です。表示した画面はURLで共有できます。使い方は「open-hinata3 逆引き辞典」が参考になります。',
  },
  {
    name: '地図ポスト',
    url: 'https://chizupost.com/',
    desc: '全国の公図（登記所備付地図）や市町村の地番図を、ブラウザで見られる無料の地図ツールです。都道府県・市町村・地番から土地を探したり、航空写真や昔の写真に重ねたりできます。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: 'ツール',
    price: '無料',
    checked: '2026-11-04',
    note: '基準点の表示や、面積の計算、SIMA・DXFなどの形式での書き出しもでき、実務でも使える機能がそろっています。表示される公図の位置は、もとの図面の精度によってずれることがあります。',
  },
  {
    name: '今ここ何番地？',
    url: 'https://office-shirado.com/imakoko/',
    desc: '法務省の地図（登記所備付地図のデータ）と空中写真などを重ねて見られる、軽くてシンプルなWeb地図です。事務所でも現地でも、ブラウザですぐに使えます。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: 'ツール',
    price: '一部有料',
    checked: '2026-11-06',
    note: 'オフィス白土が提供しています。登録なしで無料で使え、地番検索などは有料プランのメンバー向けの機能です。地図は現地と合わないことがあるので、最新の公図は法務局で確かめましょう。特定の会社をおすすめするものではありません。',
  },
  {
    name: '全国地番マップ',
    url: 'https://chiban.koaza.net/',
    desc: '法務省の地図（登記所備付地図のデータ）と市町村の地番図を、全国まとめて地図の上で見られるWeb地図です。筆（1つの土地）をクリックすると、所在と地番がわかります。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: 'ツール',
    price: '一部有料',
    checked: '2026-11-06',
    note: '日本小字地名地籍編纂刊行会が運営しています。地図を見る・地番を確かめるところまでは登録なしの無料で、地番検索や面積の計測、SIMA・DXFなどの書き出しは有料プランの機能です。用途地域やハザードマップ、小字（こあざ）の地図も重ねられます。表示される区画は測量の成果ではないので、正式な確認は法務局でしましょう。特定の団体をおすすめするものではありません。',
  },
  {
    name: 'ラズリマップ',
    url: 'https://lazurimap.com/',
    desc: '住所や地番から土地を探し、地図を拡大すると筆界（土地の区画の線）が表示されるWeb地図です。地積測量図を読み込んだり、SIMA・JWWの図面を地図に重ねたりもできます。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: 'ツール',
    price: '無料',
    checked: '2026-11-06',
    note: '株式会社ラズリが提供しています。地図を見るのは登録なしで使えます。ログインして使う機能もあるので、くわしくは公式サイトで確かめてください。表示される区画は測量の成果ではないので、正式な確認は法務局でしましょう。特定の会社をおすすめするものではありません。',
  },
  {
    name: '地理院地図',
    url: 'https://maps.gsi.go.jp/',
    desc: '国土地理院の地図サイトです。地形図・航空写真・昔の写真などを切り替えて見られ、標高や断面も調べられます。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-04',
  },
  {
    name: 'G空間情報センター（登記所備付地図データ）',
    url: 'https://front.geospatial.jp/moj-chizu-xml-readme/moj-chizu-shp-download/',
    desc: '法務省が公開している登記所備付地図のデータを、GISで扱いやすい形式（GeoJSON・シェープファイル）に変換したものをダウンロードできます。',
    category: '地図・GIS',
    audience: ['実務者'],
    kind: '資料',
    price: '無料',
    checked: '2026-11-04',
    note: 'データの読み込みにはGISソフトが必要です。地図に準ずる図面（公図）のデータには、位置がずれているものもあります。',
    related: { label: '法務局の「14条1項地図」と「地図に準ずる図面」', href: '/articles/14jou-chizu/' },
  },
  {
    name: 'PLATEAU VIEW',
    url: 'https://plateauview.mlit.go.jp/',
    desc: '国土交通省の3D都市モデル（PLATEAU）を、ブラウザで立体的に見られるサイトです。',
    category: '地図・GIS',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-04',
  },

  // ---------- 登記・資料の取得 ----------
  {
    name: '登記・供託オンライン申請システム',
    url: 'https://www.touki-kyoutaku-online.moj.go.jp/',
    desc: '法務省のシステムです。登記事項証明書や地図・図面の証明書をインターネットで請求し、郵送や窓口で受け取れます。',
    category: '登記・資料の取得',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '有料',
    checked: '2026-11-04',
    related: { label: '法務局で取れる土地の資料まとめ', href: '/articles/houmukyoku-shiryou/' },
  },
  {
    name: '登記情報提供サービス',
    url: 'https://www1.touki.or.jp/',
    desc: '登記簿や公図・地積測量図の内容を、インターネットですぐに見られるサービスです。証明書としては使えません。',
    category: '登記・資料の取得',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '有料',
    checked: '2026-11-04',
  },

  {
    name: '法務局ホームページ「管轄のご案内」',
    url: 'https://houmukyoku.moj.go.jp/homu/static/kankatsu_index.html',
    desc: '土地や建物の場所から、登記を受け持つ法務局（登記所）を調べられるページです。各法務局の住所や、登記の手続きの案内（相談）の予約方法もここからたどれます。',
    category: '登記・資料の取得',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-06',
    note: '法務局の登記手続案内は、申請書の書き方などを聞ける窓口で、予約制のところが多いです。境界がどこかを決めてもらう場ではありません。',
    related: { label: '法務局で取れる土地の資料まとめ', href: '/articles/houmukyoku-shiryou/' },
  },

  // ---------- 法令・制度 ----------
  {
    name: 'e-Gov法令検索',
    url: 'https://laws.e-gov.go.jp/',
    desc: '国の法律や政令・省令の原文を調べられるサイトです。不動産登記法・不動産登記規則・民法なども、最新の条文で確認できます。',
    category: '法令・制度',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-04',
  },
  {
    name: '法務省「筆界特定制度」',
    url: 'https://www.moj.go.jp/MINJI/minji104.html',
    desc: '筆界特定制度のしくみや、申請の方法・手数料について、法務省が説明しているページです。',
    category: '法令・制度',
    audience: ['一般'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-04',
    related: { label: '裁判とどうちがう？「筆界特定制度」のしくみ', href: '/articles/hikkai-tokutei-seido/' },
  },
  {
    name: '地籍調査Webサイト',
    url: 'https://www.chiseki.go.jp/',
    desc: '国土交通省の地籍調査のサイトです。地籍調査のしくみや、市町村ごとの進み具合を確かめられます。',
    category: '法令・制度',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-04',
  },

  // ---------- 測量・技術 ----------
  {
    name: 'Drogger（ドロガー）',
    url: 'https://www.bizstation.jp/ja/drogger/',
    desc: '国内の会社（BizStation）が作っている、高精度GNSS受信機のシリーズです。Androidのスマートフォンとつないで使う受信機や、センチメートル級で測れるRTK対応の受信機があり、専用アプリ（DroggerGPSなど）は無料です。',
    category: '測量・技術',
    audience: ['実務者'],
    kind: 'ツール',
    price: '有料',
    checked: '2026-11-04',
    note: '受信機は購入が必要です（アプリは無料）。比較的手ごろな価格で、RTK測位を試せる機器として知られています。特定の会社をおすすめするものではありません。',
    related: { label: 'GNSSとは？', href: '/articles/gnss-towa/' },
  },
  {
    name: 'エーサーベイ（A-Survey）',
    url: 'https://a-survey.d.dooo.jp/',
    desc: 'AndroidのスマートフォンやWindowsのパソコンで使える測量計算ソフトです。Bluetoothでトータルステーションとつないだ観測や、GNSS受信機との連携、座標計算・杭打ちなどができます。',
    category: '測量・技術',
    audience: ['実務者'],
    kind: 'ツール',
    price: '有料',
    checked: '2026-11-05',
    note: '個人のプロジェクトとして開発されているソフトです。本体のほかに機能を足すオプションがあり、デモ版の案内もあります。対応する機種や端末は公式サイトで確かめてください。特定のソフトをおすすめするものではありません。',
    related: { label: 'エーサーベイ（A-Survey）とは？', href: '/articles/a-survey/' },
  },
  {
    name: '桜町測量ウェブサイト',
    url: 'https://sakura.3ku.jp/',
    desc: '土地家屋調査士事務所のサイトです。ブログで、GNSS測量・3次元測量・GISの使い方など、測量の技術情報を発信しています。',
    category: '測量・技術',
    audience: ['実務者'],
    kind: 'ブログ',
    price: '無料',
    checked: '2026-11-04',
    note: '特定の事務所をおすすめするものではありません。',
  },
  {
    name: 'open-hinata3 逆引き辞典（桜町測量ウェブサイト）',
    url: 'https://sakura.3ku.jp/gis/oh3-reversedictionary/',
    desc: '「〇〇がしたい」という目的から、open-hinata3 の使い方を探せる解説ページです。',
    category: '測量・技術',
    audience: ['一般', '実務者'],
    kind: '資料',
    price: '無料',
    checked: '2026-11-04',
  },

  {
    name: '国土地理院',
    url: 'https://www.gsi.go.jp/',
    desc: '日本の測量と地図づくりを受け持つ国の機関（国土交通省）のサイトです。基準点（測量の目じるしになる点）の成果や、測量のきまり・地殻変動の情報などを調べられます。',
    category: '測量・技術',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-06',
    note: '地図を見るだけなら「地理院地図」が便利です。基準点の位置や成果は、サイト内の「基準点成果等閲覧サービス」から探せます。',
    related: { label: 'GNSSとは？', href: '/articles/gnss-towa/' },
  },

  // ---------- 資格・試験 ----------
  {
    name: '法務省「土地家屋調査士試験」',
    url: 'https://www.moj.go.jp/shikaku_saiyo_index5.html',
    desc: '土地家屋調査士試験の公式ページです。年度ごとに、受験案内書・試験問題（過去問）・多肢択一式の正解と基準点・合格者数などが公開されています。',
    category: '資格・試験',
    audience: ['一般', '実務者'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-05',
    note: '試験問題は年度ごとのページからPDFで見られます。記述式の正解（模範解答）は公開されていません。',
    related: { label: '土地家屋調査士試験をくわしく', href: '/articles/shiken-kuwashiku/' },
  },

  // ---------- 相談先 ----------
  {
    name: '日本土地家屋調査士会連合会',
    url: 'https://www.chosashi.or.jp/',
    desc: '土地家屋調査士の全国団体のサイトです。土地家屋調査士の仕事の紹介や、各地の土地家屋調査士会・境界問題の相談窓口を探せます。',
    category: '相談先',
    audience: ['一般'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-04',
    related: { label: '土地家屋調査士ってどんな人？', href: '/articles/chousashi-towa/' },
  },
  {
    name: '日本司法書士会連合会',
    url: 'https://www.shiho-shoshi.or.jp/',
    desc: '司法書士の全国団体のサイトです。相続や売買による名義の変更（権利の登記）など、司法書士に頼める仕事の紹介や、各地の司法書士会・相談窓口を探せます。',
    category: '相談先',
    audience: ['一般'],
    kind: '公式',
    price: '無料',
    checked: '2026-11-06',
    note: '土地の境界や、表題部の登記（分筆・建物の新築など）は土地家屋調査士、名義（権利）の登記は司法書士、と分かれています。',
    related: { label: '相続登記の申請が義務になりました（2024年4月から）', href: '/articles/souzoku-touki-gimuka/' },
  },
];
