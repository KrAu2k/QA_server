import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Like } from 'typeorm';
import { Goods } from './entities/goods.entity';
import { GoodsCategory } from './entities/goods-category.entity';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { CreateGoodsCategoryDto } from './dto/create-goods-category.dto';
import { UpdateGoodsCategoryDto } from './dto/update-goods-category.dto';
import { QueryGoodsDto } from './dto/query-goods.dto';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Goods)
    private goodsRepository: Repository<Goods>,
    @InjectRepository(GoodsCategory)
    private goodsCategoryRepository: Repository<GoodsCategory>,
  ) {}

  // 商品相关方法
  async createGoods(createGoodsDto: CreateGoodsDto): Promise<Goods> {
    const goods = this.goodsRepository.create({
      ...createGoodsDto,
      sn: createGoodsDto.sn || await this.generateGoodsSn(),
    });

    return this.goodsRepository.save(goods);
  }

  async findAllGoods(query: QueryGoodsDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const queryBuilder = this.buildGoodsQueryBuilder(filters);
    
    // 排序
    queryBuilder.orderBy(`goods.${sortBy}`, sortOrder);

    // 分页
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

  async findOneGoods(id: number): Promise<Goods> {
    const goods = await this.goodsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!goods) {
      throw new NotFoundException(`商品 #${id} 不存在`);
    }

    return goods;
  }

  async updateGoods(id: number, updateGoodsDto: UpdateGoodsDto): Promise<Goods> {
    await this.findOneGoods(id);
    await this.goodsRepository.update(id, updateGoodsDto);
    return this.findOneGoods(id);
  }

  async removeGoods(id: number): Promise<void> {
    await this.goodsRepository.update(id, { isTrash: true });
  }

  async restoreGoods(id: number): Promise<Goods> {
    await this.goodsRepository.update(id, { isTrash: false });
    return this.findOneGoods(id);
  }

  async batchDeleteGoods(ids: number[]): Promise<void> {
    await this.goodsRepository.update(ids, { isTrash: true });
  }

  async batchConfirmGoods(ids: number[]): Promise<void> {
    await this.goodsRepository.update(ids, { isConfirm: true });
  }

  async batchUnconfirmGoods(ids: number[]): Promise<void> {
    await this.goodsRepository.update(ids, { isConfirm: false });
  }

  // 商品分类相关方法
  async createCategory(createCategoryDto: CreateGoodsCategoryDto): Promise<GoodsCategory> {
    const category = this.goodsCategoryRepository.create(createCategoryDto);
    return this.goodsCategoryRepository.save(category);
  }

  async findAllCategories(): Promise<GoodsCategory[]> {
    return this.goodsCategoryRepository.find({
      order: { created: 'DESC' },
    });
  }

  async findOneCategory(id: number): Promise<GoodsCategory> {
    const category = await this.goodsCategoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`商品分类 #${id} 不存在`);
    }

    return category;
  }

  async updateCategory(id: number, updateCategoryDto: UpdateGoodsCategoryDto): Promise<GoodsCategory> {
    await this.findOneCategory(id);
    await this.goodsCategoryRepository.update(id, updateCategoryDto);
    return this.findOneCategory(id);
  }

  async removeCategory(id: number): Promise<void> {
    // 检查是否有商品使用该分类
    const goodsCount = await this.goodsRepository.count({
      where: { categoryId: id },
    });

    if (goodsCount > 0) {
      throw new BadRequestException('该分类下还有商品，不能删除');
    }

    await this.goodsCategoryRepository.delete(id);
  }

  // 根据条码查找商品
  async findByBarcode(barcode: string): Promise<Goods | null> {
    return this.goodsRepository.findOne({
      where: { barcode },
      relations: ['category'],
    });
  }

  // 搜索商品（用于销售订单等场景）
  async searchGoods(keyword: string, limit: number = 10): Promise<Goods[]> {
    return this.goodsRepository.find({
      where: [
        { name: Like(`%${keyword}%`), isTrash: false, isActive: true },
        { sn: Like(`%${keyword}%`), isTrash: false, isActive: true },
        { barcode: Like(`%${keyword}%`), isTrash: false, isActive: true },
      ],
      relations: ['category'],
      take: limit,
      order: { name: 'ASC' },
    });
  }

  // 生成商品编号
  private async generateGoodsSn(): Promise<string> {
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

  // 构建商品查询条件
  private buildGoodsQueryBuilder(filters: any): SelectQueryBuilder<Goods> {
    const queryBuilder = this.goodsRepository
      .createQueryBuilder('goods')
      .leftJoinAndSelect('goods.category', 'category');

    // 默认不显示已删除的记录
    if (filters.isTrash !== true) {
      queryBuilder.andWhere('goods.isTrash = :isTrash', { isTrash: false });
    }

    // 商品名称搜索
    if (filters.name) {
      queryBuilder.andWhere('goods.name LIKE :name', { name: `%${filters.name}%` });
    }

    // 商品编码搜索
    if (filters.sn) {
      queryBuilder.andWhere('goods.sn LIKE :sn', { sn: `%${filters.sn}%` });
    }

    // 条码搜索
    if (filters.barcode) {
      queryBuilder.andWhere('goods.barcode LIKE :barcode', { barcode: `%${filters.barcode}%` });
    }

    // 分类筛选
    if (filters.categoryId) {
      queryBuilder.andWhere('goods.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    // 状态筛选
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
}
