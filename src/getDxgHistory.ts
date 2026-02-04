import { DxgHistoryClient } from './dxgHistoryClient';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // 環境変数からユーザー名を取得、なければデフォルト
  const username = process.env.DXG_HISTORY_USERNAME || 'LLENN';

  const client = new DxgHistoryClient(username);

  try {
    console.log(`=== 精密集計DX-G 履歴取得 [${username}] ===\n`);

    // 最初の1ページを取得してテスト
    console.log('最初のページを取得中...');
    const firstPage = await client.getHistory(1);

    console.log(`\n取得件数: ${firstPage.length}件\n`);

    if (firstPage.length > 0) {
      // 最初の5件を表示
      firstPage.slice(0, 5).forEach((record, index) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📊 ${index + 1}件目`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`日時: ${record.date}`);
        console.log(`曲名: ${record.songName}`);
        console.log(`アーティスト: ${record.artistName}`);
        console.log(`総合点: ${record.totalScore}点`);
        console.log(`素点: ${record.baseScore}点`);
        console.log(`ボーナス: ${record.bonusScore}点`);
        console.log(`\n🎯 評価:`);
        console.log(`  音程: ${record.pitch}点`);
        console.log(`  安定性: ${record.stability}点`);
        console.log(`  表現力: ${record.expression}点`);
        console.log(`  リズム: ${record.rhythm}点`);
        console.log(`  ビブラート/ロングトーン: ${record.vibratoLongtone}点`);

        if (record.vibratoSeconds || record.vibratoCount) {
          console.log(`\n🎤 ビブラート:`);
          if (record.vibratoSeconds) console.log(`  秒数: ${record.vibratoSeconds}秒`);
          if (record.vibratoCount) console.log(`  回数: ${record.vibratoCount}回`);
          if (record.vibratoType) console.log(`  タイプ: ${record.vibratoType}`);
        }
        console.log('');
      });

      // 統計情報
      const avgScore = firstPage.reduce((sum, r) => sum + r.totalScore, 0) / firstPage.length;
      const maxScore = firstPage.reduce((max, r) => r.totalScore > max.totalScore ? r : max);
      const minScore = firstPage.reduce((min, r) => r.totalScore < min.totalScore ? r : min);

      console.log(`\n📊 このページの統計:`);
      console.log(`平均点: ${avgScore.toFixed(3)}点`);
      console.log(`最高点: ${maxScore.totalScore}点 (${maxScore.songName})`);
      console.log(`最低点: ${minScore.totalScore}点 (${minScore.songName})`);
    }

    // 全データ取得するか確認
    console.log('\n💡 全データを取得する場合は --all オプションを使用してください');
    console.log('   例: npm run dxg:history:all');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
if (args.includes('--all')) {
  // 全データ取得
  (async () => {
    const username = process.env.DXG_HISTORY_USERNAME || 'LLENN';
    const client = new DxgHistoryClient(username);

    console.log(`=== 精密集計DX-G 全履歴取得 [${username}] ===\n`);
    const allData = await client.getAllHistory();

    console.log(`\n✅ 全データ取得完了: ${allData.length}件\n`);

    const avgScore = allData.reduce((sum, r) => sum + r.totalScore, 0) / allData.length;
    const maxScore = allData.reduce((max, r) => r.totalScore > max.totalScore ? r : max);
    const minScore = allData.reduce((min, r) => r.totalScore < min.totalScore ? r : min);

    console.log(`📊 全データ統計:`);
    console.log(`平均点: ${avgScore.toFixed(3)}点`);
    console.log(`最高点: ${maxScore.totalScore}点 (${maxScore.songName} - ${maxScore.date})`);
    console.log(`最低点: ${minScore.totalScore}点 (${minScore.songName} - ${minScore.date})`);
  })();
} else {
  main();
}
