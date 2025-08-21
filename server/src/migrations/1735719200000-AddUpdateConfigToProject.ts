import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUpdateConfigToProject1735719200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('project', [
      new TableColumn({
        name: 'update_command',
        type: 'text',
        isNullable: true,
        comment: '更新命令',
      }),
      new TableColumn({
        name: 'update_directory',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: '更新目录路径',
      }),
      new TableColumn({
        name: 'enable_update',
        type: 'boolean',
        default: false,
        comment: '是否启用更新功能',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('project', [
      'update_command',
      'update_directory', 
      'enable_update'
    ]);
  }
}
