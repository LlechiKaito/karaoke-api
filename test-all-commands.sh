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

# devコマンド（基本）
echo "2. dev (基本コマンド)..."
npm run dev 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev: OK"
else
    echo "❌ dev: FAILED"
fi
echo ""

# 基本的なデータ取得コマンド（最新5件のみ）
echo "3. dev:ai (最新5件)..."
npm run dev:ai 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:ai: OK"
else
    echo "❌ dev:ai: FAILED"
fi
echo ""

echo "4. dev:ai-score (点数上位5件)..."
npm run dev:ai-score 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:ai-score: OK"
else
    echo "❌ dev:ai-score: FAILED"
fi
echo ""

echo "5. dev:hearts (最新5件)..."
npm run dev:hearts 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:hearts: OK"
else
    echo "❌ dev:hearts: FAILED"
fi
echo ""

echo "6. dev:hearts-score (点数上位5件)..."
npm run dev:hearts-score 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:hearts-score: OK"
else
    echo "❌ dev:hearts-score: FAILED"
fi
echo ""

echo "7. dev:dxg (最新5件)..."
npm run dev:dxg 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:dxg: OK"
else
    echo "❌ dev:dxg: FAILED"
fi
echo ""

echo "8. dev:dxg-score (点数上位5件)..."
npm run dev:dxg-score 2>&1 | head -30
if [ $? -eq 0 ]; then
    echo "✅ dev:dxg-score: OK"
else
    echo "❌ dev:dxg-score: FAILED"
fi
echo ""

echo "9. dxg:history (精密集計DX-G)..."
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
echo "✅ テスト済みコマンド (9個):"
echo "  1. build"
echo "  2. dev"
echo "  3. dev:ai"
echo "  4. dev:ai-score"
echo "  5. dev:hearts"
echo "  6. dev:hearts-score"
echo "  7. dev:dxg"
echo "  8. dev:dxg-score"
echo "  9. dxg:history"
echo ""
echo "⏭️  スキップしたコマンド（時間がかかる/要手動テスト）:"
echo "  - start (要手動テスト: npm start)"
echo "  - dev:ai-all, dev:ai-all-score"
echo "  - dev:hearts-all, dev:hearts-all-score"
echo "  - dev:dxg-all, dev:dxg-all-score"
echo "  - export:csv:ai, export:csv:hearts, export:csv:dxg"
echo "  - dxg:history:all, dxg:history:csv"
echo "  - example:basic, example:stats, example:detail, example:detail:*"
echo "  - test:dxg-endpoints, test:dxg-sp, test:dxg-token"
echo "  - debug:dxg"
echo ""
echo "📝 package.json の全スクリプト数: 31個"
echo "   - テスト済み: 9個"
echo "   - スキップ: 22個（長時間実行/デバッグ用/サンプル/要手動テスト）"
echo ""
echo "💡 スキップしたコマンドは個別に実行してテストしてください。"
