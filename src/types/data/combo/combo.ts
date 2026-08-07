import { Model } from "@/types/core/model";

export interface ICombo {
  message: string;
  data: IComboItem[];
  meta: IComboMeta;
}

export interface IComboItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  isActive: number;
  type: string;
  itemList?: IComboItemList[];
  description?: string;
}

export interface IComboItemList {
  productId: number;
  productName: string;
  quantity: number;
}

export interface IComboMeta {
  total: number;
  perPage: number;
  page: number;
}
export class Combo extends Model {
  static queryKeys = {
    paginate: "COMBO_PAGINATE_QUERY",
    findOne: "COMBO_FIND_ONE_QUERY",
  };
  static getCombos(params: { page: number; perPage: number; filterType: string }) {
    return {
      queryKey: [this.queryKeys.paginate],
      queryFn: () => {
        return this.api.get<ICombo>({
          url: "/public/combo",
          params: params,
        });
      },
    };
  }
}
Combo.setup()