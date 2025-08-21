import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '应用模块名称' })
  app: string;

  @Column({ type: 'varchar', length: 50, comment: '模型名称' })
  model: string;

  @Column({ type: 'int', nullable: true, comment: '单据ID' })
  billId?: number;

  @Column({ type: 'varchar', length: 100, comment: '操作动作' })
  action: string;

  @Column({ type: 'text', comment: '操作内容' })
  content: string;

  @Column({ type: 'varchar', length: 20, default: 'success', comment: '操作状态：success-成功，error-失败' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'IP地址' })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '用户代理' })
  userAgent?: string;

  @Column({ type: 'json', nullable: true, comment: '请求参数' })
  requestData?: any;

  @Column({ type: 'json', nullable: true, comment: '响应数据' })
  responseData?: any;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage?: string;

  @Column({ type: 'int', nullable: true, comment: '执行时间(毫秒)' })
  executionTime?: number;

  // 关联用户
  @Column({ name: 'user_id', nullable: true, comment: '操作用户ID' })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  // 虚拟字段，用于返回给前端
  userName?: string;
  userEmail?: string;
} 