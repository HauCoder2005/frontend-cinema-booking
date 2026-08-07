import { IHttpError, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";

export interface IBanner {
    id: number;
    title: string;
    imageUrl: string;
    linkUrl: string;
    isActive: boolean;
    createdAt: string;
    position: String;
}
export interface BannerFormData {
    title: string;
    imageUrl: string;
    linkUrl: string;
    is_active: boolean;
    position: String;
    bannerFile: FileList;
}
export const initialBannerData: BannerFormData = {
    title: "",
    imageUrl: "",
    linkUrl: "",
    is_active: true,
    position: "HOME",
    bannerFile: null,
};
const modelConfig = {
    path: '/public/banner',
    modal: 'BannerList'
}
export class Banner extends Model {
    static queryKeys = {
        paginate: 'BANNERS_PAGINATE_QUERY',
        findOne: 'BANNERS_FIND_ONE_QUERY',
        all: 'BANNERS_ALL_QUERY'
    }
    static objects = ObjectsFactory.factory<IBanner>(modelConfig, this.queryKeys)
    static getBanner() {
        return {
            queryKey: [this.queryKeys.all],
            queryFn: () => {
                return this.api.get<IResponse<IBanner[]>>({
                    url: '/public/banner',
                }).then(res => res.data);
            }
        }
    }
    static getBannerDetail(id: number) {
        return {
            queryKey: [this.queryKeys.findOne],
            queryFn: () => {
                return this.api.get<IResponse<IBanner>>({
                    url: `/public/banner/${id}`
                }).then(res => res.data);
            }
        }
    }
    static createBanner(payload: FormData) {
        return this.api.post<IResponse<IBanner>>({
            url: "/admin/banner",
            data: payload
        })
    }
    static updateBanner(id: number, payload: FormData) {
        return this.api.put<IResponse<IBanner>>({
            url: `/admin/banner/${id}`,
            data: payload
        })
    }
    static deleteBanner(id: number) {
        return this.api.delete<IResponse<IBanner>>({
            url: `/admin/banner/${id}`,
        })
    }

}
Banner.setup();
export function useCreateBannerMutation() {
    return useMutation<IResponse<IBanner>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Banner.createBanner(payload).then((r) => r.data);
        },
    });
}
export function useUpdateBannerMutation() {
    return useMutation<IResponse<IBanner>, IHttpError, { id: number, payload: FormData }>({
        mutationFn: ({ id, payload }: { id: number, payload: FormData }) => {
            return Banner.updateBanner(id, payload).then((r) => r.data);
        },
    });
}
export function useDeleteBannerMutation() {
    return useMutation<IResponse<IBanner>, IHttpError, number>({
        mutationFn: (id: number) => {
            return Banner.deleteBanner(id).then((r) => r.data);
        },
    });
}