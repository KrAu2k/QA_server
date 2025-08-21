"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const goods_service_1 = require("./goods.service");
const goods_controller_1 = require("./goods.controller");
const goods_entity_1 = require("./entities/goods.entity");
const goods_category_entity_1 = require("./entities/goods-category.entity");
let GoodsModule = class GoodsModule {
};
exports.GoodsModule = GoodsModule;
exports.GoodsModule = GoodsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([goods_entity_1.Goods, goods_category_entity_1.GoodsCategory])],
        controllers: [goods_controller_1.GoodsController],
        providers: [goods_service_1.GoodsService],
        exports: [goods_service_1.GoodsService],
    })
], GoodsModule);
//# sourceMappingURL=goods.module.js.map