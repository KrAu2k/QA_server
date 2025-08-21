import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateGoodsDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sn?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsBoolean()
  isConfirm?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTrash?: boolean;

  @IsOptional()
  @IsBoolean()
  isStar?: boolean;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  pcs?: string;

  @IsOptional()
  @IsNumber()
  volume?: number;

  @IsOptional()
  @IsNumber()
  grossWeight?: number;

  @IsOptional()
  @IsNumber()
  netWeight?: number;

  @IsOptional()
  @IsNumber()
  carrier?: number;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  retailPrice?: number;

  @IsOptional()
  @IsNumber()
  wholesalePrice?: number;

  @IsOptional()
  @IsNumber()
  memberedPrice?: number;

  @IsOptional()
  @IsNumber()
  deputyPrice?: number;

  @IsOptional()
  @IsNumber()
  inventoryAlert?: number;

  @IsNumber()
  creatorId: number;
}
