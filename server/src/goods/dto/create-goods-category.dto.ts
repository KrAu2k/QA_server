import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGoodsCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
