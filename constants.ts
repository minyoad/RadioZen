import { Station, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'music', name: '音乐' },
  { id: 'news', name: '新闻' },
  { id: 'traffic', name: '交通' },
  { id: 'talk', name: '综合/生活' },
  { id: 'classical', name: '戏曲/古典' },
  { id: 'intl', name: '国际/外语' },
];

// --- 内置精选兜底数据 (当远程数据无法加载时使用) ---
// 这些电台通常是最稳定、最受欢迎的
export const DEFAULT_STATIONS: Station[] = [
  {
    id: 'def-1',
    name: '中国之声',
    description: '中央人民广播电台中国之声',
    streamUrl: 'https://ngcdn001.cnr.cn/live/zgzs/index.m3u8',
    coverUrl: 'https://picsum.photos/seed/zgzs/400/400',
    tags: ['央广', '新闻', '综合'],
    category: 'news',
    gain: 1.0,
    frequency: 'FM 106.1'
  },
  {
    id: 'def-2',
    name: 'CRI Hit FM',
    description: 'HitFM 国际流行音乐',
    streamUrl: 'https://sk.cri.cn/887.m3u8',
    coverUrl: 'https://picsum.photos/seed/hitfm/400/400',
    tags: ['音乐', '欧美', '流行'],
    category: 'music',
    gain: 0.8, // 示例：该电台音量较大，降低增益
    frequency: 'FM 88.7'
  },
  {
    id: 'def-3',
    name: '轻松调频 EZFM',
    description: 'Easy FM 轻松调频',
    streamUrl: 'http://sk.cri.cn/915.m3u8',
    coverUrl: 'https://picsum.photos/seed/ezfm/400/400',
    tags: ['音乐', '英语', '生活'],
    category: 'music',
    gain: 1.0,
    frequency: 'FM 91.5'
  },
  {
    id: 'def-4',
    name: '北京音乐广播',
    description: '北京音乐广播 FM97.4',
    streamUrl: 'https://brtv-radiolive.rbc.cn/alive/fm974.m3u8',
    coverUrl: 'https://picsum.photos/seed/bjmusic/400/400',
    tags: ['北京', '音乐'],
    category: 'music',
    gain: 1.0,
    frequency: 'FM 97.4'
  },
  {
    id: 'def-5',
    name: '北京新闻广播',
    description: '北京新闻广播 FM100.6',
    streamUrl: 'http://satellitepull.cnr.cn/live/wxbjxwgb/playlist.m3u8',
    coverUrl: 'https://picsum.photos/seed/bjnews/400/400',
    tags: ['北京', '新闻'],
    category: 'news',
    gain: 1.0,
    frequency: 'FM 100.6'
  },
  {
    id: 'def-6',
    name: '上海动感101',
    description: '上海流行音乐广播',
    streamUrl: 'https://lhttp.qtfm.cn/live/274/64k.mp3',
    coverUrl: 'https://picsum.photos/seed/sh101/400/400',
    tags: ['上海', '音乐', '流行'],
    category: 'music',
    gain: 1.0,
    frequency: 'FM 101.7'
  },
  {
    id: 'def-7',
    name: '上海经典947',
    description: '经典947 经典音乐广播',
    streamUrl: 'https://lhttp.qtfm.cn/live/267/64k.mp3',
    coverUrl: 'https://picsum.photos/seed/sh947/400/400',
    tags: ['上海', '古典', '音乐'],
    category: 'classical',
    gain: 1.2, // 古典音乐通常动态范围大，平均音量小，增加增益
    frequency: 'FM 94.7'
  },
  {
    id: 'def-8',
    name: '第一财经广播',
    description: '第一财经广播',
    streamUrl: 'http://satellitepull.cnr.cn/live/wx32dycjgb/playlist.m3u8',
    coverUrl: 'https://picsum.photos/seed/cbn/400/400',
    tags: ['财经', '新闻', '上海'],
    category: 'news',
    gain: 1.0,
    frequency: 'FM 97.7'
  },
  {
    id: 'def-9',
    name: '广东音乐之声',
    description: '广东广播电视台音乐之声',
    streamUrl: 'http://satellitepull.cnr.cn/live/wxgdyyzs/playlist.m3u8',
    coverUrl: 'https://picsum.photos/seed/gdmusic/400/400',
    tags: ['广东', '音乐', '粤语'],
    category: 'music',
    gain: 1.0,
    frequency: 'FM 99.3'
  },
  {
    id: 'def-10',
    name: '羊城交通广播',
    description: '羊城交通台',
    streamUrl: 'http://satellitepull.cnr.cn/live/wxgdycjtt/playlist.m3u8',
    coverUrl: 'https://picsum.photos/seed/ycjt/400/400',
    tags: ['广东', '交通', '粤语'],
    category: 'traffic',
    gain: 1.0,
    frequency: 'FM 105.2'
  },
  {
    id: 'def-11',
    name: 'BBC World Service',
    description: 'BBC World Service',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    coverUrl: 'https://picsum.photos/seed/bbcworld/400/400',
    tags: ['英语', '国际', '新闻'],
    category: 'intl',
    gain: 1.0,
    frequency: 'WEB'
  },
  {
    id: 'def-12',
    name: 'BBC Radio 1',
    description: 'The best new music',
    streamUrl: 'http://as-hls-ww-live.akamaized.net/pool_01505109/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio%3d96000.norewind.m3u8',
    coverUrl: 'https://picsum.photos/seed/bbc1/400/400',
    tags: ['英语', '国际', '音乐'],
    category: 'music',
    gain: 1.0,
    frequency: 'WEB'
  },
  {
    id: 'def-13',
    name: 'CNN International',
    description: 'CNN News Audio',
    streamUrl: 'https://tunein.cdnstream1.com/3519_96.aac',
    coverUrl: 'https://picsum.photos/seed/cnn/400/400',
    tags: ['英语', '国际', '新闻'],
    category: 'intl',
    gain: 1.0,
    frequency: 'WEB'
  },
  {
    id: 'def-14',
    name: 'Classic FM',
    description: 'The World\'s Greatest Music',
    streamUrl: 'https://ice-sov.musicradio.com/ClassicFMMP3',
    coverUrl: 'https://picsum.photos/seed/classicfm/400/400',
    tags: ['英语', '古典', '国际'],
    category: 'classical',
    gain: 1.2,
    frequency: 'WEB'
  },
  {
    id: 'def-15',
    name: 'LBC News',
    description: 'Leading Britain\'s Conversation',
    streamUrl: 'https://icecast.thisisdax.com/LBCNewsUKMP3',
    coverUrl: 'https://picsum.photos/seed/lbc/400/400',
    tags: ['英语', '新闻', '国际'],
    category: 'news',
    gain: 1.0,
    frequency: 'WEB'
  },
  {
    id: 'def-16',
    name: '私家车999',
    description: '河南私家车广播',
    streamUrl: 'https://stream.hndt.com/live/sijiache/playlist.m3u8',
    coverUrl: 'https://picsum.photos/seed/hn999/400/400',
    tags: ['河南', '交通', '私家车'],
    category: 'traffic',
    gain: 1.0,
    frequency: 'FM 99.9'
  }
];
