import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Exclude } from 'class-transformer';
  import { Department } from '../../department/entities/department.entity';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;
  
    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    username: string;
  
    @Column({ type: 'varchar', nullable: false })
    @Exclude() // 在序列化时自动排除密码字段
    password: string;
  
    @Column({ type: 'varchar', nullable: true })
    avatar?: string;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    employeeNo: string;
  
    @Column({ type: 'varchar', nullable: false })
    email: string;
  
    @Column({ type: 'text', nullable: true })
    signature?: string;
  
    @Column({ type: 'varchar', nullable: true })
    title?: string;
  
    @Column({ type: 'varchar', nullable: true })
    group?: string;
  
    @Column({ type: 'simple-array', nullable: true })
    tags?: string[];
  
    @Column({ type: 'int', nullable: true })
    notifyCount?: number;
  
    @Column({ type: 'int', nullable: true })
    unreadCount?: number;
  
    @Column({ type: 'varchar', nullable: true })
    country?: string;
  
    @Column({ type: 'varchar', nullable: true })
    access?: string;
  
    @Column({ type: 'json', nullable: true })
    geographic?: {
      province: Record<string, any>;
      city: Record<string, any>;
    };
  
    @Column({ type: 'varchar', nullable: true })
    address?: string;    @Column({ type: 'varchar', nullable: true })
    phone?: string;

    // 部门关联
    @Column({ name: 'department_id', nullable: true, comment: '所属部门ID' })
    departmentId?: number;

    @ManyToOne(() => Department, (department) => department.members, { nullable: true })
    @JoinColumn({ name: 'department_id' })
    department?: Department;

    // 职位信息
    @Column({ type: 'varchar', length: 100, nullable: true, comment: '职位名称' })
    position?: string;

    // 入职时间
    @Column({ name: 'join_date', type: 'date', nullable: true, comment: '入职时间' })
    joinDate?: Date;

    // 是否为管理员
    @Column({ name: 'is_admin', type: 'boolean', default: false, comment: '是否为管理员' })
    isAdmin: boolean;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
  }