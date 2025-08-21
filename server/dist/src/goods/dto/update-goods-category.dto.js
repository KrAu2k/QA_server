"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoodsCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_goods_category_dto_1 = require("./create-goods-category.dto");
class UpdateGoodsCategoryDto extends (0, mapped_types_1.PartialType)(create_goods_category_dto_1.CreateGoodsCategoryDto) {
}
exports.UpdateGoodsCategoryDto = UpdateGoodsCategoryDto;
//# sourceMappingURL=update-goods-category.dto.js.map