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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goods = void 0;
const typeorm_1 = require("typeorm");
const goods_category_entity_1 = require("./goods-category.entity");
let Goods = class Goods {
};
exports.Goods = Goods;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Goods.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], Goods.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, unique: true }),
    __metadata("design:type", String)
], Goods.prototype, "sn", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, nullable: true, unique: true }),
    __metadata("design:type", String)
], Goods.prototype, "barcode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => goods_category_entity_1.GoodsCategory),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", goods_category_entity_1.GoodsCategory)
], Goods.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", Number)
], Goods.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'is_confirm' }),
    __metadata("design:type", Boolean)
], Goods.prototype, "isConfirm", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'is_active' }),
    __metadata("design:type", Boolean)
], Goods.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_trash' }),
    __metadata("design:type", Boolean)
], Goods.prototype, "isTrash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_star' }),
    __metadata("design:type", Boolean)
], Goods.prototype, "isStar", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: '' }),
    __metadata("design:type", String)
], Goods.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: '' }),
    __metadata("design:type", String)
], Goods.prototype, "pcs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0, nullable: true }),
    __metadata("design:type", Number)
], Goods.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0, nullable: true, name: 'gross_weight' }),
    __metadata("design:type", Number)
], Goods.prototype, "grossWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0, nullable: true, name: 'net_weight' }),
    __metadata("design:type", Number)
], Goods.prototype, "netWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Goods.prototype, "carrier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'purchase_price' }),
    __metadata("design:type", Number)
], Goods.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'cost_price' }),
    __metadata("design:type", Number)
], Goods.prototype, "costPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'retail_price' }),
    __metadata("design:type", Number)
], Goods.prototype, "retailPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'wholesale_price' }),
    __metadata("design:type", Number)
], Goods.prototype, "wholesalePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'membered_price' }),
    __metadata("design:type", Number)
], Goods.prototype, "memberedPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'deputy_price' }),
    __metadata("design:type", Number)
], Goods.prototype, "deputyPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 16, scale: 3, default: 0, name: 'inventory_alert' }),
    __metadata("design:type", Number)
], Goods.prototype, "inventoryAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creator_id', default: 1 }),
    __metadata("design:type", Number)
], Goods.prototype, "creatorId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Goods.prototype, "created", void 0);
exports.Goods = Goods = __decorate([
    (0, typeorm_1.Entity)('goods')
], Goods);
//# sourceMappingURL=goods.entity.js.map