import { DAMClient } from './damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugFields() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  const cdmToken = process.env.CDM_TOKEN;

  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo, cdmToken });

  try {
    // DX-Gの最新1件を取得
    console.log('=== DX-G 全フィールド確認 ===\n');
    const dxgResult = await client.getScoringList('dx-g', { detailFlg: 1 });

    if (dxgResult.list?.data && dxgResult.list.data.length > 0) {
      const firstScore = dxgResult.list.data[0] as any;
      console.log('DX-G フィールド一覧:');
      console.log('曲名:', firstScore.songName);
      console.log('総合点:', firstScore.totalScore);
      console.log('\n--- 全フィールド名 ---');
      Object.keys(firstScore).sort().forEach(key => {
        const value = firstScore[key];
        if (key.toLowerCase().includes('bonus') || key.toLowerCase().includes('ura') || key.toLowerCase().includes('hidden')) {
          console.log(`⭐ ${key}: ${value}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
    }

    // Aiの最新1件も確認
    console.log('\n\n=== AI 全フィールド確認 ===\n');
    const aiResult = await client.getScoringList('ai', { detailFlg: 1 });

    if (aiResult.list?.data && aiResult.list.data.length > 0) {
      const firstScore = aiResult.list.data[0] as any;
      console.log('AI フィールド一覧:');
      console.log('曲名:', firstScore.songName);
      console.log('総合点:', firstScore.totalScore);
      console.log('\n--- 全フィールド名 ---');
      Object.keys(firstScore).sort().forEach(key => {
        const value = firstScore[key];
        if (key.toLowerCase().includes('bonus') || key.toLowerCase().includes('ura') || key.toLowerCase().includes('hidden') || key.toLowerCase().includes('katen')) {
          console.log(`⭐ ${key}: ${value}`);
        } else {
          console.log(`   ${key}: ${value}`);
        }
      });
    }

  } catch (error) {
    console.error('エラー:', error);
  }
}

debugFields();
