"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDepartmentToUser1703242800000 = void 0;
class AddDepartmentToUser1703242800000 {
    constructor() {
        this.name = 'AddDepartmentToUser1703242800000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`user\` 
      ADD \`department_id\` int NULL COMMENT '所属部门ID',
      ADD \`position\` varchar(100) NULL COMMENT '职位名称',
      ADD \`join_date\` date NULL COMMENT '入职时间'
    `);
        await queryRunner.query(`
      ALTER TABLE \`user\` 
      ADD CONSTRAINT \`FK_user_department\` 
      FOREIGN KEY (\`department_id\`) 
      REFERENCES \`departments\`(\`id\`) 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      CREATE INDEX \`IDX_user_department_id\` ON \`user\` (\`department_id\`)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE \`user\` 
      DROP FOREIGN KEY \`FK_user_department\`
    `);
        await queryRunner.query(`DROP INDEX \`IDX_user_department_id\` ON \`user\``);
        await queryRunner.query(`
      ALTER TABLE \`user\` 
      DROP COLUMN \`department_id\`,
      DROP COLUMN \`position\`,
      DROP COLUMN \`join_date\`
    `);
    }
}
exports.AddDepartmentToUser1703242800000 = AddDepartmentToUser1703242800000;
//# sourceMappingURL=1703242800000-AddDepartmentToUser.js.map