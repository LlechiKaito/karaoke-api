import { DAMClient } from './damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function findHammering() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  const cdmToken = process.env.CDM_TOKEN;

  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo, cdmToken });

  try {
    console.log('=== 全AIデータからハンマリング検索 ===\n');
    const allData = await client.getAllScoringData('ai');

    console.log(`全データ数: ${allData.length}件\n`);

    // ハンマリングがあるデータを抽出
    const withHammering = allData.filter(score => {
      const d = score as any;
      return d.hammeringOnCount && parseInt(d.hammeringOnCount) > 0;
    });

    console.log(`ハンマリング検出データ: ${withHammering.length}件\n`);

    if (withHammering.length > 0) {
      withHammering.slice(0, 5).forEach((score, index) => {
        const d = score as any;
        console.log(`${index + 1}. ${score.songName} - ${score.totalScore}点`);
        console.log(`   ハンマリング: ${d.hammeringOnCount}回`);
        console.log(`   アクセント: ${d.accentCount || 0}回`);
        console.log(`   エッジボイス: ${d.edgeVoiceCount || 0}回`);
        console.log(`   ヒーカップ: ${d.hiccupCount || 0}回`);
        console.log('');
      });
    }

    // 統計情報
    console.log('\n=== 追加テクニック統計 ===');
    const stats = {
      hammering: allData.filter(s => (s as any).hammeringOnCount > 0).length,
      accent: allData.filter(s => (s as any).accentCount > 0).length,
      edgeVoice: allData.filter(s => (s as any).edgeVoiceCount > 0).length,
      hiccup: allData.filter(s => (s as any).hiccupCount > 0).length,
    };

    console.log(`ハンマリングあり: ${stats.hammering}件`);
    console.log(`アクセントあり: ${stats.accent}件`);
    console.log(`エッジボイスあり: ${stats.edgeVoice}件`);
    console.log(`ヒーカップあり: ${stats.hiccup}件`);

  } catch (error) {
    console.error('エラー:', error);
  }
}

findHammering();
