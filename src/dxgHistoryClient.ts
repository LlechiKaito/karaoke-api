import axios from 'axios';
import * as cheerio from 'cheerio';

export interface DxgHistoryData {
  no: string;
  date: string;
  songName: string;
  artistName: string;
  totalScore: number;
  baseScore: number;
  bonusScore: number;
  pitch: number;
  stability: number;
  expression: number;
  rhythm: number;
  vibratoLongtone: number;
  vibratoSeconds?: string;
  vibratoCount?: string;
  vibratoType?: string;
  requestNo?: string;
}

export class DxgHistoryClient {
  private baseUrl = 'https://dx-g.clubdam.info';
  private username: string;

  constructor(username: string) {
    this.username = username;
  }

  /**
   * 指定ページの履歴を取得
   */
  async getHistory(
    page: number = 1,
    sortBy: string = 'scoringDateTime',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<DxgHistoryData[]> {
    const url = `${this.baseUrl}/history/load_content_div/${this.username}/${sortBy}/${sortOrder}/${page}`;

    try {
      const response = await axios.get(url);
      return this.parseHistoryHtml(response.data);
    } catch (error) {
      console.error('履歴取得エラー:', error);
      throw error;
    }
  }

  /**
   * 全履歴を取得（全ページ）
   */
  async getAllHistory(
    sortBy: string = 'scoringDateTime',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<DxgHistoryData[]> {
    const allData: DxgHistoryData[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`ページ ${page} を取得中...`);
      const pageData = await this.getHistory(page, sortBy, sortOrder);

      if (pageData.length === 0) {
        hasMore = false;
      } else {
        allData.push(...pageData);
        page++;

        // レート制限対策
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return allData;
  }

  /**
   * HTMLから履歴データをパース
   */
  private parseHistoryHtml(html: string): DxgHistoryData[] {
    const $ = cheerio.load(html);
    const data: DxgHistoryData[] = [];

    // テーブルの各行を処理
    $('tbody tr').each((index, element) => {
      const cells = $(element).find('td');

      if (cells.length < 10) return; // データ行でない場合はスキップ

      // 曲名と歌手を分離
      const songArtist = $(cells[2]).text().trim();
      const [songName, artistName] = this.parseSongArtist(songArtist);

      // ビブラート情報を取得
      const vibratoText = $(cells[10]).text().trim();
      const vibratoInfo = this.parseVibratoInfo(vibratoText);

      const record: DxgHistoryData = {
        no: $(cells[0]).text().trim(),
        date: $(cells[1]).text().trim(),
        songName,
        artistName,
        totalScore: parseFloat($(cells[3]).text().trim()) || 0,
        baseScore: parseFloat($(cells[4]).text().trim()) || 0,
        bonusScore: parseFloat($(cells[5]).text().trim()) || 0,
        pitch: parseInt($(cells[8]).text().trim()) || 0,      // 音
        stability: parseInt($(cells[9]).text().trim()) || 0,  // 安
        expression: parseInt($(cells[10]).text().trim()) || 0, // 表
        rhythm: parseInt($(cells[11]).text().trim()) || 0,    // リ
        vibratoLongtone: parseInt($(cells[12]).text().trim()) || 0, // VL
        vibratoSeconds: $(cells[19]).text().trim() || undefined,    // ビ秒
        vibratoCount: $(cells[20]).text().trim() || undefined,      // ビ回
        vibratoType: $(cells[21]).text().trim() || undefined,       // ビタ
      };

      // リクエストNoを抽出（リンクから）
      const link = $(cells[2]).find('a').attr('href');
      if (link) {
        const match = link.match(/requestNo=([^&]+)/);
        if (match) {
          record.requestNo = match[1];
        }
      }

      data.push(record);
    });

    return data;
  }

  /**
   * 曲名/歌手を分離
   */
  private parseSongArtist(text: string): [string, string] {
    // "曲名 / 歌手名" の形式を想定
    const parts = text.split('/').map(s => s.trim());
    if (parts.length >= 2) {
      return [parts[0], parts.slice(1).join('/')];
    }
    return [text, ''];
  }

  /**
   * ビブラート情報をパース
   */
  private parseVibratoInfo(text: string): {
    vibratoSeconds?: string;
    vibratoCount?: string;
    vibratoType?: string;
  } {
    const info: any = {};

    // "秒数: X.X 回数: Y タイプ: Z" のような形式を想定
    const secondsMatch = text.match(/(\d+\.?\d*)秒/);
    if (secondsMatch) {
      info.vibratoSeconds = secondsMatch[1];
    }

    const countMatch = text.match(/(\d+)回/);
    if (countMatch) {
      info.vibratoCount = countMatch[1];
    }

    const typeMatch = text.match(/タイプ[:\s]*(\d+)/);
    if (typeMatch) {
      info.vibratoType = typeMatch[1];
    }

    return info;
  }
}
