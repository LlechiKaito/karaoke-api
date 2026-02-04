# APIリファレンス

DAM Karaoke API Client の詳細なAPIリファレンスです。

## DAMClient クラス

### コンストラクタ

```typescript
new DAMClient(config: DAMClientConfig)
```

#### パラメータ

- `config.cdmCardNo` (string, 必須): CDMカード番号（Base64エンコード済み）
- `config.baseUrl` (string, オプション): ベースURL（デフォルト: `https://www.clubdam.com/app/damtomo/scoring`）

#### 例

```typescript
const client = new DAMClient({
  cdmCardNo: 'ODAwMDA1MTI4MjU1NDk1'
});
```

---

## メソッド

### getScoringAiList

精密採点Aiのリストを取得します。

```typescript
async getScoringAiList(options?: {
  pageNo?: number;
  detailFlg?: number;
}): Promise<ScoringListResponse>
```

#### パラメータ

- `options.pageNo` (number, オプション): ページ番号（デフォルト: 1）
  - 1ページあたり5件のデータを取得
- `options.detailFlg` (number, オプション): 詳細データフラグ
  - `0`: 基本情報のみ
  - `1`: 詳細データを含む（推奨）

#### 戻り値

`ScoringListResponse` オブジェクト

#### 例

```typescript
// 最初のページを詳細データ付きで取得
const result = await client.getScoringAiList({
  pageNo: 1,
  detailFlg: 1
});

// データを表示
result.list?.data.forEach(score => {
  console.log(`${score.songName} - ${score.totalScore}点`);
});
```

---

### getScoringById

特定の採点データをIDで取得します。

```typescript
async getScoringById(scoringAiId: string): Promise<ScoringListResponse>
```

#### パラメータ

- `scoringAiId` (string, 必須): 採点データのID

#### 戻り値

`ScoringListResponse` オブジェクト

#### 例

```typescript
const result = await client.getScoringById('2522015');
const score = result.list?.data[0];

if (score) {
  console.log(`曲名: ${score.songName}`);
  console.log(`総合点: ${score.totalScore}点`);
  console.log(`演奏日時: ${score.playDate}`);
}
```

---

### getAllScoringData

全ての採点データを取得します（ページネーション自動処理）。

```typescript
async getAllScoringData(): Promise<ScoringData[]>
```

#### 戻り値

`ScoringData[]` 配列（最大200件）

#### 注意

- DAM APIは最新200件までのデータを提供します
- 全データ取得には時間がかかる場合があります（レート制限対策のため、ページ間で500msの待機）

#### 例

```typescript
const allData = await client.getAllScoringData();

console.log(`全データ件数: ${allData.length}件`);

// 平均点を計算
const average = allData.reduce((sum, s) => sum + s.totalScore, 0) / allData.length;
console.log(`平均点: ${average.toFixed(3)}点`);

// 最高得点を取得
const best = allData.reduce((max, s) => s.totalScore > max.totalScore ? s : max);
console.log(`最高得点: ${best.songName} - ${best.totalScore}点`);
```

---

## 型定義

### ScoringData

個別の採点データを表す型です。

```typescript
interface ScoringData {
  // 基本情報
  scoringAiId: string;          // 採点データのID
  songName: string;              // 曲名
  artistName: string;            // アーティスト名
  playDate: string;              // 演奏日時（フォーマット済み）
  totalScore: number;            // 総合点（小数点3桁）

  // 採点項目
  pitchScore?: number;           // 音程（0-100）
  stabilityScore?: number;       // 安定性（0-100）
  expressionScore?: number;      // 表現力（0-100）
  rhythmScore?: number;          // リズム（0-100）
  longToneScore?: number;        // ビブラート・ロングトーン（0-100）

  // その他の属性（全てのXML属性が含まれます）
  [key: string]: any;
}
```

#### 利用可能な追加属性（一部）

- `radarChartPitch`: 音程レーダーチャート値
- `radarChartStability`: 安定性レーダーチャート値
- `radarChartExpressive`: 表現力レーダーチャート値
- `radarChartVibratoLongtone`: ビブラート・ロングトーンレーダーチャート値
- `radarChartRhythm`: リズムレーダーチャート値
- `kobushiCount`: こぶしの回数
- `shakuriCount`: しゃくりの回数
- `fallCount`: フォールの回数
- `vibratoCount`: ビブラートの回数
- `vibratoTotalSecond`: ビブラートの合計秒数
- `aiSensitivityPoints`: AI感性点数
- `lastPerformKey`: 演奏したキー（例: "+2", "-1"）

全ての属性は `ScoringData` オブジェクトの `[key: string]: any` インデックスシグネチャからアクセス可能です。

---

### ScoringListResponse

APIレスポンスを表す型です。

```typescript
interface ScoringListResponse {
  status: string;                // ステータス（"OK" または "NG"）
  statusCode: string;            // ステータスコード（"0000" = 成功）
  list?: {
    data: ScoringData[];         // 採点データの配列
  };
  hasNext?: number;              // 次のページがあるか（1 = あり、0 = なし）
}
```

---

### DAMClientConfig

DAMClientのコンストラクタ設定です。

```typescript
interface DAMClientConfig {
  cdmCardNo: string;             // CDMカード番号（必須）
  baseUrl?: string;              // ベースURL（オプション）
}
```

---

## エラーハンドリング

```typescript
try {
  const result = await client.getScoringAiList({ detailFlg: 1 });

  if (result.status === 'NG') {
    console.error('APIエラー:', result.statusCode);
    return;
  }

  // データ処理

} catch (error) {
  console.error('リクエストエラー:', error);
}
```

### よくあるエラー

| ステータスコード | 意味 | 対処法 |
|------------------|------|--------|
| `1000` | CDMカード番号のスクランブル解除失敗 | cdmCardNoを確認 |
| `0000` | 成功 | - |

---

## 使用例

### 曲別の統計を取得

```typescript
const allData = await client.getAllScoringData();

// 曲ごとにグループ化
const songStats = allData.reduce((acc, score) => {
  const key = `${score.songName} - ${score.artistName}`;
  if (!acc[key]) {
    acc[key] = {
      scores: [],
      best: 0,
      worst: 100,
      count: 0
    };
  }

  acc[key].scores.push(score.totalScore);
  acc[key].best = Math.max(acc[key].best, score.totalScore);
  acc[key].worst = Math.min(acc[key].worst, score.totalScore);
  acc[key].count++;

  return acc;
}, {} as Record<string, any>);

// 最も歌った曲
const mostSung = Object.entries(songStats)
  .sort(([, a], [, b]) => b.count - a.count)[0];

console.log(`最も歌った曲: ${mostSung[0]} (${mostSung[1].count}回)`);
```

### 月別の統計

```typescript
const allData = await client.getAllScoringData();

// 月別にグループ化
const monthlyStats = allData.reduce((acc, score) => {
  const month = score.playDate.substring(0, 7); // "2025-11"
  if (!acc[month]) {
    acc[month] = [];
  }
  acc[month].push(score.totalScore);
  return acc;
}, {} as Record<string, number[]>);

// 月別平均点
Object.entries(monthlyStats).forEach(([month, scores]) => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  console.log(`${month}: 平均 ${avg.toFixed(3)}点 (${scores.length}回)`);
});
```

---

## レート制限

DAM APIには公式のレート制限情報はありませんが、サーバーに負荷をかけないよう、以下の対策を実装しています：

- `getAllScoringData()` メソッドは各ページ取得間に500msの待機時間を設定
- 大量のリクエストを送信する場合は、適切な間隔を設けることを推奨

---

## 参考リンク

- [セットアップガイド](./setup-guide.md)
- [DAM★とも公式サイト](https://www.clubdam.com)
