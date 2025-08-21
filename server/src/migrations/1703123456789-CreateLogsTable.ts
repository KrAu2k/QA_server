import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateLogsTable1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'app',
            type: 'varchar',
            length: '50',
            comment: '应用模块名称',
          },
          {
            name: 'model',
            type: 'varchar',
            length: '50',
            comment: '模型名称',
          },
          {
            name: 'billId',
            type: 'int',
            isNullable: true,
            comment: '单据ID',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            comment: '操作动作',
          },
          {
            name: 'content',
            type: 'text',
            comment: '操作内容',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'success'",
            comment: '操作状态：success-成功，error-失败',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'IP地址',
          },
          {
            name: 'userAgent',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: '用户代理',
          },
          {
            name: 'requestData',
            type: 'json',
            isNullable: true,
            comment: '请求参数',
          },
          {
            name: 'responseData',
            type: 'json',
            isNullable: true,
            comment: '响应数据',
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
            comment: '错误信息',
          },
          {
            name: 'executionTime',
            type: 'int',
            isNullable: true,
            comment: '执行时间(毫秒)',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '操作用户ID',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
        ],
      }),
      true,
    );

    // 创建索引
    await queryRunner.query(
      'CREATE INDEX idx_logs_app ON logs (app)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_logs_model ON logs (model)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_logs_action ON logs (action)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_logs_status ON logs (status)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_logs_userId ON logs (userId)',
    );
    await queryRunner.query(
      'CREATE INDEX idx_logs_createdAt ON logs (createdAt)',
    );

    // 创建外键关联用户表
    await queryRunner.createForeignKey(
      'logs',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键
    const table = await queryRunner.getTable('logs');
    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('logs', foreignKey);
    }

    // 删除索引
    await queryRunner.query('DROP INDEX idx_logs_app ON logs');
    await queryRunner.query('DROP INDEX idx_logs_model ON logs');
    await queryRunner.query('DROP INDEX idx_logs_action ON logs');
    await queryRunner.query('DROP INDEX idx_logs_status ON logs');
    await queryRunner.query('DROP INDEX idx_logs_userId ON logs');
    await queryRunner.query('DROP INDEX idx_logs_createdAt ON logs');

    // 删除表
    await queryRunner.dropTable('logs');
  }
} 