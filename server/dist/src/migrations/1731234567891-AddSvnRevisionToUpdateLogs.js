"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSvnRevisionToUpdateLogs1731234567891 = void 0;
class AddSvnRevisionToUpdateLogs1731234567891 {
    constructor() {
        this.name = 'AddSvnRevisionToUpdateLogs1731234567891';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`svnRevision\` int NULL COMMENT 'SVN版本号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`exitCode\` int NULL COMMENT '进程退出码'`);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`signal\` varchar(255) NULL COMMENT '进程终止信号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`errorMessage\` text NULL COMMENT '错误信息'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`svnRevision\` int NULL COMMENT 'SVN版本号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`exitCode\` int NULL COMMENT '进程退出码'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`signal\` varchar(255) NULL COMMENT '进程终止信号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`errorMessage\` text NULL COMMENT '错误信息'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`errorMessage\``);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`signal\``);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`exitCode\``);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`svnRevision\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`errorMessage\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`signal\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`exitCode\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`svnRevision\``);
    }
}
exports.AddSvnRevisionToUpdateLogs1731234567891 = AddSvnRevisionToUpdateLogs1731234567891;
//# sourceMappingURL=1731234567891-AddSvnRevisionToUpdateLogs.js.map