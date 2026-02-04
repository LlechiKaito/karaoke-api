import { DAMClient } from './damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function testLargePages() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo });

  const testPages = [50, 100, 200, 500, 1000];

  for (const pageNo of testPages) {
    try {
      console.log(`\n=== ${pageNo}ページ目を取得 ===`);
      const result = await client.getScoringList('ai-hearts', { pageNo, detailFlg: 0 });

      console.log(`status: ${result.status}`);
      console.log(`statusCode: ${result.statusCode || 'なし'}`);
      console.log(`hasNext: ${result.hasNext}`);
      console.log(`データ数: ${result.list?.data?.length || 0}`);

      if (result.list?.data && result.list.data.length > 0) {
        const first = result.list.data[0];
        console.log(`最初の曲: ${first.songName}`);
        console.log(`演奏日時: ${first.playDate}`);
        console.log(`採点ID: ${first.scoringAiId}`);
      }

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`${pageNo}ページ目でエラー:`, error);
    }
  }
}

testLargePages();
