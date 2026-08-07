export type IAdminPriceAdjustmentType = "AMOUNT" | "PERCENT";

export interface IAdminPriceAdjustment {
  id: number;
  name: string;
  adjustmentType: IAdminPriceAdjustmentType;
  value: number;
  applyOnDays?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}

export interface IAdminPriceAdjustmentFilterParams {
  keyword?: string;
  isActive?: boolean | null;
}

export interface IAdminPriceAdjustmentUpsertParams {
  name: string;
  adjustmentType: IAdminPriceAdjustmentType;
  value: number;
  applyOnDays?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export interface IAdminPriceAdjustmentToggleResponse {
  success: boolean;
}

export interface IAdminPriceAdjustmentDeleteResponse {
  success: boolean;
}