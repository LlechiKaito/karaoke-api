/**
 * DX-G スマートフォン版エンドポイントのテスト
 */

import axios from 'axios';
import * as xml2js from 'xml2js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testDxGSP() {
  const url = 'https://www.clubdam.com/app/damtomo/SP/scoring/ScoringDxgList.do';
  const cdmCardNo = process.env.CDM_CARD_NO;

  if (!cdmCardNo) {
    console.error('CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const params = {
    cdmCardNo,
    detailFlg: 1,
    pageNo: 1,
  };

  console.log('=== DX-G スマートフォン版エンドポイント テスト ===\n');
  console.log('URL:', url);
  console.log('パラメータ:', params);
  console.log('\nリクエスト送信中...\n');

  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    console.log('ステータス:', response.status);
    console.log('\n=== レスポンスXML（最初の2000文字） ===\n');
    console.log(response.data.substring(0, 2000));

    console.log('\n\n=== XMLパース結果 ===\n');

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
    });

    const result = await parser.parseStringPromise(response.data);
    const root = result['document'] || result;

    console.log('ルート要素:', Object.keys(result));
    console.log('\nステータス:', root.result?.status);
    console.log('ステータスコード:', root.result?.statusCode);
    console.log('メッセージ:', root.result?.message);

    if (root.list?.data) {
      const dataArray = Array.isArray(root.list.data) ? root.list.data : [root.list.data];
      console.log('\nデータ件数:', dataArray.length);

      if (dataArray.length > 0) {
        console.log('\n最初のデータアイテムのキー:', Object.keys(dataArray[0]));
        console.log('\n最初のデータアイテム（JSON、最初の1000文字）:');
        console.log(JSON.stringify(dataArray[0], null, 2).substring(0, 1000));
      }
    } else {
      console.log('\nデータが存在しません');
    }

    if (root.data?.page?.$) {
      console.log('\nページ情報:', root.data.page.$);
    }

  } catch (error: any) {
    if (error.response) {
      console.error('エラー:', error.response.status, error.response.statusText);
      console.error('レスポンス:', error.response.data.substring(0, 500));
    } else {
      console.error('エラー:', error.message);
    }
  }
}

testDxGSP();
