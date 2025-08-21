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
exports.ActiveUserGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
let ActiveUserGuard = class ActiveUserGuard {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new common_1.UnauthorizedException('未提供认证令牌');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userService.findByEmployeeNo(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('用户不存在');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException({
                    code: 'USER_DISABLED',
                    message: '用户账号已被禁用，请联系管理员',
                    timestamp: new Date().toISOString(),
                });
            }
            request.user = user;
            return true;
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new common_1.UnauthorizedException('无效的认证令牌');
            }
            if (error.name === 'TokenExpiredError') {
                throw new common_1.UnauthorizedException('认证令牌已过期');
            }
            throw error;
        }
    }
};
exports.ActiveUserGuard = ActiveUserGuard;
exports.ActiveUserGuard = ActiveUserGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService])
], ActiveUserGuard);
//# sourceMappingURL=active-user.guard.js.map