import { Repository } from 'typeorm';
import { Goods } from './entities/goods.entity';
import { GoodsCategory } from './entities/goods-category.entity';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { CreateGoodsCategoryDto } from './dto/create-goods-category.dto';
import { UpdateGoodsCategoryDto } from './dto/update-goods-category.dto';
import { QueryGoodsDto } from './dto/query-goods.dto';
export declare class GoodsService {
    private goodsRepository;
    private goodsCategoryRepository;
    constructor(goodsRepository: Repository<Goods>, goodsCategoryRepository: Repository<GoodsCategory>);
    createGoods(createGoodsDto: CreateGoodsDto): Promise<Goods>;
    findAllGoods(query: QueryGoodsDto): Promise<{
        data: Goods[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOneGoods(id: number): Promise<Goods>;
    updateGoods(id: number, updateGoodsDto: UpdateGoodsDto): Promise<Goods>;
    removeGoods(id: number): Promise<void>;
    restoreGoods(id: number): Promise<Goods>;
    batchDeleteGoods(ids: number[]): Promise<void>;
    batchConfirmGoods(ids: number[]): Promise<void>;
    batchUnconfirmGoods(ids: number[]): Promise<void>;
    createCategory(createCategoryDto: CreateGoodsCategoryDto): Promise<GoodsCategory>;
    findAllCategories(): Promise<GoodsCategory[]>;
    findOneCategory(id: number): Promise<GoodsCategory>;
    updateCategory(id: number, updateCategoryDto: UpdateGoodsCategoryDto): Promise<GoodsCategory>;
    removeCategory(id: number): Promise<void>;
    findByBarcode(barcode: string): Promise<Goods | null>;
    searchGoods(keyword: string, limit?: number): Promise<Goods[]>;
    private generateGoodsSn;
    private buildGoodsQueryBuilder;
}
