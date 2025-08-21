import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProjectTable1735718400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'project',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: '项目名称',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: '项目描述',
          },
          {
            name: 'h5_url',
            type: 'text',
            isNullable: false,
            comment: 'H5地址',
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '项目图标',
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
            comment: '排序权重，数字越大越靠前',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: '是否启用',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            comment: '更新时间',
          },
        ],
        indices: [
          {
            name: 'IDX_PROJECT_SORT_ORDER',
            columnNames: ['sort_order'],
          },
          {
            name: 'IDX_PROJECT_IS_ACTIVE',
            columnNames: ['is_active'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('project');
  }
}
