#!/bin/bash
# Netlify 构建脚本

set -e  # 遇到错误立即退出

echo "📦 Installing dependencies..."
cd my-app
npm install

echo "🏗️  Building Expo web app..."
npx expo export --platform web

echo "📋 Copying _redirects file..."
if [ -f "public/_redirects" ]; then
  cp public/_redirects dist/_redirects
  echo "✅ _redirects file copied successfully"
else
  echo "⚠️  _redirects file not found in public/, creating default..."
  echo "/*    /index.html   200" > dist/_redirects
fi

echo "✅ Build completed successfully!"

