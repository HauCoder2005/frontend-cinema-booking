import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IComboItem } from "./comboitem";
import { useMutation } from "@tanstack/react-query";

export interface ICombo {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    stock: number;
    type: string;
    itemList: IComboItem[];
}
export interface ISCombo {
    name: string;
    price: number;
    comboItem: IComboItem[];
}
export interface IComboData {
    name: string;
    price: number;
    bannerFile: FileList;
    comboItem: ICombo[];
}
export interface IProductData {
    name: string;
    price: number;
    description: string;
    stock: number;
    bannerFile: FileList;
}
export interface CartItem extends ICombo {
    quantity: number;
    productId: number;
}
export const initialProductData: IProductData = {
    name: "",
    price: 0,
    description: "",
    stock: 0,
    bannerFile: null,
}
export const initialComboData: IComboData = {
    name: "",
    price: 0,
    bannerFile: null,
    comboItem: null,
}
const modelConfig = {
    path: '/public/combo',
    modal: 'ConcessionList'
}
export class Combo extends Model {
    static queryKeys = {
        paginate: 'COMBOS_PAGINATE_QUERY',
        adminPaginate: 'COMBOS_ADMIN_PAGINATE_QUERY',
        findOne: 'COMBOS_FIND_ONE_QUERY',
        updateComboActive: 'COMBO_UPDATE_ACTIVE_MUTATION',
        updateProductActive: 'PRODUCT_UPDATE_ACTIVE_MUTATION',
    }
    static objects = ObjectsFactory.factory<ICombo>(modelConfig, this.queryKeys)
    static normalizeIsActive(value: boolean | number | null | undefined) {
        if (typeof value === "number") return value === 1;
        return value === true;
    }
    static normalizeType(value: string | null | undefined, itemList?: IComboItem[] | null) {
        const normalizedValue = value?.trim().toUpperCase();

        if (normalizedValue === "COMBO") return "COMBO";
        if (
            normalizedValue === "SINGLE" ||
            normalizedValue === "PRODUCT" ||
            normalizedValue === "PRODUCT_SINGLE"
        ) {
            return "SINGLE";
        }

        if (Array.isArray(itemList)) {
            return "COMBO";
        }

        return "SINGLE";
    }
    static normalizeComboItems(
        itemList: IComboItem[] | null | undefined,
        productLookup: Map<number, ICombo>
    ): IComboItem[] {
        if (!Array.isArray(itemList)) {
            return [];
        }

        return itemList.map((comboItem) => {
            const productId = Number((comboItem as any)?.productId ?? 0);
            const product = productLookup.get(productId);

            return {
                ...comboItem,
                id: Number((comboItem as any)?.id ?? 0),
                comboId: Number((comboItem as any)?.comboId ?? 0),
                productId,
                quantity: Number((comboItem as any)?.quantity ?? 0),
                productName:
                    String(
                        (comboItem as any)?.productName ??
                        (comboItem as any)?.name ??
                        product?.name ??
                        `Sản phẩm #${productId || "?"}`
                    ),
                description: String(
                    (comboItem as any)?.description ??
                    product?.description ??
                    ""
                ),
                image_url: String(
                    (comboItem as any)?.image_url ??
                    (comboItem as any)?.imageUrl ??
                    product?.imageUrl ??
                    ""
                ),
                stock: Number(
                    (comboItem as any)?.stock ??
                    product?.stock ??
                    0
                ),
                is_active:
                    typeof (comboItem as any)?.is_active === "boolean"
                        ? (comboItem as any).is_active
                        : this.normalizeIsActive(
                            (comboItem as any)?.isActive ??
                            product?.isActive
                        ),
                price: Number(
                    (comboItem as any)?.price ??
                    product?.price ??
                    0
                ),
            } satisfies IComboItem;
        });
    }
    static normalizePaginateResponse(
        payload: IPaginateResponse<ICombo> | IResponse<ICombo[]> | undefined,
        params?: { page?: number; size?: number }
    ): IPaginateResponse<ICombo> {
        const rawData = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray((payload as any)?.data?.data)
                ? (payload as any).data.data
                : Array.isArray((payload as any)?.data?.content)
                    ? (payload as any).data.content
                    : Array.isArray((payload as any)?.content)
                        ? (payload as any).content
                        : [];

        const normalizedData = Array.isArray(rawData)
            ? rawData.map((item) => ({
                ...item,
                type: this.normalizeType(item.type, item.itemList),
                isActive: this.normalizeIsActive(item.isActive as boolean | number),
            }))
            : [];

        const productLookup = new Map<number, ICombo>(
            normalizedData
                .filter((item) => item.type === "SINGLE")
                .map((item) => [Number(item.id), item as ICombo])
        );

        const data = normalizedData.map((item) => ({
            ...item,
            stock: Number(item.stock ?? 0),
            price: Number(item.price ?? 0),
            itemList: this.normalizeComboItems(item.itemList, productLookup),
        }));

        const nestedMeta = (payload as any)?.data?.meta;
        const topLevelMeta = (payload as any)?.meta;

        const meta = nestedMeta || topLevelMeta
            ? (nestedMeta || topLevelMeta)
            : {
                page: params?.page ?? 1,
                total: data.length,
                perPage: params?.size ?? data.length,
            };

        return {
            message: payload?.message || "",
            data,
            meta,
        };
    }
    static fetchAdminConcessions(params?: { page?: number; size?: number }) {
        const urls = ["/combos", "/combo"];

        return (async () => {
            let lastError: unknown = null;

            for (const url of urls) {
                try {
                    const response =
                        await this.api.get<IPaginateResponse<ICombo> | IResponse<ICombo[]>>({
                            url,
                            params,
                        });

                    return this.normalizePaginateResponse(
                        response.data,
                        params
                    );
                } catch (error) {
                    lastError = error;
                }
            }

            if (lastError) throw lastError;

            return this.normalizePaginateResponse(undefined, params);
        })();
    }
    static adminSingleTypePaginateQueryFactory(
        type: "COMBO" | "SINGLE",
        params?: { page?: number; size?: number }
    ) {
        return {
            queryKey: [this.queryKeys.adminPaginate, type, params],
            queryFn: async () => {
                const response = await this.fetchAdminConcessions(params);
                const filteredData = response.data.filter((item) => item.type === type);

                return {
                    ...response,
                    data: filteredData,
                    meta: {
                        ...response.meta,
                        totalItems: filteredData.length,
                        totalPages: 1,
                        page: response.meta?.page ?? 1,
                        pageSize: filteredData.length,
                    },
                } satisfies IPaginateResponse<ICombo>;
            },
        };
    }
    static adminComboPaginateQueryFactory(params?: { page?: number; size?: number }) {
        return this.adminSingleTypePaginateQueryFactory("COMBO", params);
    }
    static adminProductPaginateQueryFactory(params?: { page?: number; size?: number }) {
        return this.adminSingleTypePaginateQueryFactory("SINGLE", params);
    }
    static adminPaginateQueryFactory(params?: { page?: number; size?: number }) {
        return {
            queryKey: [this.queryKeys.adminPaginate, params],
            queryFn: () => this.fetchAdminConcessions(params),
        }
    }
    static createCombo(payload: FormData) {
        return this.api.post<IResponse<ICombo>>({
            url: '/public/combo/add',
            data: payload
        })
    }
    static createProduct(payload: FormData) {
        return this.api.post<IResponse<ICombo>>({
            url: '/product/add',
            data: payload
        })
    }
    static editCombo(id: number, payload: FormData) {
        return this.api.put<IResponse<ICombo>>({
            url: `/public/combo/${id}`,
            data: payload
        })
    }
    static editProduct(id: number, payload: FormData) {
        return this.api.put<IResponse<ICombo>>({
            url: `/public/product/${id}`,
            data: payload
        })
    }
    static deleteCombo(id: number) {
        return this.api.delete<IResponse<ICombo>>({
            url: `/public/combo/${id}`,
        })
    }
    static deleteProduct(id: number) {
        return this.api.delete<IResponse<ICombo>>({
            url: `/public/product/${id}`,
        })
    }
    static activateComboAdmin(id: number) {
        return this.api.put<IResponse<unknown>>({
            url: `/combos/${id}/activate`,
        })
    }
    static deactivateComboAdmin(id: number) {
        return this.api.put<IResponse<unknown>>({
            url: `/combos/${id}/deactivate`,
        })
    }
    static activateProductAdmin(id: number) {
        return this.api.put<IResponse<unknown>>({
            url: `/products/${id}/activate`,
        })
    }
    static deactivateProductAdmin(id: number) {
        return this.api.put<IResponse<unknown>>({
            url: `/products/${id}/deactivate`,
        })
    }
    static toggleProductPublic(id: number) {
        return this.api.patch<IResponse<unknown>>({
            url: `/public/product/${id}/toggle-active`,
        })
    }
    static async toggleProductAdmin(id: number) {
        const urls = [
            `/product/${id}/toggle-active`,
            `/products/${id}/toggle-active`,
        ];

        let lastError: unknown = null;

        for (const url of urls) {
            try {
                return await this.api.patch<IResponse<unknown>>({
                    url,
                });
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError;
    }
    static updateComboActiveAdmin(id: number, nextIsActive: boolean) {
        return nextIsActive
            ? this.activateComboAdmin(id)
            : this.deactivateComboAdmin(id);
    }
    static updateProductActiveAdmin(id: number, _nextIsActive: boolean) {
        return this.toggleProductAdmin(id);
    }
}
Combo.setup();
export function useCreateComboMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Combo.createCombo(payload).then((r) => r.data);
        },
    });
}
export function useCreateProductMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Combo.createProduct(payload).then((r) => r.data);
        },
    });
}

export function useEditComboMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, { payload: FormData, id: number }>({
        mutationFn: ({ id, payload }: { id: number, payload: FormData }) => {
            return Combo.editCombo(id, payload).then((r) => r.data);
        }
    })
}

export function useEditProductMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, { payload: FormData, id: number }>({
        mutationFn: ({ id, payload }: { id: number, payload: FormData }) => {
            return Combo.editProduct(id, payload).then((r) => r.data);
        }
    })
}

export function useDeleteComboMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, number>({
        mutationFn: (id: number) => {
            return Combo.deleteCombo(id).then((r) => r.data)
        }
    })
}

export function useDeleteProductMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, number>({
        mutationFn: (id: number) => {
            return Combo.deleteProduct(id).then((r) => r.data)
        }
    })
}

export function useUpdateComboActiveMutation() {
    return useMutation<IResponse<unknown>, IHttpError, { id: number; nextIsActive: boolean }>({
        mutationFn: ({ id, nextIsActive }: { id: number; nextIsActive: boolean }) => {
            return Combo.updateComboActiveAdmin(id, nextIsActive).then((r) => r.data)
        }
    })
}

export function useUpdateProductActiveMutation() {
    return useMutation<IResponse<unknown>, IHttpError, { id: number; nextIsActive: boolean }>({
        mutationFn: ({ id, nextIsActive }: { id: number; nextIsActive: boolean }) => {
            return Combo.updateProductActiveAdmin(id, nextIsActive).then((r) => r.data)
        }
    })
}

export const convertIComboToISCombo = (
    item: ICombo
): ISCombo => {
    return {
        name: item.name as string,
        price: item.price,
        comboItem: item.itemList as IComboItem[],
    }
};
