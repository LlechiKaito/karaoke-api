/**
 * 統計情報の取得例
 *
 * 採点データから様々な統計情報を計算します。
 */

import { DAMClient } from '../src/damClient';
import { ScoringData } from '../src/types';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new DAMClient({
    cdmCardNo: process.env.CDM_CARD_NO!
  });

  console.log('=== 統計情報の取得 ===\n');
  console.log('全データを取得中...');

  const allData = await client.getAllScoringData();
  console.log(`総データ数: ${allData.length}件\n`);

  // 1. 曲別の統計
  console.log('【曲別の統計】');
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

  // 最も歌った曲 Top 5
  const mostSung = Object.entries(songStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  console.log('\n最も歌った曲 Top 5:');
  mostSung.forEach(([song, stats], i) => {
    const avg = stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.count;
    console.log(`${i + 1}. ${song}`);
    console.log(`   回数: ${stats.count}回, 平均: ${avg.toFixed(3)}点, 最高: ${stats.best}点`);
  });

  // 2. 月別の統計
  console.log('\n【月別の統計】');
  const monthlyStats = allData.reduce((acc, score) => {
    const month = score.playDate.substring(0, 7); // "2025-11"
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(score.totalScore);
    return acc;
  }, {} as Record<string, number[]>);

  Object.entries(monthlyStats)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([month, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      console.log(`${month}: 平均 ${avg.toFixed(3)}点 (${scores.length}回, 最高: ${max}点, 最低: ${min}点)`);
    });

  // 3. 点数の分布
  console.log('\n【点数の分布】');
  const distribution = {
    '95点以上': 0,
    '90-95点': 0,
    '85-90点': 0,
    '80-85点': 0,
    '80点未満': 0
  };

  allData.forEach(score => {
    if (score.totalScore >= 95) distribution['95点以上']++;
    else if (score.totalScore >= 90) distribution['90-95点']++;
    else if (score.totalScore >= 85) distribution['85-90点']++;
    else if (score.totalScore >= 80) distribution['80-85点']++;
    else distribution['80点未満']++;
  });

  Object.entries(distribution).forEach(([range, count]) => {
    const percentage = (count / allData.length * 100).toFixed(1);
    console.log(`${range}: ${count}回 (${percentage}%)`);
  });

  // 4. 各項目の平均
  console.log('\n【採点項目の平均】');
  const avgPitch = allData
    .filter(s => s.pitchScore !== undefined)
    .reduce((sum, s) => sum + (s.pitchScore || 0), 0) / allData.length;
  const avgStability = allData
    .filter(s => s.stabilityScore !== undefined)
    .reduce((sum, s) => sum + (s.stabilityScore || 0), 0) / allData.length;
  const avgExpression = allData
    .filter(s => s.expressionScore !== undefined)
    .reduce((sum, s) => sum + (s.expressionScore || 0), 0) / allData.length;
  const avgRhythm = allData
    .filter(s => s.rhythmScore !== undefined)
    .reduce((sum, s) => sum + (s.rhythmScore || 0), 0) / allData.length;

  console.log(`音程: ${avgPitch.toFixed(1)}点`);
  console.log(`安定性: ${avgStability.toFixed(1)}点`);
  console.log(`表現力: ${avgExpression.toFixed(1)}点`);
  console.log(`リズム: ${avgRhythm.toFixed(1)}点`);

  // 5. テクニックの使用頻度
  console.log('\n【テクニックの平均使用回数】');
  const totalKobushi = allData.reduce((sum, s) => sum + parseInt((s as any).kobushiCount || '0'), 0);
  const totalShakuri = allData.reduce((sum, s) => sum + parseInt((s as any).shakuriCount || '0'), 0);
  const totalFall = allData.reduce((sum, s) => sum + parseInt((s as any).fallCount || '0'), 0);
  const totalVibrato = allData.reduce((sum, s) => sum + parseInt((s as any).vibratoCount || '0'), 0);

  console.log(`こぶし: ${(totalKobushi / allData.length).toFixed(1)}回`);
  console.log(`しゃくり: ${(totalShakuri / allData.length).toFixed(1)}回`);
  console.log(`フォール: ${(totalFall / allData.length).toFixed(1)}回`);
  console.log(`ビブラート: ${(totalVibrato / allData.length).toFixed(1)}回`);
}

main().catch(console.error);
