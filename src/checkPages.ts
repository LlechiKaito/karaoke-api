import { DAMClient } from './damClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPages() {
  const cdmCardNo = process.env.CDM_CARD_NO;
  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo });

  try {
    console.log('40ページ目（200件目付近）のデータを確認中...');
    const page40 = await client.getScoringList('ai-hearts', { pageNo: 40, detailFlg: 0 });
    console.log('40ページ目 status:', page40.status);
    console.log('40ページ目 hasNext:', page40.hasNext);
    console.log('40ページ目 データ数:', page40.list?.data?.length || 0);
    if (page40.list?.data && page40.list.data.length > 0) {
      console.log('40ページ目 最初の曲:', page40.list.data[0].songName);
    }

    console.log('\n41ページ目のデータを確認中...');
    const page41 = await client.getScoringList('ai-hearts', { pageNo: 41, detailFlg: 0 });
    console.log('41ページ目 status:', page41.status);
    console.log('41ページ目 hasNext:', page41.hasNext);
    console.log('41ページ目 データ数:', page41.list?.data?.length || 0);
    if (page41.list?.data && page41.list.data.length > 0) {
      console.log('41ページ目 最初の曲:', page41.list.data[0].songName);
    }

    // 実際に全データを取得してみる
    console.log('\n全データ取得中（制限なし）...');
    const allData = await client.getAllScoringData('ai-hearts');
    console.log(`\n最終結果: ${allData.length}件取得`);

  } catch (error) {
    console.error('エラー:', error);
  }
}

checkPages();
