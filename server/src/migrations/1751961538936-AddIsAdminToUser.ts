import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsAdminToUser1751961538936 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加 is_admin 字段
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            ADD COLUMN \`is_admin\` tinyint(1) NOT NULL DEFAULT 0 
            COMMENT '是否为管理员'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 移除 is_admin 字段
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`is_admin\`
        `);
    }

}
