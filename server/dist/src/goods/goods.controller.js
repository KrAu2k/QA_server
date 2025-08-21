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
exports.GoodsController = void 0;
const common_1 = require("@nestjs/common");
const goods_service_1 = require("./goods.service");
const create_goods_dto_1 = require("./dto/create-goods.dto");
const update_goods_dto_1 = require("./dto/update-goods.dto");
const create_goods_category_dto_1 = require("./dto/create-goods-category.dto");
const update_goods_category_dto_1 = require("./dto/update-goods-category.dto");
const query_goods_dto_1 = require("./dto/query-goods.dto");
let GoodsController = class GoodsController {
    constructor(goodsService) {
        this.goodsService = goodsService;
    }
    create(createGoodsDto) {
        return this.goodsService.createGoods(createGoodsDto);
    }
    findAll(query) {
        return this.goodsService.findAllGoods(query);
    }
    search(keyword, limit) {
        return this.goodsService.searchGoods(keyword, limit || 10);
    }
    findOne(id) {
        return this.goodsService.findOneGoods(id);
    }
    update(id, updateGoodsDto) {
        return this.goodsService.updateGoods(id, updateGoodsDto);
    }
    remove(id) {
        return this.goodsService.removeGoods(id);
    }
    batchDelete(ids) {
        return this.goodsService.batchDeleteGoods(ids);
    }
    restore(id) {
        return this.goodsService.restoreGoods(id);
    }
    batchConfirm(ids) {
        return this.goodsService.batchConfirmGoods(ids);
    }
    batchUnconfirm(ids) {
        return this.goodsService.batchUnconfirmGoods(ids);
    }
    findByBarcode(barcode) {
        return this.goodsService.findByBarcode(barcode);
    }
    createCategory(createCategoryDto) {
        return this.goodsService.createCategory(createCategoryDto);
    }
    findAllCategories() {
        return this.goodsService.findAllCategories();
    }
    findOneCategory(id) {
        return this.goodsService.findOneCategory(id);
    }
    updateCategory(id, updateCategoryDto) {
        return this.goodsService.updateCategory(id, updateCategoryDto);
    }
    removeCategory(id) {
        return this.goodsService.removeCategory(id);
    }
};
exports.GoodsController = GoodsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_goods_dto_1.CreateGoodsDto]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_goods_dto_1.QueryGoodsDto]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_goods_dto_1.UpdateGoodsDto]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('batch-delete'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "batchDelete", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)('batch-confirm'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "batchConfirm", null);
__decorate([
    (0, common_1.Post)('batch-unconfirm'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "batchUnconfirm", null);
__decorate([
    (0, common_1.Get)('barcode/:barcode'),
    __param(0, (0, common_1.Param)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_goods_category_dto_1.CreateGoodsCategoryDto]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "findOneCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_goods_category_dto_1.UpdateGoodsCategoryDto]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GoodsController.prototype, "removeCategory", null);
exports.GoodsController = GoodsController = __decorate([
    (0, common_1.Controller)('goods'),
    __metadata("design:paramtypes", [goods_service_1.GoodsService])
], GoodsController);
//# sourceMappingURL=goods.controller.js.map