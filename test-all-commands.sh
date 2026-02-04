#!/bin/bash

echo "========================================="
echo "全コマンドテスト開始"
echo "========================================="
echo ""

# ビルドテスト
echo "1. Build test..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ build: OK"
else
    echo "❌ build: FAILED"
fi
echo ""

# 基本的なデータ取得コマンド（最新5件のみ）
echo "2. dev:ai (最新5件)..."
npm run dev:ai 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:ai: OK"
else
    echo "❌ dev:ai: FAILED"
fi
echo ""

echo "3. dev:ai-score (点数上位5件)..."
npm run dev:ai-score 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:ai-score: OK"
else
    echo "❌ dev:ai-score: FAILED"
fi
echo ""

echo "4. dev:hearts (最新5件)..."
npm run dev:hearts 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:hearts: OK"
else
    echo "❌ dev:hearts: FAILED"
fi
echo ""

echo "5. dev:hearts-score (点数上位5件)..."
npm run dev:hearts-score 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:hearts-score: OK"
else
    echo "❌ dev:hearts-score: FAILED"
fi
echo ""

echo "6. dev:dxg (最新5件)..."
npm run dev:dxg 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:dxg: OK"
else
    echo "❌ dev:dxg: FAILED"
fi
echo ""

echo "7. dev:dxg-score (点数上位5件)..."
npm run dev:dxg-score 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:dxg-score: OK"
else
    echo "❌ dev:dxg-score: FAILED"
fi
echo ""

echo "8. dxg:history (精密集計DX-G)..."
npm run dxg:history 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dxg:history: OK"
else
    echo "❌ dxg:history: FAILED"
fi
echo ""

echo "========================================="
echo "テスト完了"
echo "========================================="
echo ""
echo "注意: 以下のコマンドはスキップしました（時間がかかるため）:"
echo "  - dev:*-all (全データ取得)"
echo "  - export:csv:* (CSV出力)"
echo "  - dxg:history:all (全履歴取得)"
echo "  - dxg:history:csv (CSV出力)"
echo "  - example:* (サンプルスクリプト)"
echo "  - test:* (テストスクリプト)"
echo ""
echo "これらは個別に実行してテストしてください。"
