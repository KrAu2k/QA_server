import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProjectUpdateStatus {
  IDLE = 'idle',
  UPDATING = 'updating'
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '项目名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '项目描述' })
  description?: string;

  @Column({ type: 'text', nullable: false, comment: 'H5地址' })
  h5Url: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '项目图标' })
  icon?: string;

  @Column({ type: 'int', default: 0, comment: '排序权重，数字越大越靠前' })
  sortOrder: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  // 更新相关配置
  @Column({ type: 'text', nullable: true, comment: '更新命令' })
  updateCommand?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '更新目录路径' })
  updateDirectory?: string;

  @Column({ type: 'boolean', default: false, comment: '是否启用更新功能' })
  enableUpdate: boolean;

  // 更新代码相关配置
  @Column({ type: 'text', nullable: true, comment: '更新代码命令' })
  updateCodeCommand?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '更新代码目录路径' })
  updateCodeDirectory?: string;

  @Column({ type: 'boolean', default: false, comment: '是否启用更新代码功能' })
  enableUpdateCode: boolean;

  // 打包 APK 相关配置
  @Column({ type: 'text', nullable: true, comment: '打包命令' })
  packageCommand?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '打包目录路径' })
  packageDirectory?: string;

  @Column({ type: 'boolean', default: false, comment: '是否启用打包功能' })
  enablePackage: boolean;

  @Column({ type: 'varchar', length: 1000, nullable: true, comment: 'APK 下载地址' })
  packageDownloadUrl?: string;

  // 清缓存相关配置
  @Column({ type: 'text', nullable: true, comment: '清缓存命令' })
  clearCacheCommand?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '清缓存目录路径' })
  clearCacheDirectory?: string;

  @Column({ type: 'boolean', default: false, comment: '是否启用清缓存功能' })
  enableClearCache: boolean;

  // 更新状态及日志ID
  @Column({
    type: 'enum',
    enum: ProjectUpdateStatus,
    default: ProjectUpdateStatus.IDLE,
    comment: '当前更新状态'
  })
  currentUpdateStatus: ProjectUpdateStatus;

  @Column({ nullable: true, comment: '当前更新日志ID' })
  currentUpdateLogId?: string;

  // 更新代码状态及日志ID
  @Column({
    type: 'enum',
    enum: ProjectUpdateStatus,
    default: ProjectUpdateStatus.IDLE,
    comment: '当前更新代码状态'
  })
  currentUpdateCodeStatus: ProjectUpdateStatus;

  @Column({ nullable: true, comment: '当前更新代码日志ID' })
  currentUpdateCodeLogId?: string;

  // 打包状态及日志ID
  @Column({
    type: 'enum',
    enum: ProjectUpdateStatus,
    default: ProjectUpdateStatus.IDLE,
    comment: '当前打包状态'
  })
  currentPackageStatus: ProjectUpdateStatus;

  @Column({ nullable: true, comment: '当前打包日志ID' })
  currentPackageLogId?: string;

  // 清缓存状态及日志ID
  @Column({
    type: 'enum',
    enum: ProjectUpdateStatus,
    default: ProjectUpdateStatus.IDLE,
    comment: '当前清缓存状态'
  })
  currentClearCacheStatus: ProjectUpdateStatus;

  @Column({ nullable: true, comment: '当前清缓存日志ID' })
  currentClearCacheLogId?: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
