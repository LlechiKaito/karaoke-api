// DAM API レスポンスの型定義

// 採点タイプ
export type ScoringType = 'ai' | 'ai-hearts' | 'dx-g';

export interface ScoringData {
  scoringAiId: string;
  songName: string;
  artistName: string;
  playDate: string;
  totalScore: number;
  pitchScore?: number;
  stabilityScore?: number;
  expressionScore?: number;
  rhythmScore?: number;
  longToneScore?: number;
  // その他の詳細データ
  [key: string]: any;
}

export interface ScoringListResponse {
  status: string;
  statusCode: string;
  list?: {
    data: ScoringData[];
  };
  hasNext?: number;
}

export interface DAMClientConfig {
  cdmCardNo: string;
  cdmToken?: string;  // DX-G使用時に必要
  baseUrl?: string;
}

// 採点タイプの設定
export interface ScoringTypeConfig {
  endpoint: string;
  namespace: string;
  name: string;
}
