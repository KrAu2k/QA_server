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
exports.SetManagerDto = exports.AddMemberDto = exports.BatchOperationDto = exports.UpdateDepartmentStatusDto = exports.MoveDepartmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class MoveDepartmentDto {
}
exports.MoveDepartmentDto = MoveDepartmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MoveDepartmentDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MoveDepartmentDto.prototype, "sort", void 0);
class UpdateDepartmentStatusDto {
}
exports.UpdateDepartmentStatusDto = UpdateDepartmentStatusDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateDepartmentStatusDto.prototype, "status", void 0);
class BatchOperationDto {
}
exports.BatchOperationDto = BatchOperationDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], BatchOperationDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchOperationDto.prototype, "operation", void 0);
class AddMemberDto {
}
exports.AddMemberDto = AddMemberDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => value ?? []),
    __metadata("design:type", Array)
], AddMemberDto.prototype, "userIds", void 0);
class SetManagerDto {
}
exports.SetManagerDto = SetManagerDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => value ?? []),
    __metadata("design:type", Array)
], SetManagerDto.prototype, "userIds", void 0);
//# sourceMappingURL=department-operation.dto.js.map