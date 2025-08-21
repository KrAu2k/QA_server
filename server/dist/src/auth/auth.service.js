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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const log_service_1 = require("../log/log.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(userService, jwtService, logService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.logService = logService;
    }
    async validateUser(username, password, ipAddress, userAgent) {
        try {
            const user = await this.userService.findByUsername(username);
            console.log('bcrypt', await bcrypt.hash(password, 10));
            if (user && (await bcrypt.compare(password, user.password))) {
                if (!user.isActive) {
                    await this.logService.logLogin(String(user.id), username, 'error', ipAddress, userAgent, '账户已被禁用');
                    throw new common_1.UnauthorizedException('账户已被禁用，请联系管理员');
                }
                await this.logService.logLogin(String(user.id), username, 'success', ipAddress, userAgent);
                const { password, ...result } = user;
                return result;
            }
            await this.logService.logLogin('unknown', username, 'error', ipAddress, userAgent, '用户名或密码错误');
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            await this.logService.logLogin('unknown', username, 'error', ipAddress, userAgent, error.message || '登录过程中发生错误');
            throw new common_1.UnauthorizedException('登录失败，请稍后重试');
        }
    }
    async login(user, ipAddress, userAgent) {
        const payload = { username: user.username, sub: user.id };
        return {
            status: 'ok',
            token: this.jwtService.sign(payload, { expiresIn: '150m' }),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
    async logout(userId, username, ipAddress, userAgent) {
        await this.logService.logLogout(userId, username, ipAddress, userAgent);
        return {
            success: true,
            message: '登出成功'
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userService.findByUsername(payload.username);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const newPayload = { username: user.username, sub: user.id };
            return {
                access_token: this.jwtService.sign(newPayload, { expiresIn: '1d' }),
                refresh_token: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
            };
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async currentUser(token) {
        try {
            console.log('token', token);
            const payload = this.jwtService.verify(token);
            console.log('payload', payload);
            const user = await this.userService.findByUsername(payload.username);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const { password, ...safeUserData } = user;
            return {
                success: true,
                data: {
                    ...safeUserData,
                    isAdmin: user.isAdmin
                }
            };
        }
        catch (err) {
            console.log('err', err);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        log_service_1.LogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map