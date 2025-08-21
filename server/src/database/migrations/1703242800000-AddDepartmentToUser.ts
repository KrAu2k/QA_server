import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDepartmentToUser1703242800000 implements MigrationInterface {
  name = 'AddDepartmentToUser1703242800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加部门ID字段到用户表
    await queryRunner.query(`
      ALTER TABLE \`user\` 
      ADD \`department_id\` int NULL COMMENT '所属部门ID',
      ADD \`position\` varchar(100) NULL COMMENT '职位名称',
      ADD \`join_date\` date NULL COMMENT '入职时间'
    `);

    // 添加外键约束
    await queryRunner.query(`
      ALTER TABLE \`user\` 
      ADD CONSTRAINT \`FK_user_department\` 
      FOREIGN KEY (\`department_id\`) 
      REFERENCES \`departments\`(\`id\`) 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 添加索引
    await queryRunner.query(`
      CREATE INDEX \`IDX_user_department_id\` ON \`user\` (\`department_id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键约束
    await queryRunner.query(`
      ALTER TABLE \`user\` 
      DROP FOREIGN KEY \`FK_user_department\`
    `);

    // 删除索引
    await queryRunner.query(`DROP INDEX \`IDX_user_department_id\` ON \`user\``);

    // 删除字段
    await queryRunner.query(`
      ALTER TABLE \`user\` 
      DROP COLUMN \`department_id\`,
      DROP COLUMN \`position\`,
      DROP COLUMN \`join_date\`
    `);
  }
}
