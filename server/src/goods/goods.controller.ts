import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { GoodsService } from './goods.service';
import { CreateGoodsDto } from './dto/create-goods.dto';
import { UpdateGoodsDto } from './dto/update-goods.dto';
import { CreateGoodsCategoryDto } from './dto/create-goods-category.dto';
import { UpdateGoodsCategoryDto } from './dto/update-goods-category.dto';
import { QueryGoodsDto } from './dto/query-goods.dto';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  // 商品相关接口
  @Post()
  create(@Body() createGoodsDto: CreateGoodsDto) {
    return this.goodsService.createGoods(createGoodsDto);
  }

  @Get()
  findAll(@Query() query: QueryGoodsDto) {
    return this.goodsService.findAllGoods(query);
  }

  @Get('search')
  search(@Query('keyword') keyword?: string, @Query('limit') limit?: number) {
    return this.goodsService.searchGoods(keyword, limit || 10);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goodsService.findOneGoods(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoodsDto: UpdateGoodsDto,
  ) {
    return this.goodsService.updateGoods(id, updateGoodsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goodsService.removeGoods(id);
  }

  @Post('batch-delete')
  batchDelete(@Body('ids') ids: number[]) {
    return this.goodsService.batchDeleteGoods(ids);
  }

  @Post(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.goodsService.restoreGoods(id);
  }

  @Post('batch-confirm')
  batchConfirm(@Body('ids') ids: number[]) {
    return this.goodsService.batchConfirmGoods(ids);
  }

  @Post('batch-unconfirm')
  batchUnconfirm(@Body('ids') ids: number[]) {
    return this.goodsService.batchUnconfirmGoods(ids);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.goodsService.findByBarcode(barcode);
  }

  // 商品分类相关接口
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateGoodsCategoryDto) {
    return this.goodsService.createCategory(createCategoryDto);
  }

  @Get('categories')
  findAllCategories() {
    return this.goodsService.findAllCategories();
  }

  @Get('categories/:id')
  findOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.goodsService.findOneCategory(id);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateGoodsCategoryDto,
  ) {
    return this.goodsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.goodsService.removeCategory(id);
  }
}
