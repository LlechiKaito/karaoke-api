/**
 * DX-Gの正しいエンドポイントを探すスクリプト
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const possibleEndpoints = [
  'GetScoringDxGListXML.do',
  'GetScoringDxListXML.do',
  'GetScoringDXGListXML.do',
  'GetScoringDxGHistoryListXML.do',
  'GetDxGScoringListXML.do',
  'GetScoringDxgListXML.do',
];

async function testEndpoint(endpoint: string): Promise<boolean> {
  const baseUrl = 'https://www.clubdam.com/app/damtomo/scoring';
  const url = `${baseUrl}/${endpoint}`;
  const cdmCardNo = process.env.CDM_CARD_NO;

  if (!cdmCardNo) {
    console.error('CDM_CARD_NO が設定されていません');
    process.exit(1);
  }

  const params = {
    cdmCardNo,
    pageNo: 1,
    detailFlg: 0,
  };

  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // ステータスコード200でレスポンスにOKが含まれていればおそらく成功
    if (response.status === 200) {
      const hasOK = response.data.includes('<status>OK</status>');
      const hasNG = response.data.includes('<status>NG</status>');

      if (hasOK) {
        console.log(`✅ ${endpoint} - 成功！`);
        console.log('   レスポンス（最初の500文字）:');
        console.log('   ' + response.data.substring(0, 500).replace(/\n/g, '\n   '));
        return true;
      } else if (hasNG) {
        const statusCode = response.data.match(/<statusCode>(.*?)<\/statusCode>/)?.[1];
        console.log(`⚠️  ${endpoint} - NG (statusCode: ${statusCode})`);
        return false;
      } else {
        console.log(`❓ ${endpoint} - 不明なレスポンス`);
        return false;
      }
    }
    return false;
  } catch (error: any) {
    if (error.response) {
      console.log(`❌ ${endpoint} - ${error.response.status} ${error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      console.log(`⏱️  ${endpoint} - タイムアウト`);
    } else {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('=== DX-G エンドポイント探索 ===\n');
  console.log('以下のエンドポイントを試します:\n');

  let foundEndpoint: string | null = null;

  for (const endpoint of possibleEndpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      foundEndpoint = endpoint;
      break;
    }
    // レート制限対策
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== 結果 ===');
  if (foundEndpoint) {
    console.log(`\n正しいエンドポイントが見つかりました: ${foundEndpoint}`);
    console.log('\nこのエンドポイントを使用するには、src/damClient.ts を更新してください。');
  } else {
    console.log('\n有効なエンドポイントが見つかりませんでした。');
    console.log('以下の可能性があります:');
    console.log('1. DX-Gのデータがアカウントに存在しない');
    console.log('2. エンドポイント名が想定と異なる');
    console.log('3. ブラウザの開発者ツールで実際のエンドポイントを確認してください');
  }
}

main();
