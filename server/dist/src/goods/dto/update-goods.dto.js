"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGoodsDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_goods_dto_1 = require("./create-goods.dto");
class UpdateGoodsDto extends (0, mapped_types_1.PartialType)(create_goods_dto_1.CreateGoodsDto) {
}
exports.UpdateGoodsDto = UpdateGoodsDto;
//# sourceMappingURL=update-goods.dto.js.map