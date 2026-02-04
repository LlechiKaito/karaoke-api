import { DxgHistoryClient } from './dxgHistoryClient';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// コマンドライン引数から取得
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
let limit: number | undefined = undefined;

if (limitArg) {
  const limitValue = parseInt(limitArg.split('=')[1]);
  if (!isNaN(limitValue) && limitValue > 0) {
    limit = limitValue;
  }
}

async function exportToCSV() {
  const username = process.env.DXG_HISTORY_USERNAME || 'YOUR_USERNAME';
  const outputPath = './output';

  const client = new DxgHistoryClient(username);

  console.log(`=== 精密集計DX-G CSV出力 [${username}] ===\n`);

  try {
    if (limit) {
      console.log(`最新${limit}件のデータを取得中...`);
    } else {
      console.log('全データを取得中...');
    }
    const allData = await client.getAllHistory();

    console.log(`取得完了: ${allData.length}件\n`);

    if (allData.length === 0) {
      console.log('データが存在しません');
      return;
    }

    // 点数順（降順）にソート
    const sortedData = allData.sort((a, b) => b.totalScore - a.totalScore);

    // limitが指定されている場合は制限
    const exportData = limit ? sortedData.slice(0, limit) : sortedData;

    // CSV変換
    const csv = convertToCSV(exportData);

    // 出力ディレクトリを作成
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // ファイル名を生成（タイムスタンプ付き）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const limitSuffix = limit ? `_limit${limit}` : '';
    const filename = `dxg_history_${username}${limitSuffix}_${timestamp}.csv`;
    const filepath = path.join(outputPath, filename);

    // ファイルに書き込み
    fs.writeFileSync(filepath, csv, 'utf-8');

    console.log(`✅ CSV出力完了`);
    console.log(`ファイル: ${filepath}`);
    console.log(`データ数: ${exportData.length}件`);

    // 統計情報
    const avgScore = exportData.reduce((sum, r) => sum + r.totalScore, 0) / exportData.length;
    const maxScore = exportData.reduce((max, r) => r.totalScore > max.totalScore ? r : max);
    const minScore = exportData.reduce((min, r) => r.totalScore < min.totalScore ? r : min);

    console.log(`\n📊 統計情報:`);
    console.log(`平均点: ${avgScore.toFixed(3)}点`);
    console.log(`最高点: ${maxScore.totalScore}点 (${maxScore.songName})`);
    console.log(`最低点: ${minScore.totalScore}点 (${minScore.songName})`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

function convertToCSV(data: any[]): string {
  // CSVヘッダー
  const headers = [
    'No',
    '日付',
    '曲名',
    'アーティスト',
    '総合点',
    '素点',
    'ボーナス',
    '音程',
    '安定性',
    '表現力',
    'リズム',
    'ビブラート/ロングトーン',
    'ビブラート秒数',
    'ビブラート回数',
    'ビブラートタイプ',
    'リクエストNo',
  ];

  const rows = data.map(record => [
    escapeCSV(record.no),
    escapeCSV(record.date),
    escapeCSV(record.songName),
    escapeCSV(record.artistName),
    record.totalScore,
    record.baseScore,
    record.bonusScore,
    record.pitch,
    record.stability,
    record.expression,
    record.rhythm,
    record.vibratoLongtone,
    record.vibratoSeconds || '',
    record.vibratoCount || '',
    escapeCSV(record.vibratoType || ''),
    escapeCSV(record.requestNo || ''),
  ]);

  // CSV文字列を生成
  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];

  // BOM付きUTF-8（Excelで正しく開くため）
  return '\ufeff' + csvLines.join('\n');
}

function escapeCSV(value: string): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // カンマ、改行、ダブルクォートが含まれる場合はダブルクォートで囲む
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// 実行
exportToCSV();
