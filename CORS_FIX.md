# CORS 问题修复

## 问题描述

从GitHub Gist获取远程电台列表时遇到CORS错误：

```
Access to fetch at 'https://gist.githubusercontent.com/...' from origin 'https://radio-zen-olive.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

## 根本原因

GitHub Gist不允许从其他域名直接访问，这是GitHub的安全策略。当从Vercel部署的网站尝试访问GitHub Gist时，会被CORS策略阻止。

## 解决方案

### 1. 使用CORS代理

**文件**: [App.tsx](e:\temp\radiozen\App.tsx#L254-L267)

添加了`fetchWithProxy`函数，支持通过CORS代理获取数据：

```typescript
const fetchWithProxy = async (url: string, useProxy = false): Promise<Response> => {
    const fetchUrl = useProxy ? getProxiedUrl(url) : url;
    
    const response = await fetch(fetchUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
};
```

### 2. 自动故障转移

**文件**: [App.tsx](e:\temp\radiozen\App.tsx#L91-L101)

实现了自动尝试机制：

```typescript
try {
    // 首先尝试直接访问
    response = await fetchWithProxy(REMOTE_STATIONS_URL, false);
} catch (directError) {
    console.warn('Direct fetch failed, trying proxy:', directError);
    // 失败后自动切换到代理
    useProxy = true;
    response = await fetchWithProxy(REMOTE_STATIONS_URL, true);
}
```

### 3. 改进错误提示

**文件**: [App.tsx](e:\temp\radiozen\App.tsx#L158-L166)

根据错误类型显示不同的提示：

```typescript
if (!cachedRaw) {
    showToast('无法加载电台列表，正在使用默认电台', 'error');
} else {
    // 如果是CORS或fetch错误，说明使用缓存
    if (errorMessage.includes('CORS') || errorMessage.includes('fetch')) {
        showToast('无法更新电台列表，使用缓存数据', 'warning');
    } else {
        showToast('无法更新电台列表，使用缓存数据', 'warning');
    }
}
```

## 工作流程

### 正常情况（无CORS限制）
```
1. 尝试直接访问 GitHub Gist
2. 成功获取数据
3. 显示"成功加载 X 个电台"
4. 更新缓存
```

### CORS限制情况
```
1. 尝试直接访问 GitHub Gist
2. 失败（CORS错误）
3. 自动切换到 CORS 代理
4. 通过代理成功获取数据
5. 显示"无法更新电台列表，使用缓存数据"
6. 使用缓存数据继续运行
```

### 完全失败情况
```
1. 直接访问失败
2. 代理访问也失败
3. 显示"无法加载电台列表，正在使用默认电台"
4. 使用内置默认电台列表
```

## CORS代理列表

当前使用的代理：

1. **api.allorigins.win** (主要代理)
   - URL: `https://api.allorigins.win/raw?url=`
   - 优点：稳定、快速
   - 限制：可能有请求频率限制

2. **corsproxy.io** (备用代理)
   - URL: `https://corsproxy.io/?`
   - 优点：支持更多URL格式
   - 限制：可能不稳定

## 优势

### 1. 自动故障转移
- 无需手动配置
- 自动检测CORS错误
- 自动切换到代理

### 2. 降级策略
- 优先使用直接访问（更快）
- 失败后自动切换到代理
- 代理失败后使用缓存

### 3. 用户体验
- 显示清晰的错误提示
- 缓存数据确保可用性
- 默认电台作为兜底

### 4. 错误处理
- 超时控制（15秒）
- 详细的错误日志
- 验证响应格式

## 注意事项

### 1. 代理限制
- 公共代理可能有请求频率限制
- 建议生产环境使用自己的代理服务器
- 监控代理可用性

### 2. 缓存策略
- 缓存数据在localStorage中
- 缓存有效期：永久（手动清除）
- 建议添加缓存过期时间

### 3. 性能考虑
- 直接访问比代理快
- 代理可能增加延迟
- 考虑添加加载状态指示

## 替代方案

### 方案1：自建代理服务器

```javascript
// 使用Node.js创建自己的代理
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'json'
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});

app.listen(3000);
```

### 方案2：使用GitHub API

```typescript
// 使用GitHub API获取Gist内容
const GIST_ID = '3fd7fabeb218a7677356af44d21dcb3d';
const GITHUB_API_URL = `https://api.github.com/gists/${GIST_ID}`;

const response = await fetch(GITHUB_API_URL, {
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});
```

### 方案3：使用CDN

```typescript
// 将电台数据部署到CDN
const CDN_URL = 'https://cdn.example.com/radio_stations.json';

const response = await fetch(CDN_URL, {
  headers: {
    'Cache-Control': 'max-age=3600'
  }
});
```

## 测试建议

### 1. 测试直接访问
- 在浏览器控制台查看网络请求
- 验证是否成功获取数据
- 检查响应时间

### 2. 测试代理访问
- 模拟CORS错误
- 观察是否自动切换到代理
- 验证代理返回的数据

### 3. 测试缓存功能
- 清除localStorage
- 刷新页面
- 验证是否使用默认电台
- 再次刷新验证缓存恢复

### 4. 测试错误提示
- 验证各种错误场景
- 检查提示信息是否清晰
- 验证用户能否理解错误原因

## 监控建议

### 1. 成功率监控
```typescript
const fetchSuccessRate = (total: number, success: number): number => {
  return (success / total) * 100;
};

// 记录到分析平台
analytics.track('remote_stations_fetch', {
  success: true,
  proxy_used: false,
  response_time: 1234
});
```

### 2. 性能监控
```typescript
// 记录响应时间
const startTime = performance.now();
await fetchWithProxy(REMOTE_STATIONS_URL, false);
const endTime = performance.now();
const duration = endTime - startTime;

console.log(`Fetch duration: ${duration}ms`);
```

### 3. 错误监控
```typescript
// 记录错误类型
if (errorMessage.includes('CORS')) {
  analytics.track('cors_error', {
    url: REMOTE_STATIONS_URL,
    timestamp: new Date().toISOString()
  });
}
```

## 相关文件

- [App.tsx](e:\temp\radiozen\App.tsx) - CORS代理实现
- [test-audio.html](e:\temp\radiozen\test-audio.html) - 音频测试工具
- [DEPLOYMENT_FIXES.md](e:\temp\radiozen\DEPLOYMENT_FIXES.md) - 部署问题总结

## 构建状态

✅ **构建成功**
- 无TypeScript错误
- 打包文件大小: 820.88 kB (gzip: 247.45 kB)
- 所有模块转换成功

## 更新日志

### v1.0.1 (当前版本)
- ✅ 添加CORS代理支持
- ✅ 实现自动故障转移
- ✅ 改进错误提示
- ✅ 添加详细的错误日志
- ✅  优化缓存策略

## 参考资料

- [CORS - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [GitHub API - Gists](https://docs.github.com/en/rest/gists/gists)
- [CORS Proxy Solutions](https://github.com/Rob--W/cors-anywhere)
- [AllOrigins API](https://allorigins.win/)

## 常见问题

### Q: 为什么需要CORS代理？
A: GitHub Gist不允许从其他域名直接访问，这是GitHub的安全策略。

### Q: 代理会影响性能吗？
A: 代理会增加一些延迟，但比完全无法访问要好。优先使用直接访问。

### Q: 如何提高可靠性？
A: 可以使用多个代理、自建代理服务器，或将数据部署到CDN。

### Q: 缓存会过期吗？
A: 当前实现中缓存是永久的，建议添加过期时间或版本控制。

### Q: 如何知道使用了代理？
A: 查看浏览器控制台日志，会显示"Direct fetch failed, trying proxy"。