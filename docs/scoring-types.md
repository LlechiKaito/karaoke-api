# 採点タイプについて

DAM APIクライアントは複数の採点タイプに対応しています。

## サポート状況

| 採点タイプ | コマンド | ステータス | エンドポイント |
|-----------|---------|-----------|---------------|
| **精密採点Ai** | `npm run dev:ai` | ✅ 動作確認済み | `GetScoringAiListXML.do` |
| **精密採点Ai Hearts** | `npm run dev:hearts` | ✅ 動作確認済み | `GetScoringHeartsListXML.do` |
| **精密採点DX-G** | `npm run dev:dxg` | ✅ 実装済み | `GetScoringDxgListXML.do` |

## 使い方

### 精密採点Ai

最新の5件を取得:
```bash
npm run dev:ai
```

全データを取得（最大200件）:
```bash
npm run dev:ai-all
```

### 精密採点Ai Hearts

最新の5件を取得:
```bash
npm run dev:hearts
```

全データを取得（最大200件）:
```bash
npm run dev:hearts-all
```

### 精密採点DX-G

✅ **実装完了・動作確認済み**: エンドポイント `GetScoringDxgListXML.do` を使用します。

⚠️ **重要**: DX-Gは `cdmToken` が必要です。

**cdmTokenの取得方法:**
1. ブラウザでDAM★ともにログイン
2. DX-Gの採点履歴ページを開く
3. 開発者ツール（F12）→ Networkタブ
4. `GetScoringDxgListXML.do` のリクエストを探す
5. Query String Parameters の `cdmToken` の値をコピー
6. `.env` ファイルに `CDM_TOKEN=値` を追加

最新の5件を取得:
```bash
npm run dev:dxg
```

全データを取得（最大200件）:
```bash
npm run dev:dxg-all
```

## プログラムから使用する

```typescript
import { DAMClient } from './damClient';

const client = new DAMClient({
  cdmCardNo: process.env.CDM_CARD_NO!
});

// 精密採点Ai
const aiData = await client.getScoringAiList({ detailFlg: 1 });

// 精密採点Ai Hearts
const heartsData = await client.getScoringHeartslist({ detailFlg: 1 });

// 精密採点DX-G
const dxgData = await client.getScoringDxGList({ detailFlg: 1 });

// 汎用メソッド（推奨）
const data = await client.getScoringList('ai', { detailFlg: 1 });
const hearts = await client.getScoringList('ai-hearts', { detailFlg: 1 });
const dxg = await client.getScoringList('dx-g', { detailFlg: 1 });

// 全データ取得
const allAi = await client.getAllScoringData('ai');
const allHearts = await client.getAllScoringData('ai-hearts');
const allDxg = await client.getAllScoringData('dx-g');
```

## 各採点タイプの違い

### 精密採点Ai
- 最新の精密採点システム
- 音程、安定性、表現力、リズム、ビブラート/ロングトーンの5項目評価
- AI感性点数あり

### 精密採点Ai Hearts
- LIVE DAM WAO!で利用可能
- AIレーダーチャートに「感情表現」が追加
- より細かいデータ分析が可能

### 精密採点DX-G
- 旧世代の精密採点システム
- エンドポイント: `GetScoringDxgListXML.do`
- **cdmToken が必要**（セッショントークン）
- データ構造はAiと同じ（`<scoring>` 要素）
- ID属性: `scoringDxgId`
- 追加パラメータ: `dxgType=1`, `enc=sjis`, `UTCserial`

## トラブルシューティング

### 「りれきの閲覧が許可されておりません」(E000) エラー

DX-Gで以下のエラーが返される場合：

**原因:**
1. **DX-Gのデータが存在しない** - DX-Gで歌ったことがない
2. **履歴が非公開** - プライバシー設定で非公開になっている
3. **権限の問題** - API経由での閲覧が許可されていない

**確認方法:**
1. ブラウザでDAM★ともにログイン
2. DX-Gの採点履歴ページを開く
3. データが見れるか確認
4. 見れる場合 → 公開設定を確認
5. 見れない場合 → DX-Gのデータが存在しない

### 404エラーが返される

以下の原因が考えられます：

1. **エンドポイント名が違う**: API仕様が変更された可能性
2. **機種が対応していない**: そのタイプの採点に対応していない機種で歌った

### データの構造が異なる

各採点タイプでXMLレスポンスの構造が異なります：

- **Ai**: `<scoring>` 要素
- **Hearts**: `<scoringHearts>` 要素
- **DX-G**: `<dxgHistory>` 要素（推測）

パース処理は自動的に適切な要素を選択しますが、問題がある場合はIssueを報告してください。

## 貢献

新しい採点タイプやエンドポイントの情報をお持ちの方は、ぜひPull Requestやissueで情報を共有してください！
