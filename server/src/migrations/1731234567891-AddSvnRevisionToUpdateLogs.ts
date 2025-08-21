import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSvnRevisionToUpdateLogs1731234567891 implements MigrationInterface {
    name = 'AddSvnRevisionToUpdateLogs1731234567891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 为 project_update_logs 表添加新字段
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`svnRevision\` int NULL COMMENT 'SVN版本号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`exitCode\` int NULL COMMENT '进程退出码'`);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`signal\` varchar(255) NULL COMMENT '进程终止信号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` ADD \`errorMessage\` text NULL COMMENT '错误信息'`);
        
        // 为 project_update_code_log 表添加新字段
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`svnRevision\` int NULL COMMENT 'SVN版本号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`exitCode\` int NULL COMMENT '进程退出码'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`signal\` varchar(255) NULL COMMENT '进程终止信号'`);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` ADD \`errorMessage\` text NULL COMMENT '错误信息'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 回滚 project_update_code_log 表的字段
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`errorMessage\``);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`signal\``);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`exitCode\``);
        await queryRunner.query(`ALTER TABLE \`project_update_code_log\` DROP COLUMN \`svnRevision\``);
        
        // 回滚 project_update_logs 表的字段
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`errorMessage\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`signal\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`exitCode\``);
        await queryRunner.query(`ALTER TABLE \`project_update_logs\` DROP COLUMN \`svnRevision\``);
    }
}
