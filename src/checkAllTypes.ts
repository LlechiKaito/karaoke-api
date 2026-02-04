import { DAMClient } from './damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkAllTypes() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  const cdmToken = process.env.CDM_TOKEN;

  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo, cdmToken });

  try {
    // AI
    console.log('=== 精密採点Ai ===');
    const aiData = await client.getAllScoringData('ai');
    const aiWithTech = aiData.filter(s => {
      const d = s as any;
      return d.hammeringOnCount > 0 || d.accentCount > 0 || d.edgeVoiceCount > 0 || d.hiccupCount > 0;
    });
    console.log(`データ数: ${aiData.length}件`);
    console.log(`追加テクニックあり: ${aiWithTech.length}件\n`);

    // Hearts
    console.log('=== 精密採点Ai Hearts ===');
    const heartsData = await client.getAllScoringData('ai-hearts');

    // Heartsの最新1件でフィールド確認
    if (heartsData.length > 0) {
      const firstHearts = heartsData[0] as any;
      console.log(`データ数: ${heartsData.length}件`);
      console.log('\nHeartsのフィールドにハンマリング系があるか確認:');
      const techFields = Object.keys(firstHearts).filter(key =>
        key.toLowerCase().includes('hammer') ||
        key.toLowerCase().includes('accent') ||
        key.toLowerCase().includes('edge') ||
        key.toLowerCase().includes('hiccup')
      );
      if (techFields.length > 0) {
        techFields.forEach(field => {
          console.log(`  ${field}: ${firstHearts[field]}`);
        });
      } else {
        console.log('  → ハンマリング系フィールドなし');
      }
    }

    // DX-G
    console.log('\n=== 精密採点DX-G ===');
    const dxgData = await client.getAllScoringData('dx-g');

    if (dxgData.length > 0) {
      const firstDxg = dxgData[0] as any;
      console.log(`データ数: ${dxgData.length}件`);
      console.log('\nDX-Gのフィールドにハンマリング系があるか確認:');
      const techFields = Object.keys(firstDxg).filter(key =>
        key.toLowerCase().includes('hammer') ||
        key.toLowerCase().includes('accent') ||
        key.toLowerCase().includes('edge') ||
        key.toLowerCase().includes('hiccup')
      );
      if (techFields.length > 0) {
        techFields.forEach(field => {
          console.log(`  ${field}: ${firstDxg[field]}`);
        });
      } else {
        console.log('  → ハンマリング系フィールドなし');
      }
    }

  } catch (error) {
    console.error('エラー:', error);
  }
}

checkAllTypes();
