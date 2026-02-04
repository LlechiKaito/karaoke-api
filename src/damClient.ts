import axios, { AxiosInstance } from 'axios';
import * as xml2js from 'xml2js';
import { DAMClientConfig, ScoringListResponse, ScoringData, ScoringType, ScoringTypeConfig } from './types';

// 採点タイプの設定
const SCORING_CONFIGS: Record<ScoringType, ScoringTypeConfig> = {
  'ai': {
    endpoint: 'GetScoringAiListXML.do',
    namespace: 'https://www.clubdam.com/app/damtomo/scoring/GetScoringAiListXML',
    name: '精密採点Ai'
  },
  'ai-hearts': {
    endpoint: 'GetScoringHeartsListXML.do',
    namespace: 'https://www.clubdam.com/app/damtomo/scoring/GetScoringHeartsListXML',
    name: '精密採点Ai Hearts'
  },
  'dx-g': {
    endpoint: 'GetScoringDxgListXML.do',
    namespace: 'https://www.clubdam.com/app/damtomo/scoring/GetScoringDxgListXML',
    name: '精密採点DX-G'
  }
};

export class DAMClient {
  private cdmCardNo: string;
  private cdmToken?: string;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(config: DAMClientConfig) {
    this.cdmCardNo = config.cdmCardNo;
    this.cdmToken = config.cdmToken;
    this.baseUrl = config.baseUrl || 'https://www.clubdam.com/app/damtomo/scoring';

    this.client = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });
  }

  /**
   * 採点データのリストを取得（汎用）
   */
  async getScoringList(
    type: ScoringType,
    options?: {
      pageNo?: number;
      detailFlg?: number;
    }
  ): Promise<ScoringListResponse> {
    const config = SCORING_CONFIGS[type];
    const url = `${this.baseUrl}/${config.endpoint}`;

    const params: any = {
      cdmCardNo: this.cdmCardNo,
      pageNo: options?.pageNo || 1,
      detailFlg: options?.detailFlg || 0,
    };

    // DX-Gの場合は追加パラメータが必要
    if (type === 'dx-g') {
      if (!this.cdmToken) {
        throw new Error('DX-Gを使用するにはcdmTokenが必要です。環境変数 CDM_TOKEN を設定してください。');
      }
      params.cdmToken = this.cdmToken;
      params.enc = 'sjis';
      params.dxgType = 1;
      params.UTCserial = Date.now();
    }

    try {
      const response = await this.client.get(url, { params });
      const result = await this.parseResponse(response.data, type);
      return result;
    } catch (error: any) {
      console.error('APIリクエストエラー:', error.message);
      if (error.response) {
        console.error('レスポンスステータス:', error.response.status);
        console.error('レスポンスデータ:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * 精密採点Aiのリストを取得
   */
  async getScoringAiList(options?: {
    pageNo?: number;
    detailFlg?: number;
  }): Promise<ScoringListResponse> {
    return this.getScoringList('ai', options);
  }

  /**
   * 精密採点Ai Heartsのリストを取得
   */
  async getScoringHeartslist(options?: {
    pageNo?: number;
    detailFlg?: number;
  }): Promise<ScoringListResponse> {
    return this.getScoringList('ai-hearts', options);
  }

  /**
   * 精密採点DX-Gのリストを取得
   */
  async getScoringDxGList(options?: {
    pageNo?: number;
    detailFlg?: number;
  }): Promise<ScoringListResponse> {
    return this.getScoringList('dx-g', options);
  }

  /**
   * 特定の採点データをIDで取得
   */
  async getScoringById(
    scoringAiId: string,
    type: ScoringType = 'ai'
  ): Promise<ScoringListResponse> {
    const config = SCORING_CONFIGS[type];
    const url = `${this.baseUrl}/${config.endpoint}`;
    const params = {
      cdmCardNo: this.cdmCardNo,
      scoringAiId,
      detailFlg: 1,
    };

    try {
      const response = await this.client.get(url, { params });
      const result = await this.parseResponse(response.data, type);
      return result;
    } catch (error) {
      console.error('APIリクエストエラー:', error);
      throw error;
    }
  }

  /**
   * 全ての採点データを取得（ページネーション対応）
   */
  async getAllScoringData(type: ScoringType = 'ai'): Promise<ScoringData[]> {
    const allData: ScoringData[] = [];
    let pageNo = 1;
    let hasNext = 1;

    while (hasNext === 1) {
      const response = await this.getScoringList(type, { pageNo, detailFlg: 1 });

      if (response.status === 'NG') {
        throw new Error(`API Error: ${response.statusCode}`);
      }

      if (response.list?.data) {
        allData.push(...response.list.data);
      }

      hasNext = response.hasNext || 0;
      pageNo++;

      // レート制限対策: 少し待機
      if (hasNext === 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return allData;
  }

  /**
   * XMLレスポンスをパース
   */
  private async parseResponse(xmlData: string, type?: ScoringType): Promise<ScoringListResponse> {
    try {
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false,
      });
      const result: any = await parser.parseStringPromise(xmlData);

      // ネームスペースを考慮してルート要素を取得
      const root = result['document'] || result['GetScoringAiListXML'] || result;

      const response: ScoringListResponse = {
        status: root.result?.status || 'UNKNOWN',
        statusCode: root.result?.statusCode || '',
      };

      if (root.list?.data) {
        const dataArray = Array.isArray(root.list.data)
          ? root.list.data
          : [root.list.data];

        response.list = {
          data: dataArray.map((item: any) => this.parseDataItem(item, type)),
        };
      }

      if (root.data?.page?.$?.hasNext !== undefined) {
        response.hasNext = parseInt(root.data.page.$.hasNext, 10);
      }

      return response;
    } catch (error) {
      console.error('XMLパースエラー:', error);
      throw error;
    }
  }

  /**
   * 個別データアイテムのパース
   */
  private parseDataItem(item: any, type?: ScoringType): ScoringData {
    // タイプごとに異なる要素名に対応
    let scoring: any;
    if (type === 'ai-hearts') {
      // Heartsの場合は <scoringHearts> 要素
      scoring = item.scoringHearts || item.scoring || item;
    } else if (type === 'dx-g') {
      // DX-Gの場合は <scoring> 要素（Aiと同じ）
      scoring = item.scoring || item;
    } else {
      // AIの場合は <scoring> 要素
      scoring = item.scoring || item;
    }

    const attrs = scoring.$ || {};

    // 総合点の取得（全タイプ共通: _キーに格納）
    const totalScoreText = scoring._ || attrs.totalScore || '0';
    const totalScore = parseFloat(totalScoreText) / 1000;

    // 日時フォーマット: 20251121195411 -> 2025-11-21 19:54:11
    const rawDate = attrs.scoringDateTime || attrs.scoringDttm || '';
    let playDate = rawDate;
    if (rawDate && rawDate.length === 14) {
      playDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)} ${rawDate.substring(8, 10)}:${rawDate.substring(10, 12)}:${rawDate.substring(12, 14)}`;
    }

    return {
      ...attrs, // その他の属性を先に展開
      // 計算済みの値で上書き
      scoringAiId: attrs.scoringAiId || attrs.scoringHeartsHistoryId || attrs.scoringDxgId || '',
      songName: attrs.contentsName || attrs.songName || '',
      artistName: attrs.artistName || '',
      playDate,
      totalScore,
      pitchScore: attrs.radarChartPitch ? parseFloat(attrs.radarChartPitch) : undefined,
      stabilityScore: attrs.radarChartStability ? parseFloat(attrs.radarChartStability) : undefined,
      expressionScore: attrs.radarChartExpressive ? parseFloat(attrs.radarChartExpressive) : undefined,
      rhythmScore: attrs.radarChartRhythm ? parseFloat(attrs.radarChartRhythm) : undefined,
      longToneScore: attrs.radarChartVibratoLongtone ? parseFloat(attrs.radarChartVibratoLongtone) : undefined,
    };
  }
}
