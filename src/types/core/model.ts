import { appConfig } from "@/configs/appConfig";
import type { IServiceConstructorData } from "./api";
import { Api } from "./api";

/**
 * Core model, every model extending this class initializes an Api service instance.
 */
export class Model {
  static api: Api;
  static path: string;
  static area: string;

  static setup(
    modelConfig: IServiceConstructorData = {
      path: "",
    }
  ) {
    const { path, baseUrl } = modelConfig;

    this.api = new Api({
      path,
      baseUrl: baseUrl || appConfig.apiEndpoint,
    });
    this.path = path;
  }
}
