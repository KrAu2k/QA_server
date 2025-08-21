import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum UpdateCodeStatus {
  UPDATING = 'updating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

@Entity()
export class ProjectUpdateCodeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '项目ID' })
  projectId: string;

  @Column({
    type: 'enum',
    enum: UpdateCodeStatus,
    default: UpdateCodeStatus.UPDATING,
    comment: '更新代码状态'
  })
  status: UpdateCodeStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '启动用户ID' })
  startedBy?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '启动用户名' })
  startedByName?: string;

  @Column({ type: 'timestamp', nullable: false, comment: '开始时间' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '结束时间' })
  endTime?: Date;

  @Column({ type: 'int', nullable: true, comment: '执行时长(秒)' })
  duration?: number;

  @Column({ nullable: true, comment: 'SVN版本号' })
  svnRevision: number; // SVN版本号

  @Column({ nullable: true, comment: '进程退出码' })
  exitCode: number; // 进程退出码

  @Column({ nullable: true, comment: '进程终止信号' })
  signal: string; // 进程终止信号

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string; // 错误信息

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;
}
