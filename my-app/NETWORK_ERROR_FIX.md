# 网络错误修复指南

## 错误信息
`ERR_NAME_NOT_RESOLVED` - 无法解析域名 `uu9vud59.ap-southeast.insforge.app`

## 可能的原因

### 1. 网络连接问题
- 检查网络连接是否正常
- 尝试访问其他网站确认网络可用

### 2. DNS 解析问题
- 域名无法解析
- DNS 服务器问题

### 3. InsForge 服务器问题
- InsForge 服务器可能暂时不可用
- 服务器地址可能已更改

### 4. 防火墙/代理问题
- 防火墙阻止了连接
- 代理设置问题

## 解决方案

### 方案 1: 检查网络连接
```bash
# 测试网络连接
ping uu9vud59.ap-southeast.insforge.app

# 测试 HTTPS 连接
curl -I https://uu9vud59.ap-southeast.insforge.app
```

### 方案 2: 检查 InsForge 配置
1. 确认 `.env` 文件中的 `EXPO_PUBLIC_INSFORGE_BASE_URL` 是否正确
2. 确认 InsForge 后端是否正常运行
3. 检查 InsForge 控制台中的服务器状态

### 方案 3: 使用代理或 VPN
如果在中国大陆，可能需要：
- 使用 VPN
- 配置代理
- 检查是否有网络限制

### 方案 4: 检查浏览器设置
1. 清除浏览器缓存
2. 检查浏览器代理设置
3. 尝试使用其他浏览器

### 方案 5: 临时禁用邮箱验证（仅用于开发）
如果需要快速测试，可以临时禁用邮箱验证功能。

## 当前配置

### InsForge 后端地址
```
https://uu9vud59.ap-southeast.insforge.app
```

### 环境变量
确保 `.env` 文件中设置了：
```env
EXPO_PUBLIC_INSFORGE_BASE_URL=https://uu9vud59.ap-southeast.insforge.app
EXPO_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
```

## 调试步骤

1. **检查网络连接**
   - 打开浏览器开发者工具 (F12)
   - 查看 Network 标签
   - 检查请求是否发送成功

2. **检查 DNS 解析**
   - 在命令行运行 `nslookup uu9vud59.ap-southeast.insforge.app`
   - 确认域名可以解析

3. **检查 InsForge 状态**
   - 访问 InsForge 控制台
   - 确认服务是否正常运行

4. **查看详细错误**
   - 浏览器控制台中的完整错误信息
   - Network 标签中的请求详情

## 如果问题持续

1. 联系 InsForge 支持
2. 检查 InsForge 文档中的最新配置
3. 确认服务器地址是否正确
4. 考虑使用其他 InsForge 实例或区域




