import { DAMClient } from './damClient';
import { ScoringType, ScoringData } from './types';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// コマンドライン引数からタイプを取得
const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const outputArg = args.find(arg => arg.startsWith('--output='));

let scoringType: ScoringType = 'ai';
let outputPath = './output';

if (typeArg) {
  const type = typeArg.split('=')[1];
  if (type === 'ai' || type === 'ai-hearts' || type === 'dx-g') {
    scoringType = type;
  }
}

if (outputArg) {
  outputPath = outputArg.split('=')[1];
}

const TYPE_NAMES: Record<ScoringType, string> = {
  'ai': '精密採点Ai',
  'ai-hearts': '精密採点Ai Hearts',
  'dx-g': '精密採点DX-G'
};

async function exportToCSV() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  const cdmToken = process.env.CDM_TOKEN;

  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  if (scoringType === 'dx-g' && !cdmToken) {
    console.error('エラー: DX-Gを使用するには CDM_TOKEN が必要です');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo, cdmToken });

  console.log(`=== CSV出力 [${TYPE_NAMES[scoringType]}] ===\n`);

  try {
    console.log('全データを取得中...');
    const allData = await client.getAllScoringData(scoringType);

    console.log(`取得完了: ${allData.length}件\n`);

    if (allData.length === 0) {
      console.log('データが存在しません');
      return;
    }

    // 点数順（降順）にソート
    const sortedData = allData.sort((a, b) => b.totalScore - a.totalScore);

    // CSV変換
    const csv = convertToCSV(sortedData);

    // 出力ディレクトリを作成
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // ファイル名を生成（タイムスタンプ付き）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `dam_${scoringType}_${timestamp}.csv`;
    const filepath = path.join(outputPath, filename);

    // ファイルに書き込み
    fs.writeFileSync(filepath, csv, 'utf-8');

    console.log(`✅ CSV出力完了`);
    console.log(`ファイル: ${filepath}`);
    console.log(`データ数: ${allData.length}件`);

    // 統計情報
    const avgScore = allData.reduce((sum, s) => sum + s.totalScore, 0) / allData.length;
    const maxScore = allData.reduce((max, s) => s.totalScore > max.totalScore ? s : max);
    const minScore = allData.reduce((min, s) => s.totalScore < min.totalScore ? s : min);

    console.log(`\n📊 統計情報:`);
    console.log(`平均点: ${avgScore.toFixed(3)}点`);
    console.log(`最高点: ${maxScore.totalScore}点 (${maxScore.songName})`);
    console.log(`最低点: ${minScore.totalScore}点 (${minScore.songName})`);

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

function convertToCSV(data: ScoringData[]): string {
  // CSVヘッダー
  const headers = [
    '採点ID',
    '曲名',
    'アーティスト',
    '演奏日時',
    '総合点',
    '音程',
    '安定性',
    '表現力',
    'リズム',
    'ビブラート/ロングトーン',
    'ビブラート回数',
    'ビブラート上手さ',
    'ビブラート秒数',
    'ビブラートタイプ',
    'こぶし',
    'しゃくり',
    'フォール',
    '抑揚',
    'ハンマリング',
    'アクセント',
    'エッジボイス',
    'ヒーカップ',
    'ボーナスタイプ',
    'ボーナスポイント',
    'ロングトーンスキル',
    'リズムタイミング',
    'キー設定',
    '全国平均総合点',
    '全国平均音程',
    '全国平均安定性',
    '全国平均表現力',
    '全国平均リズム',
  ];

  const rows = data.map(score => {
    const d = score as any;

    // DX-Gボーナスポイントの処理
    let bonusTypeName = '';
    let bonusPointValue = '';
    if (d.bonusType && d.bonusPoint && d.bonusPoint !== '0') {
      const bonusScore = parseFloat(d.bonusPoint) / 1000;
      if (d.bonusType === '1') bonusTypeName = '音程ボーナス';
      else if (d.bonusType === '2') bonusTypeName = 'ビブラートボーナス';
      else if (d.bonusType === '3') bonusTypeName = '表現力ボーナス';
      bonusPointValue = bonusScore.toFixed(3);
    }

    return [
      escapeCSV(score.scoringAiId),
      escapeCSV(score.songName),
      escapeCSV(score.artistName),
      escapeCSV(score.playDate),
      score.totalScore,
      d.radarChartPitch || '',
      d.radarChartStability || '',
      d.radarChartExpressive || '',
      d.radarChartRhythm || '',
      d.radarChartVibratoLongtone || '',
      d.vibratoCount || 0,
      d.vibratoSkill || '',
      d.vibratoTotalSecond ? (parseInt(d.vibratoTotalSecond) / 10).toFixed(1) : '',
      d.vibratoType || '',
      d.kobushiCount || 0,
      d.shakuriCount || 0,
      d.fallCount || 0,
      d.intonation || '',
      d.hammeringOnCount || 0,
      d.accentCount || 0,
      d.edgeVoiceCount || 0,
      d.hiccupCount || 0,
      bonusTypeName,
      bonusPointValue,
      d.longtoneSkill || '',
      d.timing || '',
      d.lastPerformKey || '0',
      d.nationalAverageTotalPoints ? (parseFloat(d.nationalAverageTotalPoints) / 1000).toFixed(3) : '',
      d.nationalAveragePitch || '',
      d.nationalAverageStability || '',
      d.nationalAverageExpression || '',
      d.nationalAverageRhythm || '',
    ];
  });

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
