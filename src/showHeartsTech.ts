import { DAMClient } from './damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function showHeartsTech() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo });

  try {
    const data = await client.getAllScoringData('ai-hearts');
    const withTech = data.filter(s => {
      const d = s as any;
      return d.hammeringOnCount > 0 || d.accentCount > 0 || d.edgeVoiceCount > 0 || d.hiccupCount > 0;
    });

    console.log(`Hearts 追加テクニック検出: ${withTech.length}件\n`);

    withTech.forEach(s => {
      const d = s as any;
      console.log(`━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`曲名: ${s.songName}`);
      console.log(`総合点: ${s.totalScore}点`);
      console.log(`演奏日時: ${s.playDate}`);
      console.log(`\n🎵 追加テクニック:`);
      console.log(`  ハンマリング: ${d.hammeringOnCount || 0}回`);
      console.log(`  アクセント: ${d.accentCount || 0}回`);
      console.log(`  エッジボイス: ${d.edgeVoiceCount || 0}回`);
      console.log(`  ヒーカップ: ${d.hiccupCount || 0}回`);
      console.log('');
    });
  } catch (error) {
    console.error('エラー:', error);
  }
}

showHeartsTech();
