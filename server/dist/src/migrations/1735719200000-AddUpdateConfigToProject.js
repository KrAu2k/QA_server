"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUpdateConfigToProject1735719200000 = void 0;
const typeorm_1 = require("typeorm");
class AddUpdateConfigToProject1735719200000 {
    async up(queryRunner) {
        await queryRunner.addColumns('project', [
            new typeorm_1.TableColumn({
                name: 'update_command',
                type: 'text',
                isNullable: true,
                comment: '更新命令',
            }),
            new typeorm_1.TableColumn({
                name: 'update_directory',
                type: 'varchar',
                length: '500',
                isNullable: true,
                comment: '更新目录路径',
            }),
            new typeorm_1.TableColumn({
                name: 'enable_update',
                type: 'boolean',
                default: false,
                comment: '是否启用更新功能',
            }),
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumns('project', [
            'update_command',
            'update_directory',
            'enable_update'
        ]);
    }
}
exports.AddUpdateConfigToProject1735719200000 = AddUpdateConfigToProject1735719200000;
//# sourceMappingURL=1735719200000-AddUpdateConfigToProject.js.map