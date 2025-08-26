import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project, ProjectUpdateStatus } from './project.entity';

@Entity('project_cache_logs')
export class ProjectCacheLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({
    type: 'enum',
    enum: ProjectUpdateStatus,
    default: ProjectUpdateStatus.UPDATING,
    comment: '清缓存状态',
  })
  status: ProjectUpdateStatus;

  @Column({ nullable: true, comment: '发起清缓存的用户ID' })
  startedBy?: string;

  @Column({ nullable: true, comment: '发起清缓存的用户名' })
  startedByName?: string;

  @CreateDateColumn()
  startTime: Date;

  @Column({ nullable: true })
  endTime?: Date;

  @Column({ nullable: true, comment: '执行时长(秒)' })
  duration?: number;

  @Column({ nullable: true, comment: '进程退出码' })
  exitCode?: number;

  @Column({ nullable: true, comment: '进程终止信号' })
  signal?: string;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage?: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
