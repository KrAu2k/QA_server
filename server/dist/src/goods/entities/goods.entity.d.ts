import { GoodsCategory } from './goods-category.entity';
export declare class Goods {
    id: number;
    name: string;
    sn: string;
    barcode: string;
    category: GoodsCategory;
    categoryId: number;
    isConfirm: boolean;
    isActive: boolean;
    isTrash: boolean;
    isStar: boolean;
    unit: string;
    pcs: string;
    volume: number;
    grossWeight: number;
    netWeight: number;
    carrier: number;
    purchasePrice: number;
    costPrice: number;
    retailPrice: number;
    wholesalePrice: number;
    memberedPrice: number;
    deputyPrice: number;
    inventoryAlert: number;
    creatorId: number;
    created: Date;
}
