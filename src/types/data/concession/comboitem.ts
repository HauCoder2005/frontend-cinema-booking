import { CartItem } from "./combo";

export interface IComboItem {
    id: number;
    comboId: number;
    productName: String;
    description: String;
    image_url: String;
    stock: number;
    quantity: number;
    is_active: boolean;
    price: number;
    productId: number;
}
export interface IComboItemData {
    id: number;
    comboId: number;
    productId: number;
    quantity: number;
}
export const convertComboItemToCartItem = (
    item: IComboItem
): CartItem => {
    return {
        id: item.id,
        name: item.productName as string,
        description: item.description as string,
        price: item.price,
        imageUrl: item.image_url as string,
        isActive: item.is_active,
        createdAt: "",
        stock: item.stock,
        type: "SINGLE",
        itemList: [], // vì đây là sản phẩm đơn
        quantity: item.quantity,
        productId: item.productId,
    };
};
export const convertCartItemToComboItemData = (
    item: CartItem
): IComboItemData => {
    return {
        id: item.id || 0,
        comboId: 0,
        productId: item.productId,
        quantity: item.quantity,
    }
};