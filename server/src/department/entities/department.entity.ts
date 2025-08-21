import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Tree,
  TreeParent,
  TreeChildren,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('departments')
@Tree('closure-table')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '部门名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '部门编码' })
  code: string;

  @Column({ type: 'int', default: 0, comment: '排序号' })
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '部门描述' })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '部门路径' })
  path?: string;

  @Column({ type: 'int', default: 1, comment: '部门层级' })
  level: number;

  // 多负责人
  @Column({ name: 'manager_ids', type: 'simple-json', nullable: true, comment: '部门负责人ID列表' })
  managerIds?: string[];

  // 虚拟字段，仅用于返回
  managerNames?: string[];

  @TreeParent()
  @JoinColumn({ name: 'parent_id' })
  parent?: Department;

  @TreeChildren()
  children?: Department[];

  // 部门成员
  @OneToMany(() => User, (user) => user.department)
  members?: User[];

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 虚拟字段，用于返回给前端
  parentId?: number;
  parentName?: string;
  memberCount?: number;
  childCount?: number;
  totalMemberCount?: number;
  createTime?: string;
  updateTime?: string;
}
