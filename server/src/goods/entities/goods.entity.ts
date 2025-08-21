import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GoodsCategory } from './goods-category.entity';

@Entity('goods')
export class Goods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 50, unique: true })
  sn: string; // 商品代码

  @Column({ length: 30, nullable: true, unique: true })
  barcode: string; // 条码

  @ManyToOne(() => GoodsCategory)
  @JoinColumn({ name: 'category_id' })
  category: GoodsCategory;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ default: true, name: 'is_confirm' })
  isConfirm: boolean;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_trash' })
  isTrash: boolean;

  @Column({ default: false, name: 'is_star' })
  isStar: boolean; // 是否标星

  @Column({ length: 10, default: '' })
  unit: string; // 单位

  @Column({ length: 20, default: '' })
  pcs: string; // 包装单位

  @Column({ type: 'float', default: 0, nullable: true })
  volume: number; // 体积

  @Column({ type: 'float', default: 0, nullable: true, name: 'gross_weight' })
  grossWeight: number; // 毛重

  @Column({ type: 'float', default: 0, nullable: true, name: 'net_weight' })
  netWeight: number; // 净重

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0 })
  carrier: number; // 运费

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'purchase_price' })
  purchasePrice: number; // 采购价

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'cost_price' })
  costPrice: number; // 成本价

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'retail_price' })
  retailPrice: number; // 零售价

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'wholesale_price' })
  wholesalePrice: number; // 批发价

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'membered_price' })
  memberedPrice: number; // 会员价

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 0, name: 'deputy_price' })
  deputyPrice: number; // 代发价

  @Column({ type: 'decimal', precision: 16, scale: 3, default: 0, name: 'inventory_alert' })
  inventoryAlert: number; // 预警数量

  @Column({ name: 'creator_id', default: 1 })
  creatorId: number;

  @CreateDateColumn()
  created: Date;
}
