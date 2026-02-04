import { DAMClient } from './damClient';
import { ScoringType } from './types';
import * as dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

// コマンドライン引数からタイプを取得
const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const allFlag = args.includes('--all');
const sortFlag = args.find(arg => arg.startsWith('--sort='));

let scoringType: ScoringType = 'ai'; // デフォルトは精密採点Ai
let sortBy: 'date' | 'score' = 'date'; // デフォルトは日付順

if (typeArg) {
  const type = typeArg.split('=')[1];
  if (type === 'ai' || type === 'ai-hearts' || type === 'dx-g') {
    scoringType = type;
  } else {
    console.error(`エラー: 不正なタイプ "${type}"`);
    console.error('有効なタイプ: ai, ai-hearts, dx-g');
    process.exit(1);
  }
}

if (sortFlag) {
  const sort = sortFlag.split('=')[1];
  if (sort === 'score' || sort === 'date') {
    sortBy = sort;
  } else {
    console.error(`エラー: 不正なソート方法 "${sort}"`);
    console.error('有効なソート: date, score');
    process.exit(1);
  }
}

const TYPE_NAMES: Record<ScoringType, string> = {
  'ai': '精密採点Ai',
  'ai-hearts': '精密採点Ai Hearts',
  'dx-g': '精密採点DX-G'
};

async function main() {
  // CDMカード番号を設定
  const cdmCardNo = process.env.CDM_CARD_NO;
  const cdmToken = process.env.CDM_TOKEN;

  if (!cdmCardNo) {
    console.error('エラー: CDM_CARD_NO が設定されていません');
    console.error('.env ファイルに CDM_CARD_NO を設定してください');
    process.exit(1);
  }

  // DX-Gを使用する場合はcdmTokenも必要
  if (scoringType === 'dx-g' && !cdmToken) {
    console.error('エラー: DX-Gを使用するには CDM_TOKEN が必要です');
    console.error('.env ファイルに CDM_TOKEN を設定してください');
    console.error('取得方法: docs/setup-guide.md を参照');
    process.exit(1);
  }

  const client = new DAMClient({ cdmCardNo, cdmToken });

  try {
    console.log(`=== DAM 採点データ取得 [${TYPE_NAMES[scoringType]}] ===\n`);

    if (allFlag) {
      // 全データを取得
      console.log('全ての採点データを取得中...');
      let allData = await client.getAllScoringData(scoringType);

      // ソート
      if (sortBy === 'score') {
        allData = allData.sort((a, b) => b.totalScore - a.totalScore);
      }

      console.log(`\n全データ取得完了: ${allData.length}件\n`);

      if (allData.length > 0) {
        // 平均点
        const average = allData.reduce((sum, s) => sum + s.totalScore, 0) / allData.length;
        console.log(`平均点: ${average.toFixed(3)}点`);

        // 最高得点
        const best = allData.reduce((max, s) => s.totalScore > max.totalScore ? s : max);
        console.log(`最高得点: ${best.songName} (${best.totalScore}点)`);

        // 最低得点
        const worst = allData.reduce((min, s) => s.totalScore < min.totalScore ? s : min);
        console.log(`最低得点: ${worst.songName} (${worst.totalScore}点)`);

        console.log(`\n最新5件:`);
        allData.slice(0, 5).forEach((score, index) => {
          console.log(`${index + 1}. ${score.songName} - ${score.totalScore}点 (${score.playDate})`);
        });
      }
    } else {
      // 最新の採点データ（1ページ目）を取得
      console.log(sortBy === 'score' ? '点数上位5件の採点データを取得中...' : '最新5件の採点データを取得中...');
      const firstPage = await client.getScoringList(scoringType, { detailFlg: 1 });

      if (firstPage.status === 'NG') {
        console.error(`エラー: ${firstPage.statusCode}`);

        // DX-G特有のエラーメッセージ
        if (scoringType === 'dx-g' && firstPage.statusCode === 'E000') {
          console.error('\nDX-Gのデータが閲覧できません。');
          console.error('考えられる原因:');
          console.error('1. DX-Gで歌ったことがない');
          console.error('2. 履歴の公開設定が非公開になっている');
          console.error('3. ブラウザでDAM★ともにログインして、DX-Gの履歴が見れるか確認してください');
        }
        return;
      }

      if (firstPage.list?.data) {
        let dataToShow = firstPage.list.data;

        // ソート
        if (sortBy === 'score') {
          dataToShow = [...dataToShow].sort((a, b) => b.totalScore - a.totalScore);
        }

        console.log(`\n取得件数: ${dataToShow.length}件\n`);

        dataToShow.forEach((score, index) => {
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`📊 ${index + 1}件目`);
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`曲名: ${score.songName}`);
          console.log(`アーティスト: ${score.artistName}`);
          console.log(`総合点: ${score.totalScore}点`);
          console.log(`演奏日時: ${score.playDate}`);

          console.log(`\n🎯 レーダーチャート:`);
          console.log(`  音程: ${(score as any).radarChartPitch || 'なし'}点`);
          console.log(`  安定性: ${(score as any).radarChartStability || 'なし'}点`);
          console.log(`  表現力: ${(score as any).radarChartExpressive || 'なし'}点`);
          console.log(`  リズム: ${(score as any).radarChartRhythm || 'なし'}点`);
          console.log(`  ビブラート/ロングトーン: ${(score as any).radarChartVibratoLongtone || 'なし'}点`);

          console.log(`\n🎤 ビブラート:`);
          const vibratoCount = (score as any).vibratoCount || 0;
          const vibratoSkill = (score as any).vibratoSkill;
          const vibratoTotalSecond = (score as any).vibratoTotalSecond;
          console.log(`  回数: ${vibratoCount}回`);
          if (vibratoSkill) console.log(`  上手さ: ${vibratoSkill}/10`);
          if (vibratoTotalSecond) console.log(`  秒数: ${(parseInt(vibratoTotalSecond) / 10).toFixed(1)}秒`);

          console.log(`\n🎨 表現テクニック:`);
          console.log(`  こぶし: ${(score as any).kobushiCount || 0}回`);
          console.log(`  しゃくり: ${(score as any).shakuriCount || 0}回`);
          console.log(`  フォール: ${(score as any).fallCount || 0}回`);
          if ((score as any).intonation) console.log(`  抑揚: ${(score as any).intonation}`);

          // 追加テクニック（Ai/Hearts専用）
          const hammeringOn = (score as any).hammeringOnCount || 0;
          const accent = (score as any).accentCount || 0;
          const edgeVoice = (score as any).edgeVoiceCount || 0;
          const hiccup = (score as any).hiccupCount || 0;

          // AI: 全て0の場合は非表示
          // Hearts: エッジボイス・ヒーカップは0の場合非表示、ハンマリング・アクセントは表示
          if (scoringType === 'ai') {
            if (hammeringOn > 0 || accent > 0 || edgeVoice > 0 || hiccup > 0) {
              console.log(`\n🎵 追加テクニック:`);
              if (hammeringOn > 0) console.log(`  ハンマリング: ${hammeringOn}回`);
              if (accent > 0) console.log(`  アクセント: ${accent}回`);
              if (edgeVoice > 0) console.log(`  エッジボイス: ${edgeVoice}回`);
              if (hiccup > 0) console.log(`  ヒーカップ: ${hiccup}回`);
            }
          } else if (scoringType === 'ai-hearts') {
            if (hammeringOn > 0 || accent > 0 || edgeVoice > 0 || hiccup > 0) {
              console.log(`\n🎵 追加テクニック:`);
              if (hammeringOn > 0) console.log(`  ハンマリング: ${hammeringOn}回`);
              if (accent > 0) console.log(`  アクセント: ${accent}回`);
              if (edgeVoice > 0) console.log(`  エッジボイス: ${edgeVoice}回`);
              if (hiccup > 0) console.log(`  ヒーカップ: ${hiccup}回`);
            }
          }

          // DX-Gのボーナスポイント
          if (scoringType === 'dx-g') {
            const bonusType = (score as any).bonusType;
            const bonusPoint = (score as any).bonusPoint;

            if (bonusType && bonusPoint && bonusPoint !== '0') {
              const bonusScore = parseFloat(bonusPoint) / 1000;
              let bonusName = '';
              if (bonusType === '1') bonusName = '音程ボーナス';
              else if (bonusType === '2') bonusName = 'ビブラートボーナス';
              else if (bonusType === '3') bonusName = '表現力ボーナス';

              console.log(`\n🌟 ボーナス:`);
              console.log(`  ${bonusName}: +${bonusScore.toFixed(3)}点`);
            }
          }

          console.log('');
        });

        console.log(`次のページがあるか: ${firstPage.hasNext === 1 ? 'はい' : 'いいえ'}`);
      }
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
main();
