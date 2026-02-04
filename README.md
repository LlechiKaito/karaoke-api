# DAM Karaoke API Client

DAM★ともの採点データを取得する非公式APIクライアント（TypeScript/Node.js）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 概要

このプロジェクトは、カラオケDAM★ともの精密採点データをプログラムから取得するためのAPIクライアントです。

### 取得できるデータ

- 🎤 **基本情報**: 曲名、アーティスト名、演奏日時、総合点
- 🎯 **レーダーチャート**: 音程、安定性、表現力、リズム、ビブラート/ロングトーン
- 🎵 **ビブラート**: 回数、上手さ、合計秒数、タイプ（14種類）
- 🎨 **表現テクニック**: こぶし、しゃくり、フォール、抑揚
- 📈 **詳細分析**: 音程グラフ（24セクション）、全国平均との比較
- 📊 **その他**: ロングトーンスキル、リズムタイミング、キー設定など

**全148-187個の属性が利用可能！**

### 主な機能

- ✅ **3つの採点タイプに対応**
  - 精密採点Ai ✅ 動作確認済み
  - 精密採点Ai Hearts ✅ 動作確認済み
  - 精密採点DX-G ✅ 動作確認済み（cdmToken必要）
- ✅ **詳細データ取得**
  - レーダーチャート、ビブラート、表現テクニックなど148-187項目
  - デフォルト出力が詳細表示に対応
- ✅ **CSV出力機能**
  - Excel対応（BOM付きUTF-8）
  - 主要32項目を自動出力
  - タイムスタンプ付きファイル名
- ✅ **点数順ソート**
  - 最新順または点数順で表示可能
  - 高得点の曲を簡単に確認
- ✅ **精密集計DX-G履歴取得**（NEW!）
  - 公式API制限（200件）を超えて全履歴取得可能
  - 精密集計DX-Gサイトから直接スクレイピング
  - CSV出力対応
- ✅ 採点データリストの取得（ページネーション対応）
- ✅ 特定の採点データをIDで取得
- ✅ 全データの一括取得（公式API: 最大200件）
- ✅ XMLからJSONへの自動変換
- ✅ TypeScript型定義完備

## クイックスタート

### 1. インストール

```bash
git clone <このリポジトリのURL>
cd karaoke-api
npm install
```

### 2. CDMカード番号の取得

詳しい手順は **[セットアップガイド](./docs/setup-guide.md)** を参照してください。

**簡易版:**
1. ブラウザで [DAM★とも](https://www.clubdam.com) にログイン
2. 開発者ツール（F12）を開く
3. ネットワークタブで `CalorieHistoryListXML.do` のレスポンスを確認
4. レスポンス内の `<cdmCardNo>ここの値</cdmCardNo>` をコピー

### 3. CDMトークンの取得（精密採点DX-G使用時のみ必要）

精密採点DX-G（公式API経由）を使用する場合のみ必要です。

**⚠️ 注意:** 精密集計DX-G**履歴取得**（`npm run dxg:history`）を使う場合は不要です。

**取得手順:**
1. ブラウザで [DAM★とも](https://www.clubdam.com) にログイン
2. 開発者ツール（F12）を開いてネットワークタブを選択
3. DX-Gの採点履歴ページにアクセス
4. ネットワークタブで `GetScoringDxgListXML.do` のリクエストを探す
5. リクエストの **Query String Parameters** から `cdmToken` の値をコピー

### 4. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集:
```
# 必須
CDM_CARD_NO=取得したcdmCardNoをここに貼り付け

# 精密採点DX-G（公式API）を使う場合のみ必要
CDM_TOKEN=取得したcdmTokenをここに貼り付け

# 精密集計DX-G履歴取得を使う場合のみ必要
DXG_HISTORY_USERNAME=あなたのユーザー名
```

**各項目の説明:**

| 環境変数 | 必須 | 用途 |
|---------|------|------|
| `CDM_CARD_NO` | ✅ 必須 | 全ての機能で必要 |
| `CDM_TOKEN` | ⚠️ 条件付き | 精密採点DX-G（`dev:dxg`, `export:csv:dxg`）使用時のみ |
| `DXG_HISTORY_USERNAME` | ⚠️ 条件付き | 精密集計DX-G履歴取得（`dxg:history`）使用時のみ |

**ユーザー名の確認方法（精密集計DX-G履歴取得時のみ必要）:**
1. [DAM★とも マイページ](https://www.clubdam.com/app/damtomo/MyPage.do) にアクセス
2. ページ上部に表示される「{ユーザー名}さん」の部分を確認
3. この`{ユーザー名}`を`.env`の`DXG_HISTORY_USERNAME`に設定

### 5. 実行

```bash
npm run dev
```

## 使い方

### 基本的な使用例

```typescript
import { DAMClient } from './damClient';

const client = new DAMClient({
  cdmCardNo: process.env.CDM_CARD_NO!,
  cdmToken: process.env.CDM_TOKEN  // DX-G使用時
});

// 最新5件を取得
const result = await client.getScoringAiList({ detailFlg: 1 });
result.list?.data.forEach(score => {
  console.log(`${score.songName} - ${score.totalScore}点`);

  // 詳細データにアクセス
  console.log(`ビブラート: ${(score as any).vibratoCount}回`);
  console.log(`こぶし: ${(score as any).kobushiCount}回`);
  console.log(`しゃくり: ${(score as any).shakuriCount}回`);
});
```

### 全データを取得

```typescript
// 最大200件の全データを取得
const allData = await client.getAllScoringData();
console.log(`総データ数: ${allData.length}件`);

// 平均点を計算
const average = allData.reduce((sum, s) => sum + s.totalScore, 0) / allData.length;
console.log(`平均点: ${average.toFixed(3)}点`);
```

### 特定のIDで取得

```typescript
const result = await client.getScoringById('2522015');
const score = result.list?.data[0];
console.log(`曲名: ${score.songName}`);
console.log(`総合点: ${score.totalScore}点`);
```

### 精密集計DX-Gから全履歴を取得（200件以上対応）

```typescript
import { DxgHistoryClient } from './dxgHistoryClient';

const client = new DxgHistoryClient('YOUR_USERNAME');

// 全履歴を取得（200件以上も可能）
const allHistory = await client.getAllHistory();
console.log(`総データ数: ${allHistory.length}件`);

// 点数でソート
const topScores = allHistory
  .sort((a, b) => b.totalScore - a.totalScore)
  .slice(0, 10);

topScores.forEach(record => {
  console.log(`${record.songName} - ${record.totalScore}点`);
  console.log(`素点: ${record.baseScore}点 + ボーナス: ${record.bonusScore}点`);
});
```

**注意**: 公式DAM APIは最大200件の制限がありますが、精密集計DX-Gからの取得は制限なく全履歴を取得できます。

## ドキュメント

- 📘 [セットアップガイド](./docs/setup-guide.md) - cdmCardNo の取得方法を詳しく解説
- 📙 [APIリファレンス](./docs/api-reference.md) - 全メソッドと型定義の詳細
- 📕 [採点タイプについて](./docs/scoring-types.md) - 3つの採点タイプの違いと使い方
- 📗 [サンプルコード](./examples/) - 実装例

## コマンド

### 基本コマンド

| コマンド | 説明 |
|---------|------|
| `npm run build` | TypeScriptをビルド |
| `npm start` | ビルド済みコードを実行 |

### 採点データ取得（詳細表示）

| コマンド | 説明 |
|---------|------|
| `npm run dev:ai` | 精密採点Ai（最新5件・詳細） |
| `npm run dev:ai-all` | 精密採点Ai（全データ・統計） |
| `npm run dev:ai-score` | 精密採点Ai（点数上位5件） |
| `npm run dev:ai-all-score` | 精密採点Ai（全データ・点数順） |
| `npm run dev:hearts` | 精密採点Ai Hearts（最新5件・詳細） |
| `npm run dev:hearts-all` | 精密採点Ai Hearts（全データ・統計） |
| `npm run dev:hearts-score` | 精密採点Ai Hearts（点数上位5件） |
| `npm run dev:hearts-all-score` | 精密採点Ai Hearts（全データ・点数順） |
| `npm run dev:dxg` | 精密採点DX-G（最新5件・詳細） |
| `npm run dev:dxg-all` | 精密採点DX-G（全データ・統計） |
| `npm run dev:dxg-score` | 精密採点DX-G（点数上位5件） |
| `npm run dev:dxg-all-score` | 精密採点DX-G（全データ・点数順） |

### CSV出力

| コマンド | 説明 |
|---------|------|
| `npm run export:csv:ai` | 精密採点AiをCSV出力 |
| `npm run export:csv:hearts` | 精密採点Ai HeartsをCSV出力 |
| `npm run export:csv:dxg` | 精密採点DX-GをCSV出力 |

**件数を制限したい場合:**

スクリプトに直接`--limit`パラメータを指定できます。

```bash
# 精密採点Aiの上位5件のみCSV出力
npx ts-node src/exportCsv.ts --type=ai --limit=5

# 精密採点Heartsの上位10件のみCSV出力
npx ts-node src/exportCsv.ts --type=ai-hearts --limit=10

# 精密採点DX-Gの上位20件のみCSV出力
npx ts-node src/exportCsv.ts --type=dx-g --limit=20
```

**用途:**
- テスト時に少量データで動作確認したい場合
- 最新の数件だけをすぐに確認したい場合
- 高得点の上位データのみを抽出したい場合

### 精密集計DX-G履歴取得（200件以上対応）

| コマンド | 説明 |
|---------|------|
| `npm run dxg:history` | 精密集計DX-Gから最新50件取得 |
| `npm run dxg:history:all` | 精密集計DX-Gから全履歴取得 |
| `npm run dxg:history:csv` | 精密集計DX-Gの全履歴をCSV出力 |

#### セットアップ（初回のみ）

精密集計DX-G履歴取得を使用するには、ユーザー名の設定が必要です。

**1. ユーザー名を確認:**
1. [DAM★とも マイページ](https://www.clubdam.com/app/damtomo/MyPage.do) にアクセス
2. ページ上部に「**〇〇〇〇さん**」と表示されている部分を確認
3. 「さん」の前の部分があなたのユーザー名です

**2. 環境変数に設定:**

`.env`ファイルを開いて、以下の行を追加または編集:
```
DXG_HISTORY_USERNAME=あなたのユーザー名
```

例: マイページに「LLENNさん」と表示されている場合
```
DXG_HISTORY_USERNAME=LLENN
```

**3. 動作確認:**
```bash
npm run dxg:history
```

データが取得できれば設定完了です！

**件数を制限したい場合:**

```bash
# 上位5件のみCSV出力
npx ts-node src/exportDxgHistory.ts --limit=5

# 上位10件のみCSV出力
npx ts-node src/exportDxgHistory.ts --limit=10
```

### サンプル実行

| コマンド | 説明 |
|---------|------|
| `npm run example:basic` | 基本的な使い方 |
| `npm run example:stats` | 統計情報の取得 |
| `npm run example:detail` | 詳細データの表示 |
| `npm run example:detail:ai` | Aiの詳細データ |
| `npm run example:detail:hearts` | Heartsの詳細データ |
| `npm run example:detail:dxg` | DX-Gの詳細データ |

## プロジェクト構成

```
karaoke-api/
├── src/
│   ├── damClient.ts         # DAM 公式APIクライアント
│   ├── dxgHistoryClient.ts  # 精密集計DX-G履歴取得クライアント
│   ├── types.ts             # 型定義
│   ├── index.ts             # メインファイル（公式API）
│   ├── getDxgHistory.ts     # 精密集計DX-G履歴取得
│   ├── exportCsv.ts         # 公式API CSV出力
│   └── exportDxgHistory.ts  # 精密集計DX-G CSV出力
├── docs/
│   ├── setup-guide.md       # セットアップガイド
│   ├── api-reference.md     # APIリファレンス
│   └── csv-export.md        # CSV出力ガイド
├── output/                   # CSV出力先ディレクトリ
├── .env.example             # 環境変数のテンプレート
├── .env                     # 環境変数（個人設定、Gitにはコミットしない）
├── tsconfig.json            # TypeScript設定
├── package.json             # プロジェクト設定
└── README.md                # このファイル
```

## セキュリティについて

⚠️ **重要な注意事項**

- `cdmCardNo` はあなたのアカウントにアクセスするための認証情報です
- `.env` ファイルは **絶対に公開しないでください**
- Gitリポジトリにコミットしないでください（`.gitignore`に含まれています）
- 他の人と共有しないでください

## 免責事項

- これは **非公式** のAPIクライアントです
- DAM★ともの公式APIではありません
- 利用は **自己責任** でお願いします
- DAM★ともの利用規約を遵守してください
- サーバーに負荷をかけないよう、適切な間隔でリクエストしてください

## トラブルシューティング

### エラー: "CDMカード番号のスクランブル解除に失敗しました"

→ [セットアップガイド](./docs/setup-guide.md) を参照して、正しい `cdmCardNo` を取得してください

### ネットワークタブにリクエストが表示されない

→ ページをリロードするか、フィルターを「All」に変更してください

### 精密採点DX-G（公式API）でエラーが出る

→ 以下を確認してください：
1. `.env`に`CDM_TOKEN`が設定されているか
2. `CDM_TOKEN`が正しいか（GetScoringDxgListXML.do のリクエストから取得）
3. トークンが期限切れの場合は、再度取得し直してください

**注意:** 精密採点DX-Gの公式API（`npm run dev:dxg`, `npm run export:csv:dxg`）を使う場合は`CDM_TOKEN`が必要です。

### 精密集計DX-G履歴でデータが取得できない

→ 以下を確認してください：
1. `.env`に`DXG_HISTORY_USERNAME`が設定されているか
2. ユーザー名が正しいか（[マイページ](https://www.clubdam.com/app/damtomo/MyPage.do)で確認）
3. 精密集計DX-Gに登録済みか（https://dx-g.clubdam.info/user/{ユーザー名} にアクセス可能か）

### 公式APIで200件しか取得できない

→ 公式DAM APIの仕様制限です。200件以上取得したい場合は精密集計DX-G履歴取得機能（`npm run dxg:history:all`）を使用してください。

### その他の問題

→ [APIリファレンス](./docs/api-reference.md) のエラーハンドリングセクションを確認してください

## ライセンス

MIT License

## 参考資料

- [DAMカラオケ採点Aiデータを取得してみた - Qiita](https://qiita.com/KadoProG/items/0bfe392945968ec76204)
- [DAMの精密採点Aiの結果をGASで取得した話 - Zenn](https://zenn.dev/yusama125718/articles/71ca4a361b4188)

## 貢献

Issue や Pull Request は歓迎します！

---

**注意:** このプロジェクトは教育目的で作成されたものです。商用利用や大量のリクエスト送信はご遠慮ください。
