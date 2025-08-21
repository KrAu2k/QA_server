"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsAdminToUser1751961538936 = void 0;
class AddIsAdminToUser1751961538936 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            ADD COLUMN \`is_admin\` tinyint(1) NOT NULL DEFAULT 0 
            COMMENT '是否为管理员'
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`is_admin\`
        `);
    }
}
exports.AddIsAdminToUser1751961538936 = AddIsAdminToUser1751961538936;
//# sourceMappingURL=1751961538936-AddIsAdminToUser.js.map