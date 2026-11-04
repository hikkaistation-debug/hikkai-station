// 車内の読み物（小説）の「列車」
//   各駅停車 … 毎日ちょっとずつ読める、1話1分のショート
//   特急     … じっくり読む長めの物語（各駅停車と同じ町の、別の人のお話）
// stops：これから停まる駅（まだ書いていない話の予定）。書いたら消してください。
import { getCollection, type CollectionEntry } from 'astro:content';

export type Story = CollectionEntry<'stories'>;

export const TRAINS = {
  kakueki: {
    id: 'kakueki',
    kind: '各駅停車',
    kindEn: 'LOCAL',
    title: 'みのりの境界日誌',
    color: '#4d7c0f', // 緑
    time: '1話 約1分',
    desc: '土地家屋調査士の事務所で働きはじめた朝倉みのりが、杭や図面や「お隣さん」と出会いながら、毎日ひとつずつ境界のことを覚えていく物語です。',
    cast: [
      { name: '朝倉 みのり', role: '主人公。26歳。不動産会社の営業をやめて、甲野事務所の補助者になったばかり。調査士試験の勉強中。' },
      { name: '甲野 隆一', role: '甲野土地家屋調査士事務所の所長。口数は少ないが、杭の話になると止まらない。' },
    ],
    stops: [] as string[],
  },
  tokkyu: {
    id: 'tokkyu',
    kind: '特急',
    kindEn: 'LIMITED EXPRESS',
    title: 'ばあちゃんの杭',
    color: '#7c2d12', // あずき色
    time: '1話 約8分',
    desc: '亡くなった祖母の家を相続した森下航。売ろうとしたら「境界がはっきりしないと売れません」と言われてしまう。相続から境界の確認、売却までを、依頼する側の目線で描く物語です。',
    cast: [
      { name: '森下 航', role: '主人公。34歳の会社員。祖母の家を相続した。土地のことは何も知らない。' },
      { name: '甲野 隆一／朝倉 みのり', role: '「みのりの境界日誌」の二人。航の相談にのる。' },
      { name: '源さん', role: '祖母の家のお隣さん。気むずかしいと評判。' },
    ],
    stops: ['ばあちゃんの書類箱', 'となりの源さん', '杭をさがして', 'ブロック塀のひみつ', '握手のゆくえ', '終点、その先へ'],
  },
} as const;

export type TrainId = keyof typeof TRAINS;
export const getTrain = (id: TrainId) => TRAINS[id];

// 日本時間の「今日」（YYYY-MM-DD）
const todayJst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

// 公開する話を、話の順に取り出す
//   draft: true は出さない
//   公開日が未来の話は出さない（毎朝7時の自動公開で、その日の話が出ます）。
//   ただし手元の確認用サーバー（npm run dev）では、未来の話も表示します。
export async function getPublishedStories(train?: TrainId): Promise<Story[]> {
  const today = todayJst();
  const all = await getCollection(
    'stories',
    ({ data }) =>
      !data.draft &&
      (!train || data.train === train) &&
      (import.meta.env.DEV || process.env.SHOW_ALL_STORIES === '1' || data.pubDate.toISOString().slice(0, 10) <= today),
  );
  return all.sort((a, b) => a.data.no - b.data.no);
}

export const isScheduled = (s: Story) => s.data.pubDate.toISOString().slice(0, 10) > todayJst();
export const storyHref = (s: Story) => `/yomimono/${s.id}/`;
export const storyLabel = (s: Story) => `第${s.data.no}話　${s.data.title}`;
