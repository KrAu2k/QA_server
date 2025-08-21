import { GoodsService } from './goods.service';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { CreateGoodsCategoryDto } from './dto/create-goods-category.dto';
import { UpdateGoodsCategoryDto } from './dto/update-goods-category.dto';
import { QueryGoodsDto } from './dto/query-goods.dto';
export declare class GoodsController {
    private readonly goodsService;
    constructor(goodsService: GoodsService);
    create(createGoodsDto: CreateGoodsDto): Promise<import("./entities/goods.entity").Goods>;
    findAll(query: QueryGoodsDto): Promise<{
        data: import("./entities/goods.entity").Goods[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    search(keyword?: string, limit?: number): Promise<import("./entities/goods.entity").Goods[]>;
    findOne(id: number): Promise<import("./entities/goods.entity").Goods>;
    update(id: number, updateGoodsDto: UpdateGoodsDto): Promise<import("./entities/goods.entity").Goods>;
    remove(id: number): Promise<void>;
    batchDelete(ids: number[]): Promise<void>;
    restore(id: number): Promise<import("./entities/goods.entity").Goods>;
    batchConfirm(ids: number[]): Promise<void>;
    batchUnconfirm(ids: number[]): Promise<void>;
    findByBarcode(barcode: string): Promise<import("./entities/goods.entity").Goods>;
    createCategory(createCategoryDto: CreateGoodsCategoryDto): Promise<import("./entities/goods-category.entity").GoodsCategory>;
    findAllCategories(): Promise<import("./entities/goods-category.entity").GoodsCategory[]>;
    findOneCategory(id: number): Promise<import("./entities/goods-category.entity").GoodsCategory>;
    updateCategory(id: number, updateCategoryDto: UpdateGoodsCategoryDto): Promise<import("./entities/goods-category.entity").GoodsCategory>;
    removeCategory(id: number): Promise<void>;
}
