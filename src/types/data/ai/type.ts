export interface IAiChatRequest {
  message: string;
}

export interface IAiChatResponse {
  message: string;
}

export interface IAiChatApiResponse {
  message: string;
  data: IAiChatResponse;
}