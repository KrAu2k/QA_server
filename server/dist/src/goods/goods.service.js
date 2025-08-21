"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const goods_entity_1 = require("./entities/goods.entity");
const goods_category_entity_1 = require("./entities/goods-category.entity");
let GoodsService = class GoodsService {
    constructor(goodsRepository, goodsCategoryRepository) {
        this.goodsRepository = goodsRepository;
        this.goodsCategoryRepository = goodsCategoryRepository;
    }
    async createGoods(createGoodsDto) {
        const goods = this.goodsRepository.create({
            ...createGoodsDto,
            sn: createGoodsDto.sn || await this.generateGoodsSn(),
        });
        return this.goodsRepository.save(goods);
    }
    async findAllGoods(query) {
        const { page = 1, limit = 20, sortBy = 'created', sortOrder = 'DESC', ...filters } = query;
        const queryBuilder = this.buildGoodsQueryBuilder(filters);
        queryBuilder.orderBy(`goods.${sortBy}`, sortOrder);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOneGoods(id) {
        const goods = await this.goodsRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!goods) {
            throw new common_1.NotFoundException(`商品 #${id} 不存在`);
        }
        return goods;
    }
    async updateGoods(id, updateGoodsDto) {
        await this.findOneGoods(id);
        await this.goodsRepository.update(id, updateGoodsDto);
        return this.findOneGoods(id);
    }
    async removeGoods(id) {
        await this.goodsRepository.update(id, { isTrash: true });
    }
    async restoreGoods(id) {
        await this.goodsRepository.update(id, { isTrash: false });
        return this.findOneGoods(id);
    }
    async batchDeleteGoods(ids) {
        await this.goodsRepository.update(ids, { isTrash: true });
    }
    async batchConfirmGoods(ids) {
        await this.goodsRepository.update(ids, { isConfirm: true });
    }
    async batchUnconfirmGoods(ids) {
        await this.goodsRepository.update(ids, { isConfirm: false });
    }
    async createCategory(createCategoryDto) {
        const category = this.goodsCategoryRepository.create(createCategoryDto);
        return this.goodsCategoryRepository.save(category);
    }
    async findAllCategories() {
        return this.goodsCategoryRepository.find({
            order: { created: 'DESC' },
        });
    }
    async findOneCategory(id) {
        const category = await this.goodsCategoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`商品分类 #${id} 不存在`);
        }
        return category;
    }
    async updateCategory(id, updateCategoryDto) {
        await this.findOneCategory(id);
        await this.goodsCategoryRepository.update(id, updateCategoryDto);
        return this.findOneCategory(id);
    }
    async removeCategory(id) {
        const goodsCount = await this.goodsRepository.count({
            where: { categoryId: id },
        });
        if (goodsCount > 0) {
            throw new common_1.BadRequestException('该分类下还有商品，不能删除');
        }
        await this.goodsCategoryRepository.delete(id);
    }
    async findByBarcode(barcode) {
        return this.goodsRepository.findOne({
            where: { barcode },
            relations: ['category'],
        });
    }
    async searchGoods(keyword, limit = 10) {
        return this.goodsRepository.find({
            where: [
                { name: (0, typeorm_2.Like)(`%${keyword}%`), isTrash: false, isActive: true },
                { sn: (0, typeorm_2.Like)(`%${keyword}%`), isTrash: false, isActive: true },
                { barcode: (0, typeorm_2.Like)(`%${keyword}%`), isTrash: false, isActive: true },
            ],
            relations: ['category'],
            take: limit,
            order: { name: 'ASC' },
        });
    }
    async generateGoodsSn() {
        const lastGoods = await this.goodsRepository
            .createQueryBuilder('goods')
            .where('goods.sn != :empty', { empty: '' })
            .orderBy('goods.sn', 'DESC')
            .getOne();
        let sequence = 1;
        if (lastGoods && lastGoods.sn) {
            const lastSequence = parseInt(lastGoods.sn.slice(-5));
            sequence = lastSequence + 1;
        }
        return `GOODS${sequence.toString().padStart(5, '0')}`;
    }
    buildGoodsQueryBuilder(filters) {
        const queryBuilder = this.goodsRepository
            .createQueryBuilder('goods')
            .leftJoinAndSelect('goods.category', 'category');
        if (filters.isTrash !== true) {
            queryBuilder.andWhere('goods.isTrash = :isTrash', { isTrash: false });
        }
        if (filters.name) {
            queryBuilder.andWhere('goods.name LIKE :name', { name: `%${filters.name}%` });
        }
        if (filters.sn) {
            queryBuilder.andWhere('goods.sn LIKE :sn', { sn: `%${filters.sn}%` });
        }
        if (filters.barcode) {
            queryBuilder.andWhere('goods.barcode LIKE :barcode', { barcode: `%${filters.barcode}%` });
        }
        if (filters.categoryId) {
            queryBuilder.andWhere('goods.categoryId = :categoryId', { categoryId: filters.categoryId });
        }
        if (filters.isConfirm !== undefined) {
            queryBuilder.andWhere('goods.isConfirm = :isConfirm', { isConfirm: filters.isConfirm });
        }
        if (filters.isActive !== undefined) {
            queryBuilder.andWhere('goods.isActive = :isActive', { isActive: filters.isActive });
        }
        if (filters.isStar !== undefined) {
            queryBuilder.andWhere('goods.isStar = :isStar', { isStar: filters.isStar });
        }
        return queryBuilder;
    }
};
exports.GoodsService = GoodsService;
exports.GoodsService = GoodsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(goods_entity_1.Goods)),
    __param(1, (0, typeorm_1.InjectRepository)(goods_category_entity_1.GoodsCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GoodsService);
//# sourceMappingURL=goods.service.js.map