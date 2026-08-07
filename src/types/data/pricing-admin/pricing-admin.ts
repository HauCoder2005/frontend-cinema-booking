import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";
import { ObjectsFactory } from "@/types/core/objectFactory";
import {
  IAdminPriceAdjustment,
  IAdminPriceAdjustmentFilterParams,
  IAdminPriceAdjustmentUpsertParams,
  IAdminPriceAdjustmentToggleResponse,
  IAdminPriceAdjustmentDeleteResponse,
} from "./type";

const modelConfig = {
  path: "admin/price-adjustments",
  modal: "price-adjustments",
};

export class PricingAdmin extends Model {
  static queryKeys = {
    all: "ADMIN_PRICE_ADJUSTMENTS_QUERY",
    detail: "ADMIN_PRICE_ADJUSTMENT_DETAIL_QUERY",
    create: "ADMIN_PRICE_ADJUSTMENT_CREATE_MUTATION",
    update: "ADMIN_PRICE_ADJUSTMENT_UPDATE_MUTATION",
    toggle: "ADMIN_PRICE_ADJUSTMENT_TOGGLE_MUTATION",
    delete: "ADMIN_PRICE_ADJUSTMENT_DELETE_MUTATION",
  };

  static objects = ObjectsFactory.factory<IAdminPriceAdjustment>(
    modelConfig,
    this.queryKeys,
  );

  static getAll(params?: IAdminPriceAdjustmentFilterParams) {
    const keyword = (params?.keyword ?? "").trim();
    const isActive =
      typeof params?.isActive === "boolean" ? params.isActive : null;

    return {
      queryKey: [this.queryKeys.all, keyword || null, isActive],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminPriceAdjustment[]>>({
            url: "/admin/price-adjustments",
            params: {
              ...(keyword ? { keyword } : {}),
              ...(isActive !== null ? { isActive } : {}),
            },
          })
          .then((r) => r.data),
    };
  }

  static getDetail(id: number) {
    return {
      queryKey: [this.queryKeys.detail, id],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminPriceAdjustment>>({
            url: `/admin/price-adjustments/${id}`,
          })
          .then((r) => r.data),
    };
  }

  static create(params: IAdminPriceAdjustmentUpsertParams) {
    const name = params.name.trim();
    const adjustmentType = params.adjustmentType;
    const value = params.value;
    const applyOnDays = (params.applyOnDays ?? "").trim();
    const startDate = (params.startDate ?? "").trim();
    const endDate = (params.endDate ?? "").trim();
    const isActive = params.isActive ?? true;

    return {
      queryKey: [this.queryKeys.create],
      queryFn: () =>
        this.api
          .post<IResponse<IAdminPriceAdjustment>>({
            url: "/admin/price-adjustments",
            params: {
              name,
              adjustmentType,
              value,
              ...(applyOnDays ? { applyOnDays } : {}),
              ...(startDate ? { startDate } : {}),
              ...(endDate ? { endDate } : {}),
              isActive,
            },
          })
          .then((r) => r.data),
    };
  }

  static update(id: number, params: IAdminPriceAdjustmentUpsertParams) {
    const name = params.name.trim();
    const adjustmentType = params.adjustmentType;
    const value = params.value;
    const applyOnDays = (params.applyOnDays ?? "").trim();
    const startDate = (params.startDate ?? "").trim();
    const endDate = (params.endDate ?? "").trim();
    const isActive = params.isActive ?? true;

    return {
      queryKey: [this.queryKeys.update, id],
      queryFn: () =>
        this.api
          .put<IResponse<IAdminPriceAdjustment>>({
            url: `/admin/price-adjustments/${id}`,
            params: {
              name,
              adjustmentType,
              value,
              ...(applyOnDays ? { applyOnDays } : {}),
              ...(startDate ? { startDate } : {}),
              ...(endDate ? { endDate } : {}),
              isActive,
            },
          })
          .then((r) => r.data),
    };
  }

  static toggleActive(id: number) {
    return {
      queryKey: [this.queryKeys.toggle, id],
      queryFn: () =>
        this.api
          .patch<IResponse<IAdminPriceAdjustmentToggleResponse>>({
            url: `/admin/price-adjustments/${id}/toggle-active`,
          })
          .then((r) => r.data),
    };
  }

  static delete(id: number) {
    return {
      queryKey: [this.queryKeys.delete, id],
      queryFn: () =>
        this.api
          .delete<IResponse<IAdminPriceAdjustmentDeleteResponse>>({
            url: `/admin/price-adjustments/${id}`,
          })
          .then((r) => r.data),
    };
  }
}

PricingAdmin.setup();