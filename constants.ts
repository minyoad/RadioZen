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

// --- 智能分类与标签逻辑 ---

const REGIONS = [
  '北京', '上海', '广州', '深圳', '天津', '重庆', '黑龙江', '吉林', '辽宁', '内蒙古', 
  '河北', '河南', '山东', '山西', '江苏', '安徽', '陕西', '宁夏', '甘肃', '青海', 
  '湖北', '湖南', '浙江', '江西', '福建', '贵州', '四川', '云南', '广西', '海南', 
  '新疆', '西藏', '香港', '澳门', '台湾', '台北', '高雄', '美国', '英国', '新加坡', '加拿大',
  '武汉', '长沙', '南京', '杭州', '成都', '西安', '济南', '青岛', '哈尔滨', '长春', '沈阳',
  '大连', '苏州', '无锡', '常州', '宁波', '温州', '福州', '厦门', '南宁', '昆明', '贵阳',
  '海口', '三亚', '兰州', '银川', '乌鲁木齐', '拉萨'
];

const determineCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('交通') || n.includes('路况') || n.includes('车') || n.includes('drive')) return 'traffic';
  if (n.includes('新闻') || n.includes('资讯') || n.includes('news') || n.includes('info') || n.includes('report')) return 'news';
  if (n.includes('戏') || n.includes('曲') || n.includes('古典') || n.includes('classic') || n.includes('opera')) return 'classical';
  if (n.includes('英') || n.includes('english') || n.includes('bbc') || n.includes('cnn') || n.includes('voa') || n.includes('rfi') || n.includes('国际') || n.includes('外语')) return 'intl';
  if (n.includes('音乐') || n.includes('music') || n.includes('fm') || n.includes('流行') || n.includes('pop') || n.includes('rock') || n.includes('jazz') || n.includes('song') || n.includes('9') || n.includes('8') || n.includes('1')) return 'music';
  return 'talk';
};

const extractTags = (name: string): string[] => {
  const tags: string[] = [];
  
  // Region tagging
  REGIONS.forEach(region => {
    if (name.includes(region)) tags.push(region);
  });

  // Content tagging
  if (name.includes('央广') || name.includes('中国')) tags.push('央广');
  if (name.includes('省')) tags.push('省级');
  if (name.includes('市') || name.includes('区') || name.includes('县')) tags.push('市县');
  if (name.includes('粤语')) tags.push('粤语');
  if (name.includes('英语') || name.includes('English')) tags.push('英语');
  
  return tags;
};

// --- 原始数据处理 ---

// Helper to clean URL
const cleanUrl = (url: string) => url.trim().replace(/"/g, '').replace(/'/g, '');

// Parse the raw CSV data
const parseStations = (rawData: string): Station[] => {
  const lines = rawData.split('\n');
  const stationMap = new Map<string, Station>(); // Use map to deduplicate by URL
  
  lines.forEach((line, index) => {
    const parts = line.split(',');
    if (parts.length < 2) return;

    const name = parts[0].trim();
    // Some lines might have extra commas in the URL part? Usually not for simple CSV.
    // Assuming simple Name,URL format.
    const url = cleanUrl(parts[1]);

    if (!name || !url || !url.startsWith('http')) return;

    // Deduplication key: URL is the strongest unique identifier
    if (stationMap.has(url)) return;

    const category = determineCategory(name);
    const tags = extractTags(name);
    
    // Auto-generate some metadata if missing
    if (tags.length === 0) tags.push('综合');
    
    // Create ID based on index to ensure uniqueness but consistency for the same list order
    const id = `s-${index}`;

    stationMap.set(url, {
      id,
      name,
      description: `${name} 在线直播`,
      streamUrl: url,
      coverUrl: `https://picsum.photos/seed/${id}/400/400`, // Deterministic random image
      category,
      tags,
      frequency: 'WEB',
      gain: 1.0,
      isCustom: false
    });
  });

  return Array.from(stationMap.values());
};

// --- 海量电台数据源 (Raw Data) ---
const RAW_STATIONS_CSV = `
中国之声,https://ngcdn001.cnr.cn/live/zgzs/index.m3u8
环球资讯,https://sk.cri.cn/905.m3u8
轻松调频,http://sk.cri.cn/915.m3u8
世界华声,https://sk.cri.cn/hxfh.m3u8
CRI英语环球广播,https://sk.cri.cn/am846.m3u8
HITFM国际流行音乐,https://sk.cri.cn/887.m3u8
安徽音乐广播,http://satellitepull.cnr.cn/live/wxahyygb/playlist.m3u8
北京新闻广播,http://satellitepull.cnr.cn/live/wxbjxwgb/playlist.m3u8
北京音乐广播,https://brtv-radiolive.rbc.cn/alive/fm974.m3u8
福建东南广播,http://satellitepull.cnr.cn/live/wx32fjdngb/playlist.m3u8
福建交通广播,http://satellitepull.cnr.cn/live/wx32fjdnjtgb/playlist.m3u8
甘肃交通广播,http://satellitepull.cnr.cn/live/wxgsjtgb/playlist.m3u8
广东城市之声,http://satellitepull.cnr.cn/live/wxgdcszs/playlist.m3u8
广东股市广播,http://satellitepull.cnr.cn/live/wxgdgsgb/playlist.m3u8
广东文体广播,http://satellitepull.cnr.cn/live/wxgdwtgb/playlist.m3u8
广东音乐之声,http://satellitepull.cnr.cn/live/wxgdyyzs/playlist.m3u8
南方生活广播,http://satellitepull.cnr.cn/live/wxgdnfshgb/playlist.m3u8
深圳飞扬971,https://lhttp.qtfm.cn/live/1271/64k.mp3?app_id=web&type=广东
深圳交通频率,https://lhttp.qtfm.cn/live/1272/64k.mp3?app_id=web&type=广东
羊城交通广播,http://satellitepull.cnr.cn/live/wxgdycjtt/playlist.m3u8
广西交通广播,http://satellitepull.cnr.cn/live/wx32gxjtgb/playlist.m3u8
贵州都市广播,http://satellitepull.cnr.cn/live/wx32gzqcgb/playlist.m3u8
贵州故事广播,https://satellitepull.cnr.cn/live/wx32gzgsgb/playlist.m3u8
贵州经济广播,http://satellitepull.cnr.cn/live/wx32gzjjgb/playlist.m3u8
贵州旅游广播,http://satellitepull.cnr.cn/live/wx32gzlygb/playlist.m3u8
贵州音乐广播,https://satellitepull.cnr.cn/live/wx32gzyygb/playlist.m3u8
河北生活广播,http://satellitepull.cnr.cn/live/wxhebshgb/playlist.m3u8
河北综合广播,http://satellitepull.cnr.cn/live/wxhebzhgb/playlist.m3u8
河南经济广播,http://satellitepull.cnr.cn/live/wxhnjjgb/playlist.m3u8
河南旅游广播,https://satellitepull.cnr.cn/live/wxhnlygb/playlist.m3u8
河南农村广播,https://satellitepull.cnr.cn/live/wxhnncgb/playlist.m3u8
河南戏曲广播,http://satellitepull.cnr.cn/live/wxhnxqgb/playlist.m3u8
河南新闻广播,https://stream.hndt.com/live/xinwen/playlist.m3u8
河南信息广播,https://satellitepull.cnr.cn/live/wxhnxxgb/playlist.m3u8
黑龙江乡村广播,http://satellitepull.cnr.cn/live/wx32hljxcgb/playlist.m3u8
黑龙江新闻广播,http://satellitepull.cnr.cn/live/wx32hljxwgb/playlist.m3u8
楚天交通广播,https://lhttp.qtfm.cn/live/1291/64k.mp3?app_id=web&type=湖北
楚天音乐广播,https://lhttp.qtfm.cn/live/1289/64k.mp3?app_id=web&type=湖北
湖北之声,http://satellitepull.cnr.cn/live/wx32hubzsgb/playlist.m3u8
江苏交通广播,https://satellitepull.cnr.cn/live/wx32jsjtgb/playlist.m3u8
江苏新闻广播,http://live.ximalaya.com/radio-first-page-app/live/534/64.m3u8
辽宁交通广播,http://satellitepull.cnr.cn/live/wxlnjtgb/playlist.m3u8
辽宁乡村广播,http://satellitepull.cnr.cn/live/wxlnxcgb/playlist.m3u8
内蒙古音乐之声,http://satellitepull.cnr.cn/live/wx32nmgyygb/playlist.m3u8
宁夏都市广播,https://satellitepull.cnr.cn/live/wxnxdsgb/playlist.m3u8
宁夏音乐广播,http://satellitepull.cnr.cn/live/wxnxyygb/playlist.m3u8
青海交通音乐,https://satellitepull.cnr.cn/live/wx32qhjtyygb/playlist.m3u8
青海经济广播,http://satellitepull.cnr.cn/live/wx32qhjjgb/playlist.m3u8
山东交通广播,http://satellitepull.cnr.cn/live/wxsdjtgb/playlist.m3u8
山东经典音乐,https://audiolive302.iqilu.com/sdradioShenghuo/sdradio04/playlist.m3u8
山东音乐广播,https://audiolive302.iqilu.com/sdradioYinyue/sdradio07/playlist.m3u8
陕西都市广播,https://satellitepull.cnr.cn/live/wxsxxdsgb/playlist.m3u8
陕西新闻广播,http://satellitepull.cnr.cn/live/wxsxxxwgb/playlist.m3u8
上海新闻广播,http://satellitepull.cnr.cn/live/wx32shrmgb/playlist.m3u8
第一财经广播,http://satellitepull.cnr.cn/live/wx32dycjgb/playlist.m3u8
四川城市之音,https://satellitepull.cnr.cn/live/wxsccszs/playlist.m3u8
四川交通广播,http://satellitepull.cnr.cn/live/wxscjtgb/playlist.m3u8
四川经济广播,http://satellitepull.cnr.cn/live/wxscjjgb/playlist.m3u8
四川岷江音乐,http://satellitepull.cnr.cn/live/wxscmjyyt/playlist.m3u8
西藏汉语广播,http://satellitepull.cnr.cn/live/wxxzhygb/playlist.m3u8
兵团综合广播,https://satellitepull.cnr.cn/live/wxbtzs/playlist.m3u8
新疆绿色广播,http://satellitepull.cnr.cn/live/wxxjlsgb/playlist.m3u8
新疆私家车广播,http://satellitepull.cnr.cn/live/wxxjsjcgb/playlist.m3u8
云南新闻广播,http://satellitepull.cnr.cn/live/wxynxwgb/playlist.m3u8
云南音乐广播,http://satellitepull.cnr.cn/live/wxynyygb/playlist.m3u8
浙江城市之声,http://satellitepull.cnr.cn/live/wxzjcszs/playlist.m3u8
河南音乐广播,https://stream.hndt.com/live/yinyue/playlist.m3u8
私家车999,https://stream.hndt.com/live/sijiache/playlist.m3u8
河南教育广播,http://satellitepull.cnr.cn/live/wxhnlygb/playlist.m3u8
Big Radio,https://stream.hndt.com/live/gudian/playlist.m3u8
CNR中国之声,http://ngcdn001.cnr.cn/live/zgzs/index.m3u8
CNR经济之声,http://ngcdn002.cnr.cn/live/jjzs/index.m3u8
CNR文艺之声,http://audiows010.cnr.cn/live/wyzs192/playlist.m3u8
湖北亲子广播,http://satellitepull.cnr.cn/live/wx32hubfnetgb/playlist.m3u8
武汉新闻广播,https://lhttp.qtfm.cn/live/20198/64k.mp3?app_id=web&type=湖北
武汉交通广播,https://lhttp.qtfm.cn/live/4665/64k.mp3?app_id=web&type=湖北
福建都市广播私家车987,http://satellitepull.cnr.cn/live/wx32fjdndsgb/playlist.m3u8
山东体育休闲广播,http://satellitepull.cnr.cn/live/wxsdtyxxgb/playlist.m3u8
绍兴之声,http://live.shaoxing.com.cn/audio/s10001-xw1/index.m3u8
绍兴交通广播,http://live.shaoxing.com.cn/audio/s10001-jt2/index.m3u8
陕西经济广播896汽车调频,http://satellitepull.cnr.cn/live/wxsxxjjgb/playlist.m3u8
浙江民生资讯广播,http://satellitepull.cnr.cn/live/wxzjmsgb/playlist.m3u8
浙江旅游之声,http://satellitepull.cnr.cn/live/wxzj1045/playlist.m3u8
宁波新闻综合广播,http://ihzlh.linker.cc/ihzlh/zjnb_ts04_920.m3u8
宁波交通广播,http://ihzlh.linker.cc/ihzlh/zjnb_ts01_939.m3u8
宁波经济广播,http://ihzlh.linker.cc/ihzlh/zjnb_ts03_1029.m3u8
惠州综合广播,https://lhttp.qingting.fm/live/5016/64k.mp3
内蒙古农村牧区广播绿野之声,http://satellitepull.cnr.cn/live/wx32nmglyzs/playlist.m3u8
内蒙古新闻广播,http://satellitepull.cnr.cn/live/wx32nmghyzhxwgb/playlist.m3u8
内蒙古蒙语对外广播草原之声,http://satellitepull.cnr.cn/live/wx32nmgdwgb/playlist.m3u8
广西综合广播,http://satellitepull.cnr.cn/live/wx32gxrmgb/playlist.m3u8
广西北部湾之声,http://satellitepull.cnr.cn/live/wx32gxdwgb/playlist.m3u8
云南经济广播私家车电台,http://satellitepull.cnr.cn/live/wxynjjgb/playlist.m3u8
青海新闻综合广播,http://satellitepull.cnr.cn/live/wx32qhwxzhgb/playlist.m3u8
BBC World Service,https://stream.live.vc.bbcmedia.co.uk/bbc_world_service
CNN,https://tunein.cdnstream1.com/3519_96.aac
BBC Radio 1,http://as-hls-ww-live.akamaized.net/pool_01505109/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio%3d96000.norewind.m3u8
BBC Radio 2,http://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio%3d96000.norewind.m3u8
BBC Radio 3,http://as-hls-ww-live.akamaized.net/pool_23461179/live/ww/bbc_radio_three/bbc_radio_three.isml/bbc_radio_three-audio%3d96000.norewind.m3u8
台北广播电台FM93.1,https://stream.ginnet.cloud/live0130lo-yfyo/_definst_/fm/playlist.m3u8
飞特电台,https://phate.io/listen.ogg
国立教育电台,http://wowza.ner.gov.tw/live/_definst_/1/playlist.m3u8
台湾古典音乐台,http://59.120.88.155:8000/live.mp3
CAPITAL 958,https://19183.live.streamtheworld.com/CAPITAL958FM_PREM.aac
YES 933,https://22393.live.streamtheworld.com/YES933_PREM.aac
LOVE 972,https://14033.live.streamtheworld.com/LOVE972FM_PREM.aac
UFM 1003,https://22283.live.streamtheworld.com/UFM_1003AAC.aac
法国国际广播电台,https://rfienchinois64k.ice.infomaniak.ch/rfienchinois-64.mp3
VOCALO,https://stream.wbez.org/vocalolinear
KJZZ,http://kjzz.streamguys1.com/kjzz_aac_high
WBEZ,http://stream.wbez.org/wbezlinear
WOSU,http://wosu.streamguys1.com/NPR_256
宁波音乐广播,http://ihzlh.linker.cc/ihzlh/zjnb_ts02_986.m3u8
湖南音乐之声,http://a.live.hnradio.com/yypd/radio120k_yypd.m3u8?auth_key=1588751172-0-0-d97b858279c1c86650172b9913ea4af2
山西音乐广播,https://lhttp.qingting.fm/live/4932/64k.mp3
厦门音乐广播,http://ls.qingting.fm/live/1739.m3u8
辽宁经典音乐广播,http://satellitepull.cnr.cn/live/wxlnwygb/playlist.m3u8
武汉音乐广播,https://lhttp.qingting.fm/live/1297/64k.mp3
凤凰资讯,http://playtv-live.ifeng.com/live/06OLEEWQKN4_audio.m3u8
凤凰中文,http://playtv-live.ifeng.com/live/06OLEGEGM4G_audio.m3u8
CCTV4 欧洲,https://piccpndali.v.myalicdn.com/audio/cctveurope_2.m3u8
浙江卫视,http://satellitepull.cnr.cn/live/wxzjws/playlist.m3u8
北京卫视,http://satellitepull.cnr.cn/live/wxbtv/playlist.m3u8
深圳卫视,http://satellitepull.cnr.cn/live/wxszws/playlist.m3u8
东南卫视,http://satellitepull.cnr.cn/live/wx32fjws/playlist.m3u8
河北卫视,http://satellitepull.cnr.cn/live/wxhebws/playlist.m3u8
河南卫视,http://satellitepull.cnr.cn/live/wxhnws/playlist.m3u8
贵州卫视,https://piccpndali.v.myalicdn.com/audio/guizhou_2.m3u8
香港卫视,https://piccpndali.v.myalicdn.com/audio/xianggangweishi_2.m3u8
青海卫视,https://piccpndali.v.myalicdn.com/audio/qinghai_2.m3u8
内蒙古卫视,http://satellitepull.cnr.cn/live/wx32nmgws/playlist.m3u8
AsiaFM亚洲热歌台,http://hot.asiafm.net:8000/asiafm
AsiaFM亚洲音乐台,http://asiafm.vip:8000/fm965
AsiaFM亚洲经典台,https://lhttp.qtfm.cn/live/5021912/64k.mp3
AsiaFM亚洲天空台,http://funradio.cn:8000/funradio
AsiaFM亚洲粤语台,https://lhttp.qtfm.cn/live/15318569/64k.mp3
动感音悦台,http://stream3.hndt.com/now/ufjjbZxV/playlist.m3u8
潮流音悦台,http://stream3.hndt.com/now/Or5au0KN/playlist.m3u8
民谣蓝调,http://play-radio-stream3.hndt.com/now/XWfN89gh/playlist.m3u8
舞迷心窍,http://play-radio-stream3.hndt.com/now/WBhgSD3A/playlist.m3u8
80后音悦台,http://stream3.hndt.com/now/SFZeH2cb/playlist.m3u8
经典FM,http://stream3.hndt.com/now/C5NvUpwy/playlist.m3u8
格莱美音乐台,http://stream3.hndt.com/now/yorSd1X2/playlist.m3u8
卷卷猫电台,http://stream3.hndt.com/now/PHucVOu2/playlist.m3u8
民谣音乐台,http://stream3.hndt.com/now/DTK5qc83/playlist.m3u8
摇滚天空台,http://stream3.hndt.com/now/SXJtR4M4/playlist.m3u8
长三角之声,http://satellitepull.cnr.cn/live/wx32dfgbdt/playlist.m3u8
海峡之声新闻广播,http://vos.com.cn/live/liveNew/800k/tzwj_video.m3u8
金鹰955电台,http://live.xmcdn.com/live/405/64.m3u8
京津冀之声,https://brtv-radiolive.rbc.cn/alive/fm1006.m3u8
北京外语广播,https://brtv-radiolive.rbc.cn/alive/fm923.m3u8
北京体育广播,https://brtv-radiolive.rbc.cn/alive/fm1025.m3u8
扬州交通广播,http://ls.qingting.fm/live/2804.m3u8
扬州新闻广播,http://ls.qingting.fm/live/5000.m3u8?aac
南京体育广播,http://hls.njgb.com/live_hls/3/playlist.m3u8
南京新闻综合广播,http://hls.njgb.com/live_hls/1/playlist.m3u8
南京交通广播,http://hls.njgb.com/live_hls/2/playlist.m3u8
南京经济广播,http://hls.njgb.com/live_hls/6/playlist.m3u8
重庆都市广播,http://satellitepull.cnr.cn/live/wxcqdsgb/playlist.m3u8
深圳交通广播,http://satellitepull.cnr.cn/live/wxszjjpl/playlist.m3u8
深圳新闻广播先锋898,http://satpili-live-hls.mp.sztv.com.cn/satlive/sat_FM898.m3u8
四川新闻广播,http://satellitepull.cnr.cn/live/wxsclyshgb/playlist.m3u8
厦门经济交通广播,http://ls.qingting.fm/live/1738.m3u8
徐州新闻综合广播,https://lhttp.qingting.fm/live/4922/64k.mp3
黑龙江生活广播,http://satellitepull.cnr.cn/live/wx32hljsjcgb/playlist.m3u8
BBC Radio 5 Live,http://as-hls-ww-live.akamaized.net/pool_89021708/live/ww/bbc_radio_five_live/bbc_radio_five_live.isml/bbc_radio_five_live-audio%3d96000.norewind.m3u8
BBC 6 Music,http://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio%3d96000.norewind.m3u8
BravoFM台北都会音乐台,https://onair.bravo913.com.tw:9130/live.mp3
环宇广播,http://stream.rcs.revma.com/srn5f9kmwxhvv
台中广播电台,http://211.20.119.101:8081
苏州音乐广播,https://lhttp.qingting.fm/live/2803/64k.mp3
河北汽车音乐台,https://radio.pull.hebtv.com/live/hebqcyy.m3u8
石家庄音乐广播,https://lhttp.qingting.fm/live/1654/64k.mp3
广东珠江经济台FM97.4,http://ls.qingting.fm/live/1259.m3u8
珠海电台先锋951,http://ls.qingting.fm/live/1274.m3u8
深圳生活广播,https://lhttp.qtfm.cn/live/1273/64k.mp3?app_id=web&type=广东
广州交通电台FM106.1,http://ls.qingting.fm/live/4955.m3u8
北京阳光调频,https://lhttp.qtfm.cn/live/5021739/64k.mp3
LBC News,https://icecast.thisisdax.com/LBCNewsUKMP3
Times Radio,http://timesradio.wireless.radio/stream
Talk Radio,https://radio.talkradio.co.uk/stream
Capital FM,http://22893.live.streamtheworld.com:3690/CAPITAL958FMAAC.aac
Hao FM,https://playerservices.streamtheworld.com/api/livestream-redirect/HAO_963.mp3
Money FM,https://playerservices.streamtheworld.com/api/livestream-redirect/MONEY_893AAC.aac
Kiss FM,https://playerservices.streamtheworld.com/api/livestream-redirect/KISS_92AAC.aac
NPR News,http://npr-ice.streamguys1.com/live.mp3
ABC News Radio,http://live-radio01.mediahubaustralia.com/PBW/mp3
Newstalk ZB,https://playerservices.streamtheworld.com/api/livestream-redirect/NZME_31AAC.aac
Classic FM,https://ice-sov.musicradio.com/ClassicFMMP3
BBC 1Xtra,http://as-hls-ww-live.akamaized.net/pool_92079267/live/ww/bbc_1xtra/bbc_1xtra.isml/bbc_1xtra-audio%3d96000.norewind.m3u8
BBC Asian Network,http://as-hls-ww-live.akamaized.net/pool_22108647/live/ww/bbc_asian_network/bbc_asian_network.isml/bbc_asian_network-audio%3d96000.norewind.m3u8
清晨音乐台,https://lhttp.qtfm.cn/live/4915/64k.mp3
上海动感101,https://lhttp.qtfm.cn/live/274/64k.mp3
深圳飞扬音乐台,http://ls.qingting.fm/live/1271.m3u8
四川岷江广播,http://ls.qingting.fm/live/1110.m3u8
浙江动听,http://ls.qingting.fm/live/4866.m3u8
CRI Hit FM,http://sk.cri.cn/887.m3u8
重庆都市广播,http://ls.qingting.fm/live/1502.m3u8
厦门新闻广播,http://ls.qingting.fm/live/1737.m3u8
广州新闻电台,http://ls.qingting.fm/live/4848.m3u8
广州汽车音乐电台,http://ls.qingting.fm/live/52710.m3u8
东广新闻台,http://ls.qingting.fm/live/275.m3u8
九江交通广播,http://ls.qingting.fm/live/2785094.m3u8
云南教育广播,http://ls.qingting.fm/live/1930.m3u8
保定交通广播,http://ls.qingting.fm/live/28140.m3u8
保定城市服务广播,http://ls.qingting.fm/live/62628.m3u8
南宁交通音乐广播,http://ls.qingting.fm/live/80793.m3u8?aac
南通交通广播,http://ls.qingting.fm/live/2216385.m3u8
呼和浩特新闻综合广播,http://ls.qingting.fm/live/2218711.m3u8
咸阳城市之声,http://ls.qingting.fm/live/3559664.m3u8
四川新闻综合广播,http://ls.qingting.fm/live/4906.m3u8
四川民族广播,http://ls.qingting.fm/live/1115.m3u8
四川私家车广播,http://live.xmcdn.com/live/1646/64.m3u8
四川财富广播,http://ls.qingting.fm/live/4927.m3u8
太原交通广播,http://ls.qingting.fm/live/4900.m3u8
太原私家车Radio,http://ls.qingting.fm/live/4018.m3u8
太原音乐广播,http://ls.qingting.fm/live/1185.m3u8
宁夏交通广播,http://ls.qingting.fm/live/1840.m3u8
宁夏都市广播,http://ls.qingting.fm/live/1842.m3u8
山东体育广播,http://live.xmcdn.com/live/805/64.m3u8
山东新闻广播,http://ls.qingting.fm/live/60180.m3u8
山东生活广播,http://ls.qingting.fm/live/60260.m3u8
岳阳交通广播,http://ls.qingting.fm/live/88931.m3u8
常州交通广播,http://ls.qingting.fm/live/2796.m3u8
广西私家车930,http://ls.qingting.fm/live/1756.m3u8
广西音乐台,http://ls.qingting.fm/live/4875.m3u8
惠州环保交通广播,http://ls.qingting.fm/live/5017.m3u8
惠州音乐广播,http://ls.qingting.fm/live/2212959.m3u8
新疆交通广播,http://ls.qingting.fm/live/1910.m3u8
新疆新闻广播,http://ls.qingting.fm/live/1902.m3u8
无锡新闻广播,http://ls.qingting.fm/live/2777.m3u8
昆明汽车广播,http://ls.qingting.fm/live/1936.m3u8
昆明资讯频率,http://ls.qingting.fm/live/1937.m3u8
昆明都市调频,http://ls.qingting.fm/live/1935.m3u8
昆明阳光广播,http://ls.qingting.fm/live/1934.m3u8
梅州交通广播,http://ls.qingting.fm/live/24195.m3u8
梅州新闻广播,http://ls.qingting.fm/live/24173.m3u8
沈阳新闻广播,http://ls.qingting.fm/live/23891.m3u8
河北交通广播,http://ls.qingting.fm/live/1646.m3u8
河北农民广播,http://ls.qingting.fm/live/1650.m3u8
河北故事广播,http://ls.qingting.fm/live/1645.m3u8
河北新闻广播,http://ls.qingting.fm/live/1644.m3u8
河北旅游广播,http://ls.qingting.fm/live/1651.m3u8
河北私家车广播,http://ls.qingting.fm/live/4868.m3u8
河北音乐广播,http://ls.qingting.fm/live/1649.m3u8
济南故事广播,http://ls.qingting.fm/live/1672.m3u8
济南私家车广播,http://ls.qingting.fm/live/1670.m3u8
济南经济广播,http://ls.qingting.fm/live/1668.m3u8
济南音乐广播,http://ls.qingting.fm/live/1671.m3u8
浙江之声,http://ls.qingting.fm/live/4518.m3u8
浙江交通之声,http://ls.qingting.fm/live/4522.m3u8
浙江财富广播,http://ls.qingting.fm/live/4519.m3u8
海南交通广播,http://ls.qingting.fm/live/4911.m3u8
海南国际旅游之声,http://ls.qingting.fm/live/1862.m3u8
海南新闻广播,http://ls.qingting.fm/live/1861.m3u8
海南民生广播,http://ls.qingting.fm/live/1511803.m3u8
深圳快乐1062,http://ls.qingting.fm/live/1272.m3u8
深圳私家车广播,http://ls.qingting.fm/live/1273.m3u8
温州交通广播,http://ls.qingting.fm/live/23863.m3u8
温州新闻广播,http://ls.qingting.fm/live/23861.m3u8
温州私家车音乐广播,http://ls.qingting.fm/live/23865.m3u8
温州经济生活广播,http://ls.qingting.fm/live/23867.m3u8
珠海电台交通音乐,http://ls.qingting.fm/live/1275.m3u8
西宁交通频率,http://ls.qingting.fm/live/3400408.m3u8
西宁新闻频率,http://ls.qingting.fm/live/3400403.m3u8
西安交通广播,http://ls.qingting.fm/live/1611.m3u8
西安新闻广播,http://ls.qingting.fm/live/1610.m3u8
西安音乐广播,http://ls.qingting.fm/live/1612.m3u8
贵州新闻综合广播,http://ls.qingting.fm/live/23933.m3u8
贵州电台交通广播,http://ls.qingting.fm/live/23927.m3u8
贵州电台旅游广播,http://ls.qingting.fm/live/23929.m3u8
贵州电台经济广播,http://ls.qingting.fm/live/23935.m3u8
郑州新闻广播,http://ls.qingting.fm/live/1220.m3u8
郑州活力944,http://ls.qingting.fm/live/4921.m3u8
郑州车道931,http://ls.qingting.fm/live/1221.m3u8
郴州综合广播,http://ls.qingting.fm/live/76765.m3u8
郴州音乐交通广播,http://ls.qingting.fm/live/86747.m3u8
长春生活故事广播,http://ls.qingting.fm/live/5014.m3u8
长沙城市之声,http://ls.qingting.fm/live/4237.m3u8
长沙新闻广播,http://ls.qingting.fm/live/4877.m3u8
长治交通文艺广播,http://ls.qingting.fm/live/2669405.m3u8
长治新闻综合广播,http://ls.qingting.fm/live/2702863.m3u8
阳泉交通广播,http://ls.qingting.fm/live/4592896.m3u8?aac
阳泉新闻综合广播,http://ls.qingting.fm/live/5876899.m3u8?aac
青岛交通广播,http://ls.qingting.fm/live/1676.m3u8
青岛故事广播,http://ls.qingting.fm/live/4956.m3u8
青岛新闻广播,http://ls.qingting.fm/live/1673.m3u8
青岛西海岸城市生活广播,http://ls.qingting.fm/live/33446.m3u8
青海交通音乐广播,http://ls.qingting.fm/live/5009.m3u8
青海经济广播,http://ls.qingting.fm/live/5008.m3u8
鹤壁交通音乐广播,http://ls.qingting.fm/live/3032681.m3u8
龙广交通广播,http://ls.qingting.fm/live/4973.m3u8
龙广音乐广播,http://ls.qingting.fm/live/4969.m3u8
怀集音乐之声,https://lhttp.qtfm.cn/live/4804/64k.mp3
武汉经典音乐广播,https://lhttp.qtfm.cn/live/1297/64k.mp3?app_id=web&type=湖北
魅力FM1064城市生活音乐广播,https://lhttp.qtfm.cn/live/5022716/64k.mp3?app_id=web&type=湖北
上海流行音乐LoveRadio,https://lhttp.qtfm.cn/live/273/64k.mp3
上海经典947,https://lhttp.qtfm.cn/live/267/64k.mp3
长沙FM101.7城市之声,https://lhttp.qtfm.cn/live/4237/64k.mp3
长沙FM88.6音乐广播,https://lhttp.qtfm.cn/live/20847/64k.mp3
Al Jazeera English,https://live-hls-audio-web-aje.getaj.net/VOICE-AJE/01.m3u8
500首华语经典,http://ls.qingting.fm/live/3412131.m3u8?bitrate=64
北京城市广播,http://ls.qingting.fm/live/345.m3u8
北京文艺广播,http://live.xmcdn.com/live/94/64.m3u8
北京房山经典音乐,http://live.xmcdn.com/live/963/64.m3u8
北京好音乐,http://ls.qingting.fm/live/2131011.m3u8
重庆新闻广播,http://ls.qingting.fm/live/1498.m3u8
重庆经济广播,http://ls.qingting.fm/live/1499.m3u8
福建音乐广播,http://ls.qingting.fm/live/4585.m3u8
福建私家车广播,http://ls.qingting.fm/live/1736.m3u8
甘肃交通广播,http://live.xmcdn.com/live/289/64.m3u8
广东新闻频道,http://live.xmcdn.com/live/245/64.m3u8
广东优悦广播,http://ls.qingting.fm/live/470.m3u8
深圳星光,http://ls.qingting.fm/live/28132.m3u8
中山电台新锐967,http://live.xmcdn.com/live/1220/64.m3u8
中山电台快乐888,http://ls.qingting.fm/live/1278.m3u8
潮州新闻综合广播,http://ls.qingting.fm/live/4596.m3u8
潮州戏曲广播,http://ls.qingting.fm/live/4595.m3u8
江门新闻综合台,http://ls.qingting.fm/live/1282.m3u8
江门旅游音乐台,http://ls.qingting.fm/live/1283.m3u8
梅州私家车广播,http://ls.qingting.fm/live/2841338.m3u8
新会电台,http://ls.qingting.fm/live/5061.m3u8
普宁人民广播电台,http://ls.qingting.fm/live/3976130.m3u8
广西新闻910,http://live.xmcdn.com/live/299/64.m3u8
广西女主播电台,http://ls.qingting.fm/live/1754.m3u8
广西交通台,http://ls.qingting.fm/live/1758.m3u8
广西北部湾之声,http://live.xmcdn.com/live/303/64.m3u8
北海新闻广播,http://ls.qingting.fm/live/85653.m3u8
贵州电台音乐广播,http://ls.qingting.fm/live/23937.m3u8
贵阳新闻广播,http://live.xmcdn.com/live/365/64.m3u8
贵阳交通广播,http://ls.qingting.fm/live/1774.m3u8
贵阳音乐之声,http://ls.qingting.fm/live/4874.m3u8
海口新闻综合广播,http://ls.qingting.fm/live/2938451.m3u8
石家庄音乐广播,http://live.xmcdn.com/live/504/64.m3u8
秦皇岛综合广播,http://live.xmcdn.com/live/1114/64.m3u8
郑州私家车,http://ls.qingting.fm/live/1222.m3u8
郑州汽车广播,http://ls.qingting.fm/live/1211.m3u8
开封旅游广播,http://ls.qingting.fm/live/4569.m3u8
新乡交通广播,http://ls.qingting.fm/live/1229.m3u8
许昌新闻广播,http://ls.qingting.fm/live/3125648.m3u8
许昌交通广播,http://ls.qingting.fm/live/3126629.m3u8
龙广私家车广播,http://ls.qingting.fm/live/4970.m3u8
龙广都市女性台,http://ls.qingting.fm/live/4968.m3u8
龙广爱家频道,http://ls.qingting.fm/live/4972.m3u8
牡丹江新闻广播,http://live.xmcdn.com/live/1558/64.m3u8
牡丹江经济广播,http://ls.qingting.fm/live/3687385.m3u8
襄阳新闻广播,http://ls.qingting.fm/live/1307.m3u8
襄阳音乐广播,http://ls.qingting.fm/live/5057.m3u8
长沙交通音乐广播,http://ls.qingting.fm/live/3967.m3u8
衡阳新闻广播,http://live.xmcdn.com/live/1185/64.m3u8
吉林经济广播,http://ls.qingting.fm/live/3976.m3u8
吉林音乐广播,http://ls.qingting.fm/live/1831.m3u8
长春交通之声,http://ls.qingting.fm/live/4967.m3u8
长春城市精英广播,http://ls.qingting.fm/live/5015.m3u8
苏州新闻广播,http://live.xmcdn.com/live/63/64.m3u8
苏州交通广播,http://live.xmcdn.com/live/64/64.m3u8
苏州戏曲广播,http://live.xmcdn.com/live/576/64.m3u8
苏州生活广播,http://live.xmcdn.com/live/573/64.m3u8
无锡综合广播,http://ls.qingting.fm/live/2776.m3u8
无锡经济广播,http://ls.qingting.fm/live/2778.m3u8
无锡汽车音乐广播,http://ls.qingting.fm/live/2779.m3u8
无锡交通广播,http://ls.qingting.fm/live/2780.m3u8
无锡都市生活广播,http://ls.qingting.fm/live/2783.m3u8
扬州流行音乐广播,http://ls.qingting.fm/live/2805.m3u8
常州爱听935,http://ls.qingting.fm/live/2799.m3u8
南通新闻广播,http://ls.qingting.fm/live/1611381.m3u8
南通音乐广播,http://ls.qingting.fm/live/1606731.m3u8
赣州电台新闻广播,http://ls.qingting.fm/live/60286.m3u8
辽宁综合广播,http://ls.qingting.fm/live/23793.m3u8
沈阳音乐广播,http://ls.qingting.fm/live/1101.m3u8
沈阳都市广播,http://ls.qingting.fm/live/1099.m3u8
丹东交通广播,http://live.xmcdn.com/live/343/64.m3u8
呼和浩特交通广播,http://ls.qingting.fm/live/2218715.m3u8
山东经济广播,http://ls.qingting.fm/live/60198.m3u8
山东女主播电台,http://ls.qingting.fm/live/60258.m3u8
济南新闻广播,http://ls.qingting.fm/live/1667.m3u8
济南交通广播,http://ls.qingting.fm/live/1669.m3u8
潍坊新闻广播,http://live.xmcdn.com/live/849/64.m3u8
潍坊私家车广播,http://ls.qingting.fm/live/84511.m3u8
潍坊音乐优生活,http://ls.qingting.fm/live/4865.m3u8
烟台经济广播,http://ls.qingting.fm/live/1683.m3u8
滨州综合广播,http://ls.qingting.fm/live/2149733.m3u8
滨州交通广播,http://ls.qingting.fm/live/78141.m3u8
山西文艺广播,http://live.xmcdn.com/live/887/64.m3u8
太原新闻广播,http://ls.qingting.fm/live/23873.m3u8
晋城交通音乐广播,http://ls.qingting.fm/live/1189.m3u8
西安资讯广播,http://stream3.xiancity.cn/2/sd/live.m3u8
西安综艺广播,http://stream3.xiancity.cn/3/sd/live.m3u8
上海人民广播电台,http://ls.qingting.fm/live/270.m3u8
上海戏剧曲艺,http://live.xmcdn.com/live/60/64.m3u8
上海城市沸点,http://live.xmcdn.com/live/1236/64.m3u8
四川旅游广播,http://live.xmcdn.com/live/753/64.m3u8
天津MyFM100.5,http://ls.qingting.fm/live/23869.m3u8
新疆哈萨克语广播,http://ls.qingting.fm/live/1908.m3u8
新疆蒙古语广播,http://ls.qingting.fm/live/1903.m3u8
云南交通广播,http://ls.qingting.fm/live/1928.m3u8
大理苍洱调频,http://ls.qingting.fm/live/1940.m3u8
保山综合广播,http://ls.qingting.fm/live/3702178.m3u8
玉溪新闻广播,http://ls.qingting.fm/live/2978811.m3u8
浙江民生,http://ls.qingting.fm/live/4521.m3u8
浙江女主播电台,http://ls.qingting.fm/live/4524.m3u8
杭州新闻广播,http://ls.qingting.fm/live/1134.m3u8
杭州综合广播,http://ls.qingting.fm/live/4546579.m3u8
杭州交通广播,http://ls.qingting.fm/live/1133.m3u8
杭州老朋友广播,http://ls.qingting.fm/live/1132.m3u8
宁波动感105,http://ls.qingting.fm/live/3047946.m3u8
宁波新闻广播,http://ls.qingting.fm/live/1138.m3u8
宁波私家车音乐台,http://ls.qingting.fm/live/1142.m3u8
宁波甬江之声,http://ls.qingting.fm/live/23909.m3u8
温州绿色之声,http://ls.qingting.fm/live/1158.m3u8
湖州综合广播,http://ls.qingting.fm/live/2810.m3u8
湖州经济广播,http://ls.qingting.fm/live/2812.m3u8
湖州交通文艺广播,http://live.xmcdn.com/live/656/64.m3u8
安阳交通广播,http://ls.qingting.fm/live/2138.m3u8
安阳汽车音乐台,http://ls.qingting.fm/live/2123.m3u8
朝阳交通娱乐广播,http://live.xmcdn.com/live/354/64.m3u8
朝阳经济广播,http://live.xmcdn.com/live/355/64.m3u8
朝阳新闻综合广播,http://live.xmcdn.com/live/353/64.m3u8
恩平电台,http://ls.qingting.fm/live/80439.m3u8
公安县广播电台,http://ls.qingting.fm/live/5063.m3u8
辽阳交通文艺广播,http://ls.qingting.fm/live/2977806.m3u8
南宁经典1049,http://ls.qingting.fm/live/80795.m3u8?aac
南宁新闻综合广播,http://ls.qingting.fm/live/61208.m3u8?aac
宁波交通广播,http://ls.qingting.fm/live/1140.m3u8
宁波经济广播,http://ls.qingting.fm/live/1152.m3u8
陕西都市广播-陕广新闻,http://ls.qingting.fm/live/1609.m3u8
陕西交通广播,http://ls.qingting.fm/live/1601.m3u8
陕西农村广播,http://ls.qingting.fm/live/1602.m3u8
陕西戏曲广播,http://ls.qingting.fm/live/1606.m3u8
陕西新闻广播,http://ls.qingting.fm/live/1600.m3u8
陕西音乐广播,http://ls.qingting.fm/live/4873.m3u8
石家庄交通广播,http://live.xmcdn.com/live/505/64.m3u8
香港电台第一台,https://rthkaudio1-lh.akamaihd.net/i/radio1_1@355864/master.m3u8
香港电台第二台,https://rthkaudio2-lh.akamaihd.net/i/radio2_1@355865/master.m3u8
香港电台第三台,https://rthkaudio3-lh.akamaihd.net/i/radio3_1@355866/master.m3u8
香港电台第四台,https://rthkaudio4-lh.akamaihd.net/i/radio4_1@355867/master.m3u8
香港电台第五台,https://rthkaudio5-lh.akamaihd.net/i/radio5_1@355868/master.m3u8
加拿大中文电台FM,https://5b2959fe11444.streamlock.net/radio/fm961.stream/chunklist_w441033106.m3u8
加拿大中文电台AM1470,https://5b2959fe11444.streamlock.net/radio/am1470.stream/chunklist_w987170920.m3u8
纽约古典音乐台,https://stream.wqxr.org/wqxr-web
Listen.Moe JPop,https://listen.moe/stream
凤凰资讯,http://playtv-live.ifeng.com/live/06OLEEWQKN4_audio.m3u8

凤凰中文,http://playtv-live.ifeng.com/live/06OLEGEGM4G_audio.m3u8

CCTV2,https://piccpndali.v.myalicdn.com/audio/cctv2_2.m3u8

CCTV4,https://piccpndali.v.myalicdn.com/audio/cctv4_2.m3u8

CCTV4美洲,https://piccpndali.v.myalicdn.com/audio/cctvamerica_2.m3u8

CCTV5,https://piccpndali.v.myalicdn.com/audio/cctv5_2.m3u8

CCTV5+,https://piccpndali.v.myalicdn.com/audio/cctv5plus_2.m3u8

CCTV6,https://piccpndali.v.myalicdn.com/audio/cctv6_2.m3u8

CCTV7,https://piccpndali.v.myalicdn.com/audio/cctv7_2.m3u8

CCTV8,https://piccpndali.v.myalicdn.com/audio/cctv8_2.m3u8

CCTV10,https://piccpndali.v.myalicdn.com/audio/cctv10_2.m3u8

CCTV11,https://piccpndali.v.myalicdn.com/audio/cctv11_2.m3u8

CCTV12,https://piccpndali.v.myalicdn.com/audio/cctv12_2.m3u8

CCTV13,https://piccpndali.v.myalicdn.com/audio/cctv13_2.m3u8

CCTV14,https://piccpndali.v.myalicdn.com/audio/cctv14_2.m3u8

CCTV15,https://piccpndali.v.myalicdn.com/audio/cctv15_2.m3u8

CCTV16,https://piccpndali.v.myalicdn.com/audio/cctv16_2.m3u8

CCTV17,https://piccpndali.v.myalicdn.com/audio/cctv17_2.m3u8

浙江卫视,http://satellitepull.cnr.cn/live/wxzjws/playlist.m3u8

北京卫视,http://satellitepull.cnr.cn/live/wxbtv/playlist.m3u8

深圳卫视,http://satellitepull.cnr.cn/live/wxszws/playlist.m3u8

东南卫视,http://satellitepull.cnr.cn/live/wx32fjws/playlist.m3u8

河北卫视,http://satellitepull.cnr.cn/live/wxhebws/playlist.m3u8

河南卫视,http://satellitepull.cnr.cn/live/wxhnws/playlist.m3u8

贵州卫视,https://piccpndali.v.myalicdn.com/audio/guizhou_2.m3u8

香港卫视,https://piccpndali.v.myalicdn.com/audio/xianggangweishi_2.m3u8

青海卫视,https://piccpndali.v.myalicdn.com/audio/qinghai_2.m3u8
`;

// Export the parsed stations
export const STATIONS = parseStations(RAW_STATIONS_CSV);
