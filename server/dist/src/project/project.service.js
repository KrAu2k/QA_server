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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const project_update_log_entity_1 = require("./entities/project-update-log.entity");
const project_update_code_log_entity_1 = require("./entities/project-update-code-log.entity");
const log_helper_1 = require("../log/utils/log-helper");
const child_process_1 = require("child_process");
const util_1 = require("util");
const child_process_2 = require("child_process");
const schedule_1 = require("@nestjs/schedule");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ProjectService = class ProjectService {
    constructor(projectRepository, projectUpdateLogRepository, projectUpdateCodeLogRepository, logHelper, projectGateway) {
        this.projectRepository = projectRepository;
        this.projectUpdateLogRepository = projectUpdateLogRepository;
        this.projectUpdateCodeLogRepository = projectUpdateCodeLogRepository;
        this.logHelper = logHelper;
        this.projectGateway = projectGateway;
    }
    async handleUpdateTimeout() {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const timeoutLogs = await this.projectUpdateLogRepository.find({
            where: {
                status: project_update_log_entity_1.UpdateStatus.UPDATING,
                startTime: (0, typeorm_2.LessThan)(tenMinutesAgo)
            },
            relations: ['project']
        });
        for (const log of timeoutLogs) {
            const updatedLog = await this.projectUpdateLogRepository.save({
                ...log,
                status: project_update_log_entity_1.UpdateStatus.TIMEOUT,
                endTime: new Date(),
                duration: Math.floor((Date.now() - log.startTime.getTime()) / 1000)
            });
            await this.projectRepository.update(log.projectId, {
                currentUpdateStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                currentUpdateLogId: null
            });
            this.broadcastProjectStatus(log.projectId, project_entity_1.ProjectUpdateStatus.IDLE, updatedLog);
        }
        const timeoutCodeLogs = await this.projectUpdateCodeLogRepository.find({
            where: {
                status: project_update_code_log_entity_1.UpdateCodeStatus.UPDATING,
                startTime: (0, typeorm_2.LessThan)(tenMinutesAgo)
            },
            relations: ['project']
        });
        for (const log of timeoutCodeLogs) {
            const updatedLog = await this.projectUpdateCodeLogRepository.save({
                ...log,
                status: project_update_code_log_entity_1.UpdateCodeStatus.TIMEOUT,
                endTime: new Date(),
                duration: Math.floor((Date.now() - log.startTime.getTime()) / 1000)
            });
            await this.projectRepository.update(log.projectId, {
                currentUpdateCodeStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                currentUpdateCodeLogId: null
            });
            this.broadcastProjectStatus(log.projectId, project_entity_1.ProjectUpdateStatus.IDLE, null, updatedLog);
        }
    }
    async create(createProjectDto, userId, ipAddress, userAgent) {
        try {
            const project = this.projectRepository.create(createProjectDto);
            const savedProject = await this.projectRepository.save(project);
            if (userId) {
                await this.logHelper.logCreate(userId, 'project', 'project', '项目', parseInt(savedProject.id), createProjectDto, { id: savedProject.id, name: savedProject.name }, ipAddress, userAgent);
            }
            return savedProject;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '创建项目', '创建项目失败', error.message, createProjectDto, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findAll(userId, ipAddress, userAgent) {
        try {
            const projects = await this.projectRepository.find({
                order: { sortOrder: 'DESC', createdAt: 'DESC' }
            });
            if (userId) {
                await this.logHelper.logQuery(userId, 'project', 'project', '列表', undefined, { count: projects.length }, ipAddress, userAgent);
            }
            return projects;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '查询项目列表', '查询项目列表失败', error.message, undefined, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findAllWithPagination(query, userId, ipAddress, userAgent) {
        try {
            const { current = 1, pageSize = 10, name, isActive } = query;
            const page = Number(current);
            const size = Number(pageSize);
            const where = {};
            if (name) {
                where.name = (0, typeorm_2.Like)(`%${name}%`);
            }
            if (isActive !== undefined) {
                where.isActive = isActive;
            }
            const [projects, total] = await this.projectRepository.findAndCount({
                where,
                skip: (page - 1) * size,
                take: size,
                order: { sortOrder: 'DESC', createdAt: 'DESC' }
            });
            const result = {
                data: projects,
                total
            };
            if (userId) {
                await this.logHelper.logQuery(userId, 'project', 'project', '列表', query, { count: result.data.length, total: result.total }, ipAddress, userAgent);
            }
            return result;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '查询项目列表', '查询项目列表失败', error.message, query, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findOne(id, userId, ipAddress, userAgent) {
        try {
            const project = await this.projectRepository.findOne({ where: { id } });
            if (!project) {
                throw new Error(`Project with ID ${id} not found`);
            }
            if (userId) {
                await this.logHelper.logQuery(userId, 'project', 'project', '详情', { id }, { id: project.id, name: project.name }, ipAddress, userAgent);
            }
            return project;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '查询项目详情', '查询项目详情失败', error.message, { id }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async update(id, updateProjectDto, userId, ipAddress, userAgent) {
        try {
            await this.projectRepository.update(id, updateProjectDto);
            const updatedProject = await this.findOne(id);
            if (userId) {
                await this.logHelper.logUpdate(userId, 'project', 'project', '项目', parseInt(id), updateProjectDto, { id: updatedProject.id, name: updatedProject.name }, ipAddress, userAgent);
            }
            return updatedProject;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '更新项目', '更新项目失败', error.message, { id, ...updateProjectDto }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async remove(id, userId, ipAddress, userAgent) {
        try {
            const project = await this.projectRepository.findOne({ where: { id } });
            await this.projectRepository.delete(id);
            if (userId && project) {
                await this.logHelper.logDelete(userId, 'project', 'project', '项目', parseInt(id), { id }, { id: project.id, name: project.name }, ipAddress, userAgent);
            }
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '删除项目', '删除项目失败', error.message, { id }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async batchToggleStatus(ids, isActive, userId, ipAddress, userAgent) {
        try {
            if (!ids || ids.length === 0) {
                throw new Error('No IDs provided for batch update');
            }
            for (const id of ids) {
                await this.projectRepository.update(id, { isActive });
            }
            if (userId) {
                try {
                    await this.logHelper.logUserOperation(userId, 'project', 'project', '批量更新状态', `批量${isActive ? '启用' : '禁用'}项目，共 ${ids.length} 个项目`, undefined, 'success', { ids, isActive }, { updatedCount: ids.length }, undefined, undefined, ipAddress, userAgent);
                }
                catch (logError) {
                    console.error('创建批量更新日志失败:', logError);
                }
            }
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '批量更新状态', '批量更新项目状态失败', error.message, { ids, isActive }, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async findActiveProjects(userId, ipAddress, userAgent) {
        try {
            const projects = await this.projectRepository.find({
                where: { isActive: true },
                order: { sortOrder: 'DESC', createdAt: 'DESC' }
            });
            if (userId) {
                await this.logHelper.logQuery(userId, 'project', 'project', '列表', undefined, { count: projects.length }, ipAddress, userAgent);
            }
            return projects;
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '查询项目列表', '查询项目列表失败', error.message, undefined, ipAddress, userAgent);
            }
            throw error;
        }
    }
    async executeUpdate(id, userId, ipAddress, userAgent) {
        try {
            const project = await this.projectRepository.findOne({ where: { id } });
            if (!project) {
                throw new Error(`Project with ID ${id} not found`);
            }
            if (!project.enableUpdate) {
                throw new Error('项目未启用更新功能');
            }
            if (!project.updateCommand) {
                throw new Error('项目未配置更新命令');
            }
            if (userId) {
                try {
                    await this.logHelper.logUserOperation(userId, 'project', 'project', '执行更新', `开始执行项目更新: ${project.name}`, undefined, 'success', { projectId: id, command: project.updateCommand, directory: project.updateDirectory }, undefined, undefined, undefined, ipAddress, userAgent);
                }
                catch (logError) {
                    console.error('创建开始日志失败:', logError);
                }
            }
            const options = {};
            if (project.updateDirectory) {
                options.cwd = project.updateDirectory;
            }
            const { stdout, stderr } = await execAsync(project.updateCommand, options);
            const output = stdout + (stderr ? `\nErrors: ${stderr}` : '');
            if (userId) {
                try {
                    await this.logHelper.logUserOperation(userId, 'project', 'project', '执行更新', `项目更新完成: ${project.name}`, undefined, 'success', { projectId: id, command: project.updateCommand, directory: project.updateDirectory }, undefined, undefined, undefined, ipAddress, userAgent);
                }
                catch (logError) {
                    console.error('创建成功日志失败:', logError);
                }
            }
            return {
                success: true,
                message: '更新执行完成'
            };
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '执行更新', '项目更新失败', error.message, { id }, ipAddress, userAgent);
            }
            return {
                success: false,
                message: `更新执行失败: ${error.message}`
            };
        }
    }
    async executeUpdateWithRealTimeOutput(id, onOutput, onError, onComplete, userId, username, ipAddress, userAgent) {
        try {
            const project = await this.projectRepository.findOne({ where: { id } });
            if (!project) {
                onError(`Project with ID ${id} not found`);
                return;
            }
            if (!project.enableUpdate) {
                onError('项目未启用更新功能');
                return;
            }
            if (!project.updateCommand) {
                onError('项目未配置更新命令');
                return;
            }
            if (project.currentUpdateStatus === project_entity_1.ProjectUpdateStatus.UPDATING) {
                onError('项目正在更新中，请稍后再试');
                return;
            }
            let validUserId = null;
            let validUsername = null;
            if (userId) {
                validUserId = String(userId).trim();
                if (!validUserId || validUserId === 'undefined' || validUserId === 'null') {
                    validUserId = null;
                }
            }
            if (username) {
                validUsername = String(username).trim();
                if (!validUsername || validUsername === 'undefined' || validUsername === 'null') {
                    validUsername = null;
                }
            }
            const updateLog = this.projectUpdateLogRepository.create({
                projectId: id,
                status: project_update_log_entity_1.UpdateStatus.UPDATING,
                startedBy: validUserId,
                startedByName: validUsername,
                startTime: new Date()
            });
            console.log('创建更新日志:', {
                projectId: id,
                userId: validUserId || '未提供',
                username: validUsername || '未提供',
                logData: {
                    projectId: updateLog.projectId,
                    status: updateLog.status,
                    startedBy: updateLog.startedBy,
                    startedByName: updateLog.startedByName,
                    startTime: updateLog.startTime
                }
            });
            let savedLog;
            try {
                savedLog = await this.projectUpdateLogRepository.save(updateLog);
                console.log('更新日志保存成功:', savedLog.id);
            }
            catch (saveError) {
                console.error('保存更新日志失败:', saveError);
                onError(`保存更新日志失败: ${saveError.message}`);
                return;
            }
            await this.projectRepository.update(id, {
                currentUpdateStatus: project_entity_1.ProjectUpdateStatus.UPDATING,
                currentUpdateLogId: savedLog.id
            });
            this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.UPDATING, savedLog);
            if (userId) {
                try {
                    await this.logHelper.logUserOperation(userId, 'project', 'project', '执行更新', `开始执行项目更新: ${project.name}`, undefined, 'success', { projectId: id, command: project.updateCommand, directory: project.updateDirectory }, undefined, undefined, undefined, ipAddress, userAgent);
                }
                catch (logError) {
                    console.error('创建操作日志失败:', logError);
                }
            }
            const options = {
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
            };
            if (project.updateDirectory) {
                options.cwd = project.updateDirectory;
            }
            console.log('开始执行更新命令:', {
                projectId: id,
                projectName: project.name,
                command: project.updateCommand,
                directory: project.updateDirectory || '当前目录',
                options: options
            });
            onOutput(`🚀 开始执行更新命令...\n`);
            onOutput(`📂 项目: ${project.name}\n`);
            onOutput(`📋 命令: ${project.updateCommand}\n`);
            onOutput(`📁 目录: ${project.updateDirectory || '当前目录'}\n`);
            onOutput(`⏰ 超时时间: 10分钟\n`);
            onOutput(`\n--- 命令输出 ---\n`);
            const childProcess = (0, child_process_2.spawn)('sh', ['-c', project.updateCommand], options);
            let outputBuffer = '';
            let isCompleted = false;
            let svnRevision = null;
            console.log('📊 [步骤14] 初始化输出监听变量:', {
                outputBufferSize: outputBuffer.length,
                processCompleted: isCompleted,
                svnRevision: svnRevision || '未检测到'
            });
            const timeoutTimer = setTimeout(async () => {
                if (!isCompleted) {
                    console.log('命令执行超时，强制终止:', {
                        projectId: id,
                        command: project.updateCommand,
                        timeout: '10分钟'
                    });
                    childProcess.kill('SIGTERM');
                    setTimeout(() => {
                        if (!isCompleted) {
                            childProcess.kill('SIGKILL');
                        }
                    }, 2000);
                    const endTime = new Date();
                    const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
                    onOutput(`\n⚠️  命令执行超时 (${duration}秒)，已强制终止\n`);
                    const updatedLog = await this.projectUpdateLogRepository.save({
                        ...savedLog,
                        status: project_update_log_entity_1.UpdateStatus.TIMEOUT,
                        endTime,
                        duration,
                        svnRevision: svnRevision
                    });
                    console.log('📝 [超时] 更新日志状态更新为超时:', {
                        duration: duration + '秒',
                        svnRevision: svnRevision || '未检测到'
                    });
                    await this.projectRepository.update(id, {
                        currentUpdateStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                        currentUpdateLogId: null
                    });
                    this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.IDLE, updatedLog);
                    isCompleted = true;
                    onError(`命令执行超时 (${duration}秒)，已强制终止`);
                }
            }, 15 * 60 * 1000);
            console.log('👂 [步骤15] 开始监听进程标准输出...');
            childProcess.stdout.on('data', (data) => {
                if (!isCompleted) {
                    const output = data.toString();
                    outputBuffer += output;
                    const detectedRevision = this.detectSvnRevision(output, svnRevision, 'stdout');
                    if (detectedRevision && !svnRevision) {
                        svnRevision = detectedRevision;
                        onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
                    }
                    console.log('📤 [stdout] 收到标准输出数据:', output.length + ' 字符');
                    onOutput(output);
                }
            });
            childProcess.stderr.on('data', (data) => {
                if (!isCompleted) {
                    const error = data.toString();
                    outputBuffer += `Error: ${error}`;
                    const detectedRevision = this.detectSvnRevision(error, svnRevision, 'stderr');
                    if (detectedRevision && !svnRevision) {
                        svnRevision = detectedRevision;
                        onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
                    }
                    onOutput(`Error: ${error}`);
                }
            });
            childProcess.on('close', async (code) => {
                if (!isCompleted) {
                    clearTimeout(timeoutTimer);
                    isCompleted = true;
                    const endTime = new Date();
                    const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
                    console.log('🏁 [完成] 命令执行完成:', {
                        projectId: id,
                        command: project.updateCommand,
                        exitCode: code,
                        duration: duration + '秒',
                        outputLength: outputBuffer.length,
                        svnRevision: svnRevision || '未检测到'
                    });
                    onOutput(`\n--- 命令执行完成 ---\n`);
                    onOutput(`⏱️  执行时间: ${duration}秒\n`);
                    onOutput(`📤 退出码: ${code}\n`);
                    if (svnRevision) {
                        onOutput(`📋 SVN 版本: ${svnRevision}\n`);
                    }
                    onOutput(`✅ 更新完成！\n`);
                    console.log('📝 [步骤16] 更新完成日志状态...');
                    const updatedLog = await this.projectUpdateLogRepository.save({
                        ...savedLog,
                        status: project_update_log_entity_1.UpdateStatus.COMPLETED,
                        endTime,
                        duration,
                        exitCode: code,
                        signal: null,
                        svnRevision: svnRevision
                    });
                    console.log('✅ [步骤16] 完成日志状态更新成功:', {
                        logId: updatedLog.id,
                        svnRevision: svnRevision || '未检测到'
                    });
                    await this.projectRepository.update(id, {
                        currentUpdateStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                        currentUpdateLogId: null
                    });
                    this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.IDLE, updatedLog);
                    if (userId) {
                        try {
                            await this.logHelper.logUserOperation(userId, 'project', 'project', '执行更新', `项目更新完成: ${project.name} (退出码: ${code}${svnRevision ? `, SVN版本: ${svnRevision}` : ''})`, undefined, 'success', {
                                projectId: id,
                                command: project.updateCommand,
                                directory: project.updateDirectory,
                                exitCode: code,
                                duration: duration,
                                svnRevision: svnRevision
                            }, undefined, undefined, undefined, ipAddress, userAgent);
                            console.log('✅ [步骤18] 完成操作日志记录成功:', {
                                svnRevision: svnRevision || '未检测到'
                            });
                        }
                        catch (logError) {
                            console.error('创建完成日志失败:', logError);
                        }
                    }
                    onComplete();
                }
            });
            childProcess.on('error', async (error) => {
                if (!isCompleted) {
                    clearTimeout(timeoutTimer);
                    isCompleted = true;
                    const endTime = new Date();
                    const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
                    console.error('命令执行进程错误:', {
                        projectId: id,
                        command: project.updateCommand,
                        error: error.message,
                        duration: duration
                    });
                    onOutput(`\n💥 进程执行错误: ${error.message}\n`);
                    const updatedLog = await this.projectUpdateLogRepository.save({
                        ...savedLog,
                        status: project_update_log_entity_1.UpdateStatus.FAILED,
                        endTime,
                        duration,
                        svnRevision: svnRevision,
                        errorMessage: error.message
                    });
                    console.log('📝 [异常] 错误日志状态更新成功:', {
                        error: error.message,
                        svnRevision: svnRevision || '未检测到'
                    });
                    await this.projectRepository.update(id, {
                        currentUpdateStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                        currentUpdateLogId: null
                    });
                    this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.IDLE, updatedLog);
                    const errorMsg = `进程启动失败: ${error.message}`;
                    if (userId) {
                        await this.logHelper.logError(userId, 'project', 'project', '执行更新', '项目更新失败', errorMsg, { id }, ipAddress, userAgent);
                    }
                    onError(errorMsg);
                }
            });
        }
        catch (error) {
            if (userId) {
                await this.logHelper.logError(userId, 'project', 'project', '执行更新', '项目更新失败', error.message, { id }, ipAddress, userAgent);
            }
            onError(error.message);
        }
    }
    async executeUpdateCodeWithRealTimeOutput(id, onOutput, onError, onComplete, userId, username, ipAddress, userAgent) {
        const startTimeMs = Date.now();
        console.log('🔧 [代码更新服务] 开始执行代码更新流程:', {
            projectId: id,
            userId: userId || '未提供',
            username: username || '未提供',
            startTime: new Date().toISOString()
        });
        try {
            console.log('📋 [步骤1] 查询项目信息...');
            const project = await this.projectRepository.findOne({ where: { id } });
            if (!project) {
                console.error('❌ [错误] 项目不存在:', id);
                onError(`Project with ID ${id} not found`);
                return;
            }
            console.log('✅ [步骤1] 项目信息查询成功:', {
                projectName: project.name,
                enableUpdateCode: project.enableUpdateCode,
                updateCodeCommand: project.updateCodeCommand ? '已配置' : '未配置',
                updateCodeDirectory: project.updateCodeDirectory || '未指定',
                currentUpdateCodeStatus: project.currentUpdateCodeStatus || 'idle'
            });
            console.log('🔐 [步骤2] 检查代码更新权限...');
            if (!project.enableUpdateCode) {
                console.error('❌ [错误] 项目未启用代码更新功能');
                onError('项目未启用更新代码功能');
                return;
            }
            console.log('✅ [步骤2] 代码更新权限检查通过');
            console.log('⚙️ [步骤3] 检查代码更新命令...');
            if (!project.updateCodeCommand) {
                console.error('❌ [错误] 项目未配置代码更新命令');
                onError('项目未配置更新代码命令');
                return;
            }
            console.log('✅ [步骤3] 代码更新命令检查通过:', project.updateCodeCommand);
            console.log('🔄 [步骤4] 检查项目代码更新状态...');
            if (project.currentUpdateCodeStatus === project_entity_1.ProjectUpdateStatus.UPDATING) {
                console.error('❌ [错误] 项目正在代码更新中');
                onError('项目正在更新代码中，请稍后再试');
                return;
            }
            console.log('✅ [步骤4] 项目代码更新状态检查通过，可以开始更新');
            console.log('👤 [步骤5] 验证用户信息...');
            let validUserId = null;
            let validUsername = null;
            if (userId) {
                validUserId = String(userId).trim();
                if (!validUserId || validUserId === 'undefined' || validUserId === 'null') {
                    validUserId = null;
                }
            }
            if (username) {
                validUsername = String(username).trim();
                if (!validUsername || validUsername === 'undefined' || validUsername === 'null') {
                    validUsername = null;
                }
            }
            console.log('✅ [步骤5] 用户信息验证完成:', {
                userId: validUserId || '未提供',
                username: validUsername || '未提供'
            });
            console.log('📝 [步骤6] 创建代码更新日志记录...');
            const updateCodeLog = this.projectUpdateCodeLogRepository.create({
                projectId: id,
                status: project_update_code_log_entity_1.UpdateCodeStatus.UPDATING,
                startedBy: validUserId,
                startedByName: validUsername,
                startTime: new Date()
            });
            console.log('📝 [步骤6] 代码更新日志数据准备完成:', {
                projectId: updateCodeLog.projectId,
                status: updateCodeLog.status,
                startedBy: updateCodeLog.startedBy || '未知用户',
                startedByName: updateCodeLog.startedByName || '未知用户',
                startTime: updateCodeLog.startTime.toISOString()
            });
            let savedLog;
            try {
                savedLog = await this.projectUpdateCodeLogRepository.save(updateCodeLog);
                console.log('✅ [步骤6] 代码更新日志保存成功，日志ID:', savedLog.id);
            }
            catch (saveError) {
                console.error('❌ [错误] 保存代码更新日志失败:', {
                    error: saveError.message,
                    stack: saveError.stack
                });
                onError(`保存更新代码日志失败: ${saveError.message}`);
                return;
            }
            console.log('🔄 [步骤7] 更新项目代码状态为"更新中"...');
            try {
                await this.projectRepository.update(id, {
                    currentUpdateCodeStatus: project_entity_1.ProjectUpdateStatus.UPDATING,
                    currentUpdateCodeLogId: savedLog.id
                });
                console.log('✅ [步骤7] 项目代码状态更新成功');
            }
            catch (updateError) {
                console.error('❌ [错误] 更新项目代码状态失败:', updateError.message);
            }
            console.log('📢 [步骤8] 广播项目代码状态变化...');
            try {
                this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.UPDATING, undefined, savedLog);
                console.log('✅ [步骤8] 代码状态广播完成');
            }
            catch (broadcastError) {
                console.error('⚠️ [警告] 代码状态广播失败:', broadcastError.message);
            }
            console.log('📝 [步骤9] 记录代码更新操作日志...');
            if (userId) {
                try {
                    await this.logHelper.logUserOperation(userId, 'project', 'project', '执行更新代码', `开始执行项目更新代码: ${project.name}`, undefined, 'success', { projectId: id, command: project.updateCodeCommand, directory: project.updateCodeDirectory }, undefined, undefined, undefined, ipAddress, userAgent);
                    console.log('✅ [步骤9] 代码更新操作日志记录成功');
                }
                catch (logError) {
                    console.error('⚠️ [警告] 创建代码更新操作日志失败:', logError.message);
                }
            }
            else {
                console.log('⚠️ [步骤9] 跳过代码更新操作日志记录（未提供用户ID）');
            }
            console.log('🛠️ [步骤10] 准备代码更新命令执行环境...');
            const options = {
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
            };
            if (project.updateCodeDirectory) {
                options.cwd = project.updateCodeDirectory;
                console.log('📁 [步骤10] 设置代码更新工作目录:', project.updateCodeDirectory);
            }
            else {
                console.log('📁 [步骤10] 使用默认工作目录');
            }
            console.log('✅ [步骤10] 代码更新命令执行环境准备完成:', {
                command: project.updateCodeCommand,
                workingDirectory: project.updateCodeDirectory || '默认目录',
                shell: options.shell,
                stdio: options.stdio
            });
            console.log('📤 [步骤11] 向客户端发送代码更新初始信息...');
            const executionStartTime = new Date();
            onOutput(`� 开始执行代码更新命令...\n`);
            onOutput(`📂 项目: ${project.name}\n`);
            onOutput(`📋 命令: ${project.updateCodeCommand}\n`);
            onOutput(`📁 目录: ${project.updateCodeDirectory || '当前目录'}\n`);
            onOutput(`⏰ 超时时间: 10分钟\n`);
            onOutput(`🕐 开始时间: ${executionStartTime.toLocaleString()}\n`);
            onOutput(`\n--- 代码更新命令输出 ---\n`);
            console.log('✅ [步骤11] 代码更新初始信息发送完成');
            console.log('🔧 [步骤12] 启动代码更新子进程执行命令...');
            const childProcess = (0, child_process_2.spawn)('sh', ['-c', project.updateCodeCommand], options);
            console.log('✅ [步骤12] 代码更新子进程启动成功，PID:', childProcess.pid);
            let outputBuffer = '';
            let errorBuffer = '';
            let isCompleted = false;
            let timeoutOccurred = false;
            let svnRevision = null;
            console.log('📊 [步骤13] 初始化代码更新输出监听变量:', {
                outputBufferSize: outputBuffer.length,
                errorBufferSize: errorBuffer.length,
                processCompleted: isCompleted,
                timeoutOccurred: timeoutOccurred,
                svnRevision: svnRevision || '未检测到'
            });
            console.log('⏰ [步骤13] 设置代码更新10分钟超时保护...');
            const timeoutTimer = setTimeout(async () => {
                if (!isCompleted) {
                    timeoutOccurred = true;
                    console.log('⚠️ [超时] 代码更新命令执行超时，开始强制终止流程:', {
                        projectId: id,
                        command: project.updateCodeCommand,
                        timeout: '10分钟',
                        pid: childProcess.pid,
                        outputLength: outputBuffer.length,
                        errorLength: errorBuffer.length
                    });
                    console.log('🔪 [超时] 发送SIGTERM信号...');
                    childProcess.kill('SIGTERM');
                    setTimeout(() => {
                        if (!isCompleted) {
                            console.log('💀 [超时] SIGTERM无效，发送SIGKILL信号...');
                            childProcess.kill('SIGKILL');
                        }
                    }, 2000);
                    const endTime = new Date();
                    const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
                    onOutput(`\n⚠️  代码更新命令执行超时 (${duration}秒)，已强制终止\n`);
                    onOutput(`📊 输出缓冲区大小: ${outputBuffer.length} 字符\n`);
                    onOutput(`📊 错误缓冲区大小: ${errorBuffer.length} 字符\n`);
                    try {
                        const updatedLog = await this.projectUpdateCodeLogRepository.save({
                            ...savedLog,
                            status: project_update_code_log_entity_1.UpdateCodeStatus.TIMEOUT,
                            endTime,
                            duration
                        });
                        console.log('📝 [超时] 代码更新日志状态更新为超时');
                        await this.projectRepository.update(id, {
                            currentUpdateCodeStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                            currentUpdateCodeLogId: null
                        });
                        console.log('🔄 [超时] 项目代码状态重置为空闲');
                        this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.IDLE, undefined, updatedLog);
                        console.log('📢 [超时] 广播项目代码状态变化');
                    }
                    catch (updateError) {
                        console.error('❌ [超时] 更新代码状态失败:', updateError.message);
                    }
                    isCompleted = true;
                    onError(`代码更新命令执行超时 (${duration}秒)，已强制终止`);
                }
            }, 10 * 60 * 1000);
            console.log('✅ [步骤13] 代码更新超时保护设置完成');
            console.log('👂 [步骤14] 开始监听代码更新进程输出...');
            childProcess.stdout.on('data', (data) => {
                if (!isCompleted && !timeoutOccurred) {
                    const output = data.toString();
                    outputBuffer += output;
                    const detectedRevision = this.detectSvnRevision(output, svnRevision, 'stdout-code');
                    if (detectedRevision && !svnRevision) {
                        svnRevision = detectedRevision;
                        onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
                    }
                    console.log('📤 [stdout] 收到代码更新标准输出数据:', output.length + ' 字符');
                    onOutput(output);
                }
            });
            childProcess.stderr.on('data', (data) => {
                if (!isCompleted && !timeoutOccurred) {
                    const error = data.toString();
                    errorBuffer += error;
                    outputBuffer += `Error: ${error}`;
                    const detectedRevision = this.detectSvnRevision(error, svnRevision, 'stderr-code');
                    if (detectedRevision && !svnRevision) {
                        svnRevision = detectedRevision;
                        onOutput(`📋 检测到 SVN 版本: ${svnRevision}\n`);
                    }
                    console.log('⚠️ [stderr] 收到代码更新错误输出数据:', error.length + ' 字符');
                    onOutput(`Error: ${error}`);
                }
            });
            childProcess.on('close', async (code, signal) => {
                if (!isCompleted && !timeoutOccurred) {
                    clearTimeout(timeoutTimer);
                    isCompleted = true;
                    const endTime = new Date();
                    const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
                    const totalExecutionTime = Math.floor((Date.now() - startTimeMs) / 1000);
                    console.log('🏁 [完成] 代码更新命令执行完成:', {
                        projectId: id,
                        command: project.updateCodeCommand,
                        exitCode: code,
                        signal: signal || '无',
                        duration: duration + '秒',
                        totalExecutionTime: totalExecutionTime + '秒',
                        outputLength: outputBuffer.length,
                        errorLength: errorBuffer.length,
                        pid: childProcess.pid,
                        svnRevision: svnRevision || '未检测到'
                    });
                    onOutput(`\n--- 代码更新命令执行完成 ---\n`);
                    onOutput(`⏱️  执行时间: ${duration}秒\n`);
                    onOutput(`🔧 进程ID: ${childProcess.pid}\n`);
                    onOutput(`📤 退出码: ${code}\n`);
                    if (signal) {
                        onOutput(`📶 终止信号: ${signal}\n`);
                    }
                    if (svnRevision) {
                        onOutput(`📋 SVN 版本: ${svnRevision}\n`);
                    }
                    onOutput(`📊 标准输出: ${outputBuffer.length - errorBuffer.length} 字符\n`);
                    onOutput(`📊 错误输出: ${errorBuffer.length} 字符\n`);
                    onOutput(`✅ 代码更新完成！\n`);
                    console.log('📝 [步骤15] 更新代码更新完成日志状态...');
                    try {
                        const updatedLog = await this.projectUpdateCodeLogRepository.save({
                            ...savedLog,
                            status: project_update_code_log_entity_1.UpdateCodeStatus.COMPLETED,
                            endTime,
                            duration,
                            exitCode: code,
                            signal: signal || null,
                            svnRevision: svnRevision
                        });
                        console.log('✅ [步骤15] 代码更新完成日志状态更新成功:', {
                            logId: updatedLog.id,
                            svnRevision: svnRevision || '未检测到'
                        });
                        console.log('🔄 [步骤16] 重置项目代码状态为空闲...');
                        await this.projectRepository.update(id, {
                            currentUpdateCodeStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                            currentUpdateCodeLogId: null
                        });
                        console.log('✅ [步骤16] 项目代码状态重置成功');
                        console.log('📢 [步骤17] 广播项目代码状态变化...');
                        this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.IDLE, undefined, updatedLog);
                        console.log('✅ [步骤17] 代码状态广播完成');
                        console.log('📝 [步骤18] 记录代码更新完成操作日志...');
                        if (userId) {
                            try {
                                await this.logHelper.logUserOperation(userId, 'project', 'project', '执行更新代码', `项目更新代码完成: ${project.name} (退出码: ${code}${svnRevision ? `, SVN版本: ${svnRevision}` : ''})`, undefined, 'success', {
                                    projectId: id,
                                    command: project.updateCodeCommand,
                                    directory: project.updateCodeDirectory,
                                    exitCode: code,
                                    duration: duration,
                                    signal: signal || null,
                                    svnRevision: svnRevision
                                }, undefined, undefined, undefined, ipAddress, userAgent);
                                console.log('✅ [步骤18] 代码更新完成操作日志记录成功:', {
                                    svnRevision: svnRevision || '未检测到'
                                });
                            }
                            catch (logError) {
                                console.error('⚠️ [警告] 创建代码更新完成日志失败:', logError.message);
                            }
                        }
                        else {
                            console.log('⚠️ [步骤18] 跳过代码更新完成操作日志记录（未提供用户ID）');
                        }
                        console.log('🎉 [总结] 代码更新流程全部完成:', {
                            projectId: id,
                            projectName: project.name,
                            totalTime: totalExecutionTime + '秒',
                            exitCode: code,
                            svnRevision: svnRevision || '未检测到',
                            success: true
                        });
                        onComplete();
                    }
                    catch (updateError) {
                        console.error('❌ [错误] 更新代码更新完成状态失败:', updateError.message);
                        onError(`更新代码更新完成状态失败: ${updateError.message}`);
                    }
                }
            });
            childProcess.on('error', async (error) => {
                if (!isCompleted && !timeoutOccurred) {
                    clearTimeout(timeoutTimer);
                    isCompleted = true;
                    const endTime = new Date();
                    const duration = Math.floor((endTime.getTime() - savedLog.startTime.getTime()) / 1000);
                    console.error('💥 [异常] 代码更新命令执行进程发生错误:', {
                        projectId: id,
                        command: project.updateCodeCommand,
                        error: error.message,
                        errorName: error.name,
                        duration: duration + '秒',
                        pid: childProcess.pid,
                        outputLength: outputBuffer.length,
                        errorLength: errorBuffer.length
                    });
                    onOutput(`\n❌ 代码更新进程执行错误: ${error.message}\n`);
                    onOutput(`⏱️  执行时间: ${duration}秒\n`);
                    onOutput(`📊 已收集输出: ${outputBuffer.length} 字符\n`);
                    try {
                        const updatedLog = await this.projectUpdateCodeLogRepository.save({
                            ...savedLog,
                            status: project_update_code_log_entity_1.UpdateCodeStatus.FAILED,
                            endTime,
                            duration,
                            errorMessage: error.message
                        });
                        console.log('📝 [异常] 代码更新错误日志状态更新成功');
                        await this.projectRepository.update(id, {
                            currentUpdateCodeStatus: project_entity_1.ProjectUpdateStatus.IDLE,
                            currentUpdateCodeLogId: null
                        });
                        console.log('🔄 [异常] 项目代码状态重置成功');
                        this.broadcastProjectStatus(id, project_entity_1.ProjectUpdateStatus.IDLE, undefined, updatedLog);
                        console.log('📢 [异常] 代码状态广播完成');
                    }
                    catch (updateError) {
                        console.error('❌ [异常] 更新代码错误状态失败:', updateError.message);
                    }
                    if (userId) {
                        try {
                            await this.logHelper.logError(userId, 'project', 'project', '执行更新代码', '项目更新代码进程错误', error.message, {
                                projectId: id,
                                command: project.updateCodeCommand,
                                directory: project.updateCodeDirectory,
                                duration: duration,
                                outputLength: outputBuffer.length
                            }, ipAddress, userAgent);
                            console.log('📝 [异常] 代码更新错误操作日志记录成功');
                        }
                        catch (logError) {
                            console.error('⚠️ [警告] 创建代码更新错误日志失败:', logError.message);
                        }
                    }
                    const errorMsg = `代码更新进程启动失败: ${error.message}`;
                    onError(errorMsg);
                }
            });
            console.log('✅ [步骤14] 代码更新进程监听器设置完成，等待命令执行...');
        }
        catch (error) {
            const totalExecutionTime = Math.floor((Date.now() - startTimeMs) / 1000);
            console.error('💥 [异常] 执行代码更新流程发生未捕获异常:', {
                projectId: id,
                error: error.message,
                errorName: error.name,
                stack: error.stack,
                totalTime: totalExecutionTime + '秒'
            });
            if (userId) {
                try {
                    await this.logHelper.logError(userId, 'project', 'project', '执行更新代码', '项目更新代码流程异常', error.message, {
                        projectId: id,
                        totalTime: totalExecutionTime,
                        step: '流程异常'
                    }, ipAddress, userAgent);
                    console.log('📝 [异常] 代码更新流程异常日志记录成功');
                }
                catch (logError) {
                    console.error('⚠️ [警告] 创建代码更新流程异常日志失败:', logError.message);
                }
            }
            onError(`代码更新流程异常: ${error.message}`);
        }
    }
    async getProjectUpdateLogs(projectId, limit = 10) {
        return await this.projectUpdateLogRepository.find({
            where: { projectId },
            order: { startTime: 'DESC' },
            take: limit
        });
    }
    async getProjectUpdateStatus(projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
            throw new Error('项目不存在');
        }
        let currentLog = null;
        if (project.currentUpdateLogId) {
            currentLog = await this.projectUpdateLogRepository.findOne({
                where: { id: project.currentUpdateLogId }
            });
        }
        return {
            status: project.currentUpdateStatus,
            currentLog
        };
    }
    async getProjectUpdateCodeLogs(projectId, limit = 10) {
        return await this.projectUpdateCodeLogRepository.find({
            where: { projectId },
            order: { startTime: 'DESC' },
            take: limit
        });
    }
    async getProjectUpdateCodeStatus(projectId) {
        const project = await this.projectRepository.findOne({ where: { id: projectId } });
        if (!project) {
            throw new Error('项目不存在');
        }
        let currentLog = null;
        if (project.currentUpdateCodeLogId) {
            currentLog = await this.projectUpdateCodeLogRepository.findOne({
                where: { id: project.currentUpdateCodeLogId }
            });
        }
        return {
            status: project.currentUpdateCodeStatus,
            currentLog
        };
    }
    async getActiveProjects() {
        return await this.projectRepository.find({
            where: { isActive: true },
            order: { sortOrder: 'DESC', createdAt: 'DESC' }
        });
    }
    async isMobileAvailable() {
        const updatingProjects = await this.projectRepository.find({
            where: [
                {
                    isActive: true,
                    currentUpdateStatus: project_entity_1.ProjectUpdateStatus.UPDATING
                },
                {
                    isActive: true,
                    currentUpdateCodeStatus: project_entity_1.ProjectUpdateStatus.UPDATING
                }
            ],
            select: ['id', 'name']
        });
        return {
            available: updatingProjects.length === 0,
            updatingProjects: updatingProjects.map(p => p.name)
        };
    }
    broadcastProjectStatus(projectId, status, updateLog, updateCodeLog) {
        if (this.projectGateway?.server) {
            const room = `project-${projectId}`;
            const isMobileAvailable = status !== project_entity_1.ProjectUpdateStatus.UPDATING;
            if (updateLog) {
                this.projectGateway.server.to(room).emit('projectStatusChanged', {
                    projectId,
                    status,
                    updateLog,
                    isMobileAvailable,
                    timestamp: new Date().toISOString(),
                    message: status === project_entity_1.ProjectUpdateStatus.UPDATING
                        ? '项目正在更新打包中，手机版和iPad暂时不可用...'
                        : status === project_entity_1.ProjectUpdateStatus.IDLE
                            ? '项目更新打包完成，移动端已恢复访问'
                            : '项目状态已更新'
                });
            }
            else if (updateCodeLog) {
                this.projectGateway.server.to(room).emit('projectCodeStatusChanged', {
                    projectId,
                    status,
                    updateCodeLog,
                    isMobileAvailable,
                    timestamp: new Date().toISOString(),
                    message: status === project_entity_1.ProjectUpdateStatus.UPDATING
                        ? '项目正在更新代码中，手机版和iPad暂时不可用...'
                        : status === project_entity_1.ProjectUpdateStatus.IDLE
                            ? '项目代码更新完成，移动端已恢复访问'
                            : '项目代码状态已更新'
                });
            }
            this.projectGateway.server.emit('globalMobileStatusChanged', {
                projectId,
                isMobileAvailable,
                status,
                timestamp: new Date().toISOString(),
            });
        }
    }
    detectSvnRevision(output, currentRevision, source = 'stdout') {
        if (currentRevision) {
            return currentRevision;
        }
        const svnPatterns = [
            { pattern: /At revision (\d+)\./, name: 'At revision' },
            { pattern: /Updated to revision (\d+)\./, name: 'Updated to revision' },
            { pattern: /Revision: (\d+)/, name: 'Revision:' },
            { pattern: /svn update.*?revision (\d+)/i, name: 'svn update with revision' },
            { pattern: /\bSVN:\s*(\d+)/i, name: 'SVN: notation' },
            { pattern: /\brev(?:ision)?[\s:]\s*(\d+)/i, name: 'rev/revision notation' }
        ];
        console.log(`🔍 [SVN调试-${source}] 检查输出文本:`, {
            length: output.length,
            firstLine: output.split('\n')[0],
            containsRevision: output.includes('revision'),
            containsUpdated: output.includes('Updated'),
            containsAt: output.includes('At'),
            fullOutput: output
        });
        for (const { pattern, name } of svnPatterns) {
            const match = output.match(pattern);
            if (match) {
                const revision = parseInt(match[1], 10);
                if (revision > 0 && revision <= 100000) {
                    console.log(`🔍 [SVN检测-${source}] 发现有效 SVN 版本号:`, {
                        revision,
                        matchedText: match[0],
                        patternName: name,
                        pattern: pattern.toString()
                    });
                    return revision;
                }
                else {
                    console.log(`⚠️ [SVN检测-${source}] 跳过无效版本号:`, {
                        revision,
                        matchedText: match[0],
                        patternName: name,
                        reason: revision <= 0 ? '版本号必须大于0' : '版本号超出合理范围(1-100000)'
                    });
                }
            }
        }
        return null;
    }
};
exports.ProjectService = ProjectService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectService.prototype, "handleUpdateTimeout", null);
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_update_log_entity_1.ProjectUpdateLog)),
    __param(2, (0, typeorm_1.InjectRepository)(project_update_code_log_entity_1.ProjectUpdateCodeLog)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => 'ProjectGateway'))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        log_helper_1.LogHelper, Object])
], ProjectService);
//# sourceMappingURL=project.service.js.map