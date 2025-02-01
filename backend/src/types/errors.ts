export type ErrorCode =
  | 'INVALID_JSON'
  | 'VALIDATION_ERROR'
  | 'LLM_ERROR'
  | 'SEARCH_ERROR'
  | 'DATABASE_ERROR';

export interface ApiError {
  error: string;
  code: ErrorCode;
  details?: any;
  originalQuery?: string;
}
