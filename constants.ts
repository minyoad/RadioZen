import { Station, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'music', name: '音乐' },
  { id: 'news', name: '新闻' },
  { id: 'traffic', name: '交通' },
  { id: 'talk', name: '综合/脱口秀' },
  { id: 'classical', name: '戏曲/古典' },
  { id: 'intl', name: '国际/港台' },
];

export const STATIONS: Station[] = [
  // --- 国家级/央广 ---
  {
    id: 'cnr-1',
    name: 'CNR 中国之声',
    description: '中央人民广播电台新闻综合频率，传递中国声音。',
    frequency: 'FM 106.1',
    coverUrl: 'https://picsum.photos/seed/cnr1/400/400',
    streamUrl: 'https://ngcdn001.cnr.cn/live/zgzs/index.m3u8',
    tags: ['央广', '新闻', '综合', '普通话'],
    category: 'news',
    gain: 0.8 // 新闻台通常声音较大，降低增益
  },
  {
    id: 'cnr-2',
    name: 'CNR 经济之声',
    description: '财经资讯，理性投资，智慧生活。',
    frequency: 'FM 96.6',
    coverUrl: 'https://picsum.photos/seed/cnr2/400/400',
    streamUrl: 'https://lhttp.qtfm.cn/live/343/64k.mp3',
    tags: ['央广', '财经', '经济'],
    category: 'news',
    gain: 0.9
  },
  {
    id: 'cri-news',
    name: 'CRI 环球资讯',
    description: '中国国际广播电台，连接世界的声音。',
    frequency: 'FM 90.5',
    coverUrl: 'https://picsum.photos/seed/crinews/400/400',
    streamUrl: 'https://sk.cri.cn/905.m3u8',
    tags: ['国际', '新闻', '资讯'],
    category: 'news',
    gain: 0.9
  },
  {
    id: 'cri-hitfm',
    name: 'Hit FM',
    description: '国际流行音乐节奏，不仅是流行。',
    frequency: 'FM 88.7',
    coverUrl: 'https://picsum.photos/seed/hitfm/400/400',
    streamUrl: 'https://sk.cri.cn/887.m3u8',
    tags: ['欧美', '流行', '音乐', '北京'],
    category: 'music',
    gain: 1.1 // 音乐台有时动态范围大，稍作提升
  },
  {
    id: 'cri-easyfm',
    name: '轻松调频 EZFM',
    description: '轻松生活，双语广播。',
    frequency: 'FM 91.5',
    coverUrl: 'https://picsum.photos/seed/easyfm/400/400',
    streamUrl: 'https://sk.cri.cn/915.m3u8',
    tags: ['双语', '音乐', '轻松', '北京'],
    category: 'music'
  },

  // --- 北上广热门 ---
  {
    id: 'sh-101',
    name: '动感101',
    description: '上海流行音乐第一台，年轻人的选择。',
    frequency: 'FM 101.7',
    coverUrl: 'https://picsum.photos/seed/sh101/400/400',
    streamUrl: 'https://lhttp.qtfm.cn/live/274/64k.mp3',
    tags: ['上海', '流行', '音乐', '娱乐'],
    category: 'music'
  },
  {
    id: 'sh-947',
    name: '经典947',
    description: '内地唯一的专业古典音乐频率。',
    frequency: 'FM 94.7',
    coverUrl: 'https://picsum.photos/seed/sh947/400/400',
    streamUrl: 'https://lhttp.qtfm.cn/live/267/64k.mp3',
    tags: ['上海', '古典', '高雅', '音乐'],
    category: 'classical',
    gain: 1.3 // 古典音乐通常电平较低，显著提升增益
  },
  {
    id: 'bj-music',
    name: '北京音乐广播',
    description: '首都上空的音乐之声。',
    frequency: 'FM 97.4',
    coverUrl: 'https://picsum.photos/seed/bjmusic/400/400',
    streamUrl: 'https://brtv-radiolive.rbc.cn/alive/fm974.m3u8',
    tags: ['北京', '音乐', '经典'],
    category: 'music'
  },
  {
    id: 'bj-traffic',
    name: '北京交通广播',
    description: '一路畅通，伴您出行。',
    frequency: 'FM 103.9',
    coverUrl: 'https://picsum.photos/seed/bjtraffic/400/400',
    streamUrl: 'https://brtv-radiolive.rbc.cn/alive/fm1039.m3u8',
    tags: ['北京', '交通', '路况'],
    category: 'traffic',
    gain: 0.9
  },
  {
    id: 'gd-music',
    name: '广东音乐之声',
    description: '音乐无界，快乐相伴。',
    frequency: 'FM 99.3',
    coverUrl: 'https://picsum.photos/seed/gdmusic/400/400',
    streamUrl: 'https://satellitepull.cnr.cn/live/wxgdyyzs/playlist.m3u8',
    tags: ['广东', '粤语', '音乐', '流行'],
    category: 'music'
  },
  {
    id: 'gd-yangcheng',
    name: '羊城交通广播',
    description: '服务大众，不仅是交通。',
    frequency: 'FM 105.2',
    coverUrl: 'https://picsum.photos/seed/yangcheng/400/400',
    streamUrl: 'https://satellitepull.cnr.cn/live/wxgdycjtt/playlist.m3u8',
    tags: ['广东', '广州', '交通', '粤语'],
    category: 'traffic'
  },

  // --- 省级/地方特色 ---
  {
    id: 'hn-opera',
    name: '河南戏曲广播',
    description: '弘扬传统文化，戏曲艺术的殿堂。',
    frequency: 'AM 1143',
    coverUrl: 'https://picsum.photos/seed/hnopera/400/400',
    streamUrl: 'https://satellitepull.cnr.cn/live/wxhnxqgb/playlist.m3u8',
    tags: ['河南', '戏曲', '传统', '豫剧'],
    category: 'classical',
    gain: 1.2
  },
  {
    id: 'zj-traffic',
    name: '浙江交通之声',
    description: '浙江第一广播品牌，动力广播。',
    frequency: 'FM 93.0',
    coverUrl: 'https://picsum.photos/seed/zj93/400/400',
    streamUrl: 'https://ls.qingting.fm/live/4522.m3u8',
    tags: ['浙江', '交通', '新闻'],
    category: 'traffic'
  },

  // --- 国际/特色 (筛选后保留的稳定源) ---
  {
    id: 'kexp',
    name: 'KEXP Seattle',
    description: 'where the music matters.',
    frequency: 'WEB',
    coverUrl: 'https://picsum.photos/seed/kexp/400/400',
    streamUrl: 'https://kexp.streamguys1.com/kexp160.aac',
    tags: ['美国', '音乐', '摇滚', '独立'],
    category: 'music'
  },
  {
    id: 'listen-moe',
    name: 'Listen.Moe JPop',
    description: '日本动漫音乐与 J-Pop。',
    frequency: 'WEB',
    coverUrl: 'https://picsum.photos/seed/moe/400/400',
    streamUrl: 'https://listen.moe/stream',
    tags: ['二次元', 'JPop', '动漫', '日语'],
    category: 'music'
  },
  {
    id: 'bj-news',
    name: '北京新闻广播',
    description: '新闻发生时，我们就在现场。',
    frequency: 'FM 100.6',
    coverUrl: 'https://picsum.photos/seed/bjnews/400/400',
    streamUrl: 'https://satellitepull.cnr.cn/live/wxbjxwgb/playlist.m3u8',
    tags: ['北京', '新闻', '综合'],
    category: 'news',
    gain: 0.8
  },
   {
    id: 'sichuan-traffic',
    name: '四川交通广播',
    description: '四川交通第一台。',
    frequency: 'FM 101.7',
    coverUrl: 'https://picsum.photos/seed/sctraffic/400/400',
    streamUrl: 'https://satellitepull.cnr.cn/live/wxscjtgb/playlist.m3u8',
    tags: ['四川', '交通', '路况'],
    category: 'traffic'
  },
  {
    id: 'lyn-traffic',
    name: '辽宁交通广播',
    description: '辽沈地区车主首选。',
    frequency: 'FM 97.5',
    coverUrl: 'https://picsum.photos/seed/lyntraffic/400/400',
    streamUrl: 'https://satellitepull.cnr.cn/live/wxlnjtgb/playlist.m3u8',
    tags: ['辽宁', '沈阳', '交通'],
    category: 'traffic'
  }
];