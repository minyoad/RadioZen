# 多播放源功能说明

## 功能概述

RadioZen 现在支持为每个电台配置多个播放源，使用 `#` 符号分隔不同的 URL。当某个播放源无法连接时，系统会自动切换到下一个可用的播放源。

## 使用方法

### 1. 在电台数据中配置多个播放源

```typescript
{
  id: 'station-1',
  name: '示例电台',
  description: '多播放源示例',
  streamUrl: 'https://example.com/stream1.m3u8#https://example.com/stream2.mp3#https://example.com/stream3.aac',
  coverUrl: 'https://example.com/cover.jpg',
  tags: ['示例'],
  category: 'music'
}
```

### 2. 从远程数据加载

远程 JSON 数据中的电台也可以包含多个播放源：

```json
{
  "id": "remote-1",
  "name": "远程电台",
  "streamUrl": "https://remote1.com/stream.m3u8#https://remote2.com/stream.mp3",
  "description": "从远程加载的多源电台",
  "tags": ["远程"],
  "category": "music"
}
```

### 3. 用户自定义电台

在添加自定义电台时，也可以使用 `#` 分隔多个播放源。

## 工作原理

### 自动切换流程

1. **尝试第一个播放源**
   - 使用 `streamUrl` 中的第一个 URL
   - 如果是 HLS 流（.m3u8），使用 HLS.js
   - 如果是普通音频流（.mp3, .aac），使用原生 Audio

2. **播放失败时自动切换**
   - 检测到错误时，自动切换到下一个播放源
   - 显示提示："正在切换播放源..."
   - 重置重试计数器

3. **切换顺序**
   ```
   播放源 1 → 失败 → 播放源 2 → 失败 → 播放源 3 → ...
   ```

4. **备用线路**
   - 如果所有播放源都失败，尝试 `fallbackStreamUrl`
   - 最后尝试 CORS 代理

### 错误处理优先级

```
1. 切换到下一个播放源
2. 尝试 CORS 代理（如果检测到 CORS 错误）
3. 尝试 HTTPS 升级（如果当前是 HTTP）
4. 尝试备用线路（fallbackStreamUrl）
5. 重试当前播放源（最多 2 次）
6. 标记为不可播放
```

## 示例

### 示例 1：央广中国之声

```typescript
{
  id: 'def-1',
  name: '中国之声',
  description: '中央人民广播电台中国之声',
  streamUrl: 'https://ngcdn001.cnr.cn/live/zgzs/index.m3u8#http://ngcdn001.cnr.cn/live/zgzs/playlist.m3u8',
  coverUrl: 'https://picsum.photos/seed/zgzs/400/400',
  tags: ['央广', '新闻', '综合'],
  category: 'news',
  gain: 1.0,
  frequency: 'FM 106.1'
}
```

- **播放源 1**: HTTPS HLS 流（主源）
- **播放源 2**: HTTP HLS 流（备用源）

### 示例 2：CRI Hit FM

```typescript
{
  id: 'def-2',
  name: 'CRI Hit FM',
  description: 'HitFM 国际流行音乐',
  streamUrl: 'https://sk.cri.cn/887.m3u8#http://sk.cri.cn/887.m3u8',
  coverUrl: 'https://picsum.photos/seed/hitfm/400/400',
  tags: ['音乐', '欧美', '流行'],
  category: 'music',
  gain: 0.8,
  frequency: 'FM 88.7'
}
```

- **播放源 1**: HTTPS HLS 流
- **播放源 2**: HTTP HLS 流

### 示例 3：混合格式

```typescript
{
  id: 'def-3',
  name: '轻松调频 EZFM',
  description: 'Easy FM 轻松调频',
  streamUrl: 'http://sk.cri.cn/915.m3u8#https://sk.cri.cn/915.m3u8',
  coverUrl: 'https://picsum.photos/seed/ezfm/400/400',
  tags: ['音乐', '英语', '生活'],
  category: 'music',
  gain: 1.0,
  frequency: 'FM 91.5'
}
```

## 技术实现

### 核心函数

#### `parseStreamUrls(streamUrl: string): string[]`
解析 `streamUrl`，返回 URL 数组：

```typescript
const parseStreamUrls = (streamUrl: string): string[] => {
  if (!streamUrl) return [];
  return streamUrl.split('#').map(url => url.trim()).filter(url => url.length > 0);
};
```

#### `getCurrentStreamUrl(station: Station): string`
获取当前应该使用的播放源：

```typescript
const getCurrentStreamUrl = (station: Station): string => {
  const urls = parseStreamUrls(station.streamUrl);
  const index = Math.min(currentStreamIndex, urls.length - 1);
  return urls[index] || urls[0];
};
```

#### `hasMoreStreams(station: Station): boolean`
检查是否还有更多播放源：

```typescript
const hasMoreStreams = (station: Station): boolean => {
  const urls = parseStreamUrls(station.streamUrl);
  return currentStreamIndex < urls.length - 1;
};
```

#### `tryNextStream(): boolean`
尝试切换到下一个播放源：

```typescript
const tryNextStream = (): boolean => {
  if (currentStation && hasMoreStreams(currentStation)) {
    setCurrentStreamIndex(prev => prev + 1);
    return true;
  }
  return false;
};
```

### 状态管理

```typescript
const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
```

- `currentStreamIndex`: 当前使用的播放源索引（从 0 开始）
- 切换电台时重置为 0
- 播放失败时自动递增

## 优势

### 1. 提高可靠性
- 多个播放源提供冗余备份
- 单个源故障不影响整体可用性

### 2. 自动故障转移
- 无需手动干预
- 自动选择最佳播放源

### 3. 灵活配置
- 支持不同格式（HLS、MP3、AAC）
- 支持不同协议（HTTP、HTTPS）

### 4. 向后兼容
- 单个 URL 的电台仍然正常工作
- 不影响现有数据

## 注意事项

### 1. URL 格式
- 使用 `#` 作为分隔符
- 每个 URL 前后不要有多余空格
- 确保所有 URL 都有效

### 2. 播放源顺序
- 第一个 URL 优先级最高
- 建议将最稳定的源放在前面

### 3. 性能考虑
- 播放源数量不宜过多（建议 2-3 个）
- 过多源会增加切换时间

### 4. 错误处理
- 系统会自动重试 2 次
- 超过重试次数后标记为不可播放
- 用户可以手动清除"不可播放"标记

## 远程数据格式

远程 JSON 文件中的电台数据格式：

```json
[
  {
    "id": "remote-1",
    "name": "远程电台名称",
    "description": "电台描述",
    "streamUrl": "https://source1.com/stream.m3u8#https://source2.com/stream.mp3",
    "coverUrl": "https://example.com/cover.jpg",
    "tags": ["标签1", "标签2"],
    "category": "music",
    "frequency": "FM 100.0",
    "gain": 1.0,
    "fallbackStreamUrl": "https://backup.com/stream.mp3"
  }
]
```

## 测试建议

### 1. 测试单个播放源
```typescript
{
  streamUrl: 'https://example.com/stream.m3u8'
}
```

### 2. 测试多个播放源
```typescript
{
  streamUrl: 'https://example.com/stream1.m3u8#https://example.com/stream2.mp3'
}
```

### 3. 测试混合格式
```typescript
{
  streamUrl: 'https://example.com/stream.m3u8#https://example.com/stream.mp3#https://example.com/stream.aac'
}
```

### 4. 测试故障转移
1. 播放电台
2. 观察是否使用第一个源
3. 模拟第一个源失败
4. 观察是否自动切换到第二个源

## 更新日志

### v1.0.0 (当前版本)
- ✅ 支持多个播放源（使用 `#` 分隔）
- ✅ 自动故障转移
- ✅ 播放源索引管理
- ✅ 切换电台时重置播放源索引
- ✅ 错误处理优化
- ✅ 向后兼容单个 URL 格式

## 相关文件

- [types.ts](e:\temp\radiozen\types.ts) - 类型定义
- [App.tsx](e:\temp\radiozen\App.tsx) - 核心实现
- [constants.ts](e:\temp\radiozen\constants.ts) - 示例数据
- [MULTI_STREAM.md](e:\temp\radiozen\MULTI_STREAM.md) - 本文档

## 常见问题

### Q: 最多支持多少个播放源？
A: 理论上没有限制，但建议 2-3 个以获得最佳性能。

### Q: 播放源切换需要多长时间？
A: 通常在 1-2 秒内完成，取决于网络状况。

### Q: 如何查看当前使用的是哪个播放源？
A: 可以在浏览器控制台查看日志，会显示当前播放的 URL。

### Q: 可以手动切换播放源吗？
A: 目前不支持手动切换，系统会自动选择最佳源。

### Q: 如果所有播放源都失败怎么办？
A: 系统会尝试备用线路（fallbackStreamUrl）和 CORS 代理，最后标记为不可播放。

## 未来改进

- [ ] 支持手动切换播放源
- [ ] 显示当前播放源信息
- [ ] 播放源健康检查
- [ ] 智能播放源选择（基于历史成功率）
- [ ] 播放源质量评分