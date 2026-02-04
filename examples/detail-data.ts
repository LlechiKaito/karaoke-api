/**
 * 詳細データの確認
 * ビブラート、こぶし、しゃくりなどの詳細情報を表示
 */

import { DAMClient } from '../src/damClient';
import { ScoringType } from '../src/types';
import * as dotenv from 'dotenv';

dotenv.config();

async function showDetailData() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  const cdmToken = process.env.CDM_TOKEN;

  if (!cdmCardNo) {
    console.error('CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo, cdmToken });

  // コマンドライン引数からタイプを取得
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  let scoringType: ScoringType = 'ai';

  if (typeArg) {
    const type = typeArg.split('=')[1];
    if (type === 'ai' || type === 'ai-hearts' || type === 'dx-g') {
      scoringType = type;
    }
  }

  console.log(`=== 詳細データ表示 [${scoringType}] ===\n`);

  try {
    const result = await client.getScoringList(scoringType, { pageNo: 1, detailFlg: 1 });

    if (result.status === 'NG') {
      console.error('エラー:', result.statusCode);
      return;
    }

    if (!result.list?.data || result.list.data.length === 0) {
      console.log('データが見つかりませんでした');
      return;
    }

    // 最初のデータの詳細を表示
    const score = result.list.data[0];

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 基本情報');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`曲名: ${score.songName}`);
    console.log(`アーティスト: ${score.artistName}`);
    console.log(`総合点: ${score.totalScore}点`);
    console.log(`演奏日時: ${score.playDate}`);
    console.log(`採点ID: ${score.scoringAiId}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 レーダーチャート');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`音程: ${score.pitchScore || (score as any).radarChartPitch}点`);
    console.log(`安定性: ${score.stabilityScore || (score as any).radarChartStability}点`);
    console.log(`表現力: ${score.expressionScore || (score as any).radarChartExpressive}点`);
    console.log(`リズム: ${score.rhythmScore || (score as any).radarChartRhythm}点`);
    console.log(`ビブラート/ロングトーン: ${score.longToneScore || (score as any).radarChartVibratoLongtone}点`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎤 ビブラート');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const vibratoCount = (score as any).vibratoCount;
    const vibratoSkill = (score as any).vibratoSkill;
    const vibratoType = (score as any).vibratoType;
    const vibratoTotalSecond = (score as any).vibratoTotalSecond;

    console.log(`回数: ${vibratoCount || 0}回`);
    console.log(`上手さ: ${vibratoSkill ? `${vibratoSkill}/10` : 'なし'}`);
    console.log(`合計秒数: ${vibratoTotalSecond ? (parseInt(vibratoTotalSecond) / 10).toFixed(1) : 0}秒`);
    console.log(`タイプ: ${getVibratoTypeName(vibratoType)}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 表現テクニック');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`こぶし: ${(score as any).kobushiCount || 0}回`);
    console.log(`しゃくり: ${(score as any).shakuriCount || 0}回`);
    console.log(`フォール: ${(score as any).fallCount || 0}回`);
    console.log(`抑揚: ${(score as any).intonation || 'なし'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎵 その他の詳細');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ロングトーンスキル: ${(score as any).longtoneSkill || 'なし'}`);
    console.log(`リズムタイミング: ${(score as any).timing || 'なし'}`);
    console.log(`キー設定: ${(score as any).lastPerformKey || '0'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌏 全国平均との比較');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const nationalAvg = (score as any).nationalAverageTotalPoints;
    if (nationalAvg) {
      const avgScore = parseFloat(nationalAvg) / 1000;
      const diff = score.totalScore - avgScore;
      console.log(`全国平均: ${avgScore.toFixed(3)}点`);
      console.log(`差: ${diff > 0 ? '+' : ''}${diff.toFixed(3)}点`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 音程グラフ（最初の10セクション）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (let i = 1; i <= 10; i++) {
      const section = ('0' + i).slice(-2);
      const point = (score as any)[`intervalGraphPointsSection${section}`];
      if (point && point !== '0') {
        const bar = '█'.repeat(Math.floor(parseInt(point) / 10));
        console.log(`セクション${section}: ${point}点 ${bar}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 利用可能な全属性');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allKeys = Object.keys(score).filter(k => !['songName', 'artistName', 'playDate', 'totalScore', 'scoringAiId'].includes(k));
    console.log(`全${allKeys.length}個の属性が利用可能`);
    console.log('\n主要な属性:');
    allKeys.slice(0, 20).forEach(key => {
      console.log(`- ${key}: ${(score as any)[key]}`);
    });
    if (allKeys.length > 20) {
      console.log(`... 他${allKeys.length - 20}個`);
    }

  } catch (error) {
    console.error('エラー:', error);
  }
}

function getVibratoTypeName(type: string): string {
  const types: { [key: string]: string } = {
    '0': 'ノンビブ形(N)',
    '1': 'ボックス形(A-1)',
    '2': 'ボックス形(B-1)',
    '3': 'ボックス形(C-1)',
    '4': 'ボックス形(A-2)',
    '5': 'ボックス形(B-2)',
    '6': 'ボックス形(C-2)',
    '7': 'ボックス形(A-3)',
    '8': 'ボックス形(B-3)',
    '9': 'ボックス形(C-3)',
    '10': '上昇形(D)',
    '11': '下降形(E)',
    '12': '縮小形(F)',
    '13': '拡張形(G)',
    '14': 'ひし形(H)',
  };
  return types[type] || `不明(${type})`;
}

showDetailData();
