/**
 * 基本的な使用例
 *
 * このファイルでは、DAM APIクライアントの基本的な使い方を示します。
 */

import { DAMClient } from '../src/damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // クライアントの初期化
  const client = new DAMClient({
    cdmCardNo: process.env.CDM_CARD_NO!
  });

  console.log('=== DAM API 基本的な使用例 ===\n');

  // 例1: 最新の採点データを取得
  console.log('【例1】最新5件の採点データを取得');
  const latest = await client.getScoringAiList({ pageNo: 1, detailFlg: 1 });

  if (latest.status === 'OK' && latest.list?.data) {
    latest.list.data.forEach((score, i) => {
      console.log(`${i + 1}. ${score.songName} - ${score.totalScore}点`);
    });
  }

  console.log('\n---\n');

  // 例2: 特定のページを取得
  console.log('【例2】2ページ目のデータを取得');
  const page2 = await client.getScoringAiList({ pageNo: 2, detailFlg: 1 });

  if (page2.status === 'OK' && page2.list?.data) {
    console.log(`取得件数: ${page2.list.data.length}件`);
    console.log(`次のページあり: ${page2.hasNext === 1 ? 'はい' : 'いいえ'}`);
  }

  console.log('\n---\n');

  // 例3: 全データを取得（時間がかかる場合があります）
  console.log('【例3】全データを取得（最大200件）');
  console.log('取得中...');

  const allData = await client.getAllScoringData();
  console.log(`総データ数: ${allData.length}件`);

  // 平均点を計算
  const average = allData.reduce((sum, s) => sum + s.totalScore, 0) / allData.length;
  console.log(`平均点: ${average.toFixed(3)}点`);

  // 最高得点
  const best = allData.reduce((max, s) => s.totalScore > max.totalScore ? s : max);
  console.log(`最高得点: ${best.songName} (${best.totalScore}点)`);

  // 最低得点
  const worst = allData.reduce((min, s) => s.totalScore < min.totalScore ? s : min);
  console.log(`最低得点: ${worst.songName} (${worst.totalScore}点)`);
}

main().catch(console.error);
