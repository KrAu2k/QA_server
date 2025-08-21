import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';

export enum UpdateStatus {
  UPDATING = 'updating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

@Entity('project_update_logs')
export class ProjectUpdateLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({
    type: 'enum',
    enum: UpdateStatus,
    default: UpdateStatus.UPDATING
  })
  status: UpdateStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '发起更新的用户ID' })
  startedBy: string; // 用户ID，不是外键

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '发起更新的用户名' })
  startedByName: string; // 用户名

  @CreateDateColumn()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column({ nullable: true })
  duration: number; // 执行时长（秒）

  @Column({ nullable: true, comment: 'SVN版本号' })
  svnRevision: number; // SVN版本号

  @Column({ nullable: true, comment: '进程退出码' })
  exitCode: number; // 进程退出码

  @Column({ nullable: true, comment: '进程终止信号' })
  signal: string; // 进程终止信号

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string; // 错误信息

  @UpdateDateColumn()
  updatedAt: Date;
}
