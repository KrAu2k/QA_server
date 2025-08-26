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

@Entity('project_package_logs')
export class ProjectPackageLog {
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
    comment: '打包状态',
  })
  status: ProjectUpdateStatus;

  @Column({ nullable: true, comment: '发起打包的用户ID' })
  startedBy?: string;

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

  @Column({ type: 'varchar', length: 1000, nullable: true, comment: '生成的 APK 下载地址' })
  downloadUrl?: string;

  // ↓↓↓ 新增这两个字段用来存储全部输出 ↓↓↓
  @Column({ type: 'text', nullable: true, comment: '标准输出' })
  stdout?: string;

  @Column({ type: 'text', nullable: true, comment: '错误输出' })
  stderr?: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
