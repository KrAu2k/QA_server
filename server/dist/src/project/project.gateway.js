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
exports.ProjectGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const project_service_1 = require("./project.service");
let ProjectGateway = class ProjectGateway {
    constructor(projectService) {
        this.projectService = projectService;
    }
    async handleUpdateCommand(data, client) {
        const { projectId, userId, username } = data;
        console.log('🚀 [WebSocket] 收到更新命令请求:', {
            projectId,
            userId: userId || '未提供',
            username: username || '未提供',
            clientId: client.id,
            timestamp: new Date().toISOString()
        });
        try {
            console.log('📋 [步骤1] 获取项目信息...');
            const project = await this.projectService.findOne(projectId);
            if (!project) {
                console.error('❌ [错误] 项目不存在:', projectId);
                client.emit('updateError', { message: '项目不存在' });
                return;
            }
            console.log('✅ [步骤1] 项目信息获取成功:', {
                projectName: project.name,
                enableUpdate: project.enableUpdate,
                updateCommand: project.updateCommand,
                updateDirectory: project.updateDirectory
            });
            console.log('🔐 [步骤2] 检查更新权限...');
            if (!project.enableUpdate) {
                console.error('❌ [错误] 项目未启用更新功能:', projectId);
                client.emit('updateError', { message: '项目未启用更新功能' });
                return;
            }
            console.log('✅ [步骤2] 更新权限检查通过');
            console.log('⚙️ [步骤3] 检查更新命令配置...');
            if (!project.updateCommand) {
                console.error('❌ [错误] 项目未配置更新命令:', projectId);
                client.emit('updateError', { message: '项目未配置更新命令' });
                return;
            }
            console.log('✅ [步骤3] 更新命令配置检查通过:', project.updateCommand);
            console.log('🎯 [步骤4] 开始执行更新命令...');
            await this.projectService.executeUpdateWithRealTimeOutput(projectId, (data) => {
                console.log('📤 [输出] 发送实时输出数据:', data.length + ' 字符');
                client.emit('updateOutput', { data });
            }, (error) => {
                console.error('❌ [错误] 更新执行错误:', error);
                client.emit('updateError', { message: error });
            }, () => {
                console.log('✅ [完成] 更新执行完成:', projectId);
                client.emit('updateComplete', { message: '更新完成' });
            }, userId, username, undefined, undefined);
        }
        catch (error) {
            console.error('💥 [异常] WebSocket执行更新时发生异常:', {
                projectId,
                error: error.message,
                stack: error.stack,
                clientId: client.id
            });
            client.emit('updateError', {
                message: error.message || '执行更新时发生错误'
            });
        }
    }
    async handleUpdateCodeCommand(data, client) {
        const { projectId, userId, username } = data;
        console.log('🔄 [WebSocket] 收到更新代码命令请求:', {
            projectId,
            userId: userId || '未提供',
            username: username || '未提供',
            clientId: client.id,
            timestamp: new Date().toISOString()
        });
        try {
            console.log('📋 [步骤1] 获取项目信息...');
            const project = await this.projectService.findOne(projectId);
            if (!project) {
                console.error('❌ [错误] 项目不存在:', projectId);
                client.emit('updateCodeError', { message: '项目不存在' });
                return;
            }
            console.log('✅ [步骤1] 项目信息获取成功:', {
                projectName: project.name,
                enableUpdateCode: project.enableUpdateCode,
                updateCodeCommand: project.updateCodeCommand,
                updateCodeDirectory: project.updateCodeDirectory
            });
            console.log('🔐 [步骤2] 检查更新代码权限...');
            if (!project.enableUpdateCode) {
                console.error('❌ [错误] 项目未启用更新代码功能:', projectId);
                client.emit('updateCodeError', { message: '项目未启用更新代码功能' });
                return;
            }
            console.log('✅ [步骤2] 更新代码权限检查通过');
            console.log('⚙️ [步骤3] 检查更新代码命令配置...');
            if (!project.updateCodeCommand) {
                console.error('❌ [错误] 项目未配置更新代码命令:', projectId);
                client.emit('updateCodeError', { message: '项目未配置更新代码命令' });
                return;
            }
            console.log('✅ [步骤3] 更新代码命令配置检查通过:', project.updateCodeCommand);
            console.log('🎯 [步骤4] 开始执行更新代码命令...');
            await this.projectService.executeUpdateCodeWithRealTimeOutput(projectId, (data) => {
                console.log('📤 [输出] 发送实时输出数据:', data.length + ' 字符');
                client.emit('updateCodeOutput', { data });
            }, (error) => {
                console.error('❌ [错误] 更新代码执行错误:', error);
                client.emit('updateCodeError', { message: error });
            }, () => {
                console.log('✅ [完成] 更新代码执行完成:', projectId);
                client.emit('updateCodeComplete', { message: '更新代码完成' });
            }, userId, username, undefined, undefined);
        }
        catch (error) {
            console.error('💥 [异常] WebSocket执行更新代码时发生异常:', {
                projectId,
                error: error.message,
                stack: error.stack,
                clientId: client.id
            });
            client.emit('updateCodeError', {
                message: error.message || '执行更新代码时发生错误'
            });
        }
    }
    handleJoinRoom(data, client) {
        const room = `project-${data.projectId}`;
        client.join(room);
        client.emit('joinedRoom', { room });
    }
    handleLeaveRoom(data, client) {
        const room = `project-${data.projectId}`;
        client.leave(room);
        client.emit('leftRoom', { room });
    }
};
exports.ProjectGateway = ProjectGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ProjectGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('executeUpdate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ProjectGateway.prototype, "handleUpdateCommand", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('executeUpdateCode'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ProjectGateway.prototype, "handleUpdateCodeCommand", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ProjectGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ProjectGateway.prototype, "handleLeaveRoom", null);
exports.ProjectGateway = ProjectGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:8000', 'http://localhost:8001', 'http://127.0.0.1:8000', 'http://127.0.0.1:8001'],
            credentials: true,
        },
        namespace: '/project-updates',
    }),
    __metadata("design:paramtypes", [project_service_1.ProjectService])
], ProjectGateway);
//# sourceMappingURL=project.gateway.js.map