"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const log_module_1 = require("./log/log.module");
const department_module_1 = require("./department/department.module");
const bi_database_module_1 = require("./bi-database/bi-database.module");
const project_module_1 = require("./project/project.module");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env'
            }),
            schedule_1.ScheduleModule.forRoot(),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: '/Users/StingZZ/CODE/QA/dist',
                serveRoot: '/',
                serveStaticOptions: {
                    index: ['index.html', 'index.htm'],
                    dotfiles: 'ignore',
                    etag: false,
                    extensions: [],
                    fallthrough: true,
                    immutable: false,
                    lastModified: true,
                    maxAge: 0,
                    redirect: true,
                    setHeaders: (res, path, stat) => {
                        res.set('Cache-Control', 'no-cache');
                    },
                },
            }, {
                rootPath: '/Users/StingZZ/CODE/QA/h5',
                serveRoot: '/games',
                serveStaticOptions: {
                    index: ['index.html', 'index.htm'],
                    dotfiles: 'ignore',
                    etag: false,
                    extensions: [],
                    fallthrough: true,
                    immutable: false,
                    lastModified: true,
                    maxAge: 0,
                    redirect: true,
                    setHeaders: (res, path, stat) => {
                        res.set('Cache-Control', 'no-cache');
                    },
                },
            }),
            typeorm_1.TypeOrmModule.forRoot({
                name: 'default',
                type: 'mysql',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                autoLoadEntities: true,
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                name: 'report',
                type: 'mysql',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.REPORT_DB_NAME || 'report',
                autoLoadEntities: true,
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                name: 'bi',
                type: 'mysql',
                host: process.env.BI_DB_HOST,
                port: parseInt(process.env.BI_DB_PORT),
                username: process.env.BI_DB_USERNAME,
                password: process.env.BI_DB_PASSWORD,
                database: process.env.BI_DB_NAME,
                autoLoadEntities: true,
                synchronize: false,
                extra: {
                    authPlugins: {
                        mysql_clear_password: () => require('mysql2/lib/auth_plugins/mysql_clear_password')
                    }
                },
                charset: 'utf8mb4',
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            log_module_1.LogModule,
            department_module_1.DepartmentModule,
            bi_database_module_1.BiDatabaseModule,
            project_module_1.ProjectModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map