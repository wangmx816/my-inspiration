# Web 版本说明

## 关于 index.html

Expo 项目**不需要**手动创建 `index.html` 文件。

Expo 在运行 `npx expo start --web` 时会自动生成 `index.html` 文件。这个文件位于 `.expo/web/index.html`（开发模式）或 `web-build/index.html`（构建后）。

## 如何运行 Web 版本

```bash
cd my-app
npx expo start --web
```

## 构建静态网站

如果需要构建静态网站用于部署：

```bash
cd my-app
npx expo export:web
```

构建后的文件会在 `web-build` 目录中，包括自动生成的 `index.html`。

## 自定义 Web 配置

Web 相关配置在 `app.json` 的 `web` 部分：

```json
{
  "expo": {
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

## 注意事项

- Expo 会自动处理所有 Web 相关的构建配置
- 不需要手动创建或修改 `index.html`
- 如果需要自定义 HTML 模板，可以使用 `expo-custom-web` 插件

