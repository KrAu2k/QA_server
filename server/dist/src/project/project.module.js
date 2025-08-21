"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_service_1 = require("./project.service");
const project_controller_1 = require("./project.controller");
const project_gateway_1 = require("./project.gateway");
const project_entity_1 = require("./entities/project.entity");
const project_update_log_entity_1 = require("./entities/project-update-log.entity");
const project_update_code_log_entity_1 = require("./entities/project-update-code-log.entity");
const log_module_1 = require("../log/log.module");
let ProjectModule = class ProjectModule {
};
exports.ProjectModule = ProjectModule;
exports.ProjectModule = ProjectModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([project_entity_1.Project, project_update_log_entity_1.ProjectUpdateLog, project_update_code_log_entity_1.ProjectUpdateCodeLog]),
            log_module_1.LogModule
        ],
        controllers: [project_controller_1.ProjectController],
        providers: [
            project_service_1.ProjectService,
            project_gateway_1.ProjectGateway,
            {
                provide: 'ProjectGateway',
                useFactory: (gateway) => gateway,
                inject: [project_gateway_1.ProjectGateway],
            }
        ],
        exports: [project_service_1.ProjectService]
    })
], ProjectModule);
//# sourceMappingURL=project.module.js.map