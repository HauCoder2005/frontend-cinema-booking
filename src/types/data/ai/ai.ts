import { IResponse } from "@/types/core/api";
import { Model } from "../../core/model";
import { IAiChatRequest, IAiChatResponse } from "./type";

const modelConfig = {
  path: "client/ai",
  modal: "ai",
};

export class AiChat extends Model {
  static queryKeys = {
    chat: "AI_CHAT_MUTATION",
  };

  static chat(payload: IAiChatRequest) {
    return this.api
      .post<IResponse<IAiChatResponse>>({
        url: "/client/ai/chat",
        data: payload,
      })
      .then((r) => r.data);
  }
}

AiChat.setup();