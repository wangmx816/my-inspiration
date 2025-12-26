# 故障排除指南

## localhost 拒绝连接

### 问题
浏览器显示 "localhost 拒绝连接" 或无法访问开发服务器。

### 解决方案

1. **检查服务器是否运行**
   ```bash
   # 检查端口占用
   netstat -ano | findstr ":8081"
   ```

2. **重启开发服务器**
   ```bash
   cd my-app
   npx expo start --clear
   ```

3. **如果端口被占用，使用其他端口**
   ```bash
   npx expo start --port 8082
   ```

4. **检查防火墙设置**
   - 确保防火墙允许 Node.js 访问网络
   - Windows: 控制面板 > Windows Defender 防火墙 > 允许应用通过防火墙

5. **清除缓存并重新安装依赖**
   ```bash
   cd my-app
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

### 访问应用

启动成功后，可以通过以下方式访问：

1. **Web 浏览器**: 
   - `http://localhost:8081` (默认)
   - 或查看终端显示的 URL

2. **移动设备**:
   - 扫描终端显示的 QR 码
   - 使用 Expo Go 应用

3. **快捷键**:
   - 在终端按 `w` 打开 Web 版本
   - 按 `a` 打开 Android 模拟器
   - 按 `i` 打开 iOS 模拟器

### 常见错误

1. **端口已被占用**
   - 解决方案: 使用 `--port` 参数指定其他端口

2. **模块未找到**
   - 解决方案: 运行 `npm install` 重新安装依赖

3. **缓存问题**
   - 解决方案: 使用 `--clear` 参数清除缓存

4. **网络连接问题**
   - 解决方案: 检查网络设置和代理配置




