export interface ApiResponse<T = unknown> {
  result: 'ok' | 'failed';
  message: string | string[] | null;
  data?: T;
  apiLatency?: number;
  timestamp?: string;
}

export interface ApiErrorResponse {
  result: 'failed';
  message: string | string[];
  apiLatency?: number;
  timestamp?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  result: 'ok';
  message: string | string[] | null;
  data?: T;
  apiLatency?: number;
  timestamp?: string;
}

export interface StandardErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  timestamp: string;
}

export interface StandardSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string | string[] | null;
  data?: T;
  timestamp: string;
}

export interface FutureApiResponse<T = unknown> {
  result: 'ok' | 'failed';
  message: string | string[] | null;
  data?: T;
}
