import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import type { ItemModifierType } from 'src/modules/items/domain/value-objects/item-modifier-type.vo';
import { ItemModifier } from 'src/modules/items/domain/value-objects/item-modifier.vo';

export class ItemModifierDto {
  @ApiProperty({ description: 'Modifier identifier', example: 'sharpness' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Modifier type', example: 'bonus' })
  @IsString()
  type!: ItemModifierType;

  @ApiProperty({ description: 'Modifier target', required: false })
  @IsString()
  @IsOptional()
  modifier: string | undefined;

  @ApiProperty({ description: 'Numeric value', required: false })
  @IsNumber()
  @IsOptional()
  value: number | undefined;

  static toEntity(dto: ItemModifierDto): ItemModifier {
    return new ItemModifier(dto.id, dto.type, dto.modifier ?? null, dto.value ?? null);
  }

  static fromEntity(entity: ItemModifier): ItemModifierDto {
    const dto = new ItemModifierDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.modifier = entity.modifier ?? undefined;
    dto.value = entity.value ?? undefined;
    return dto;
  }
}
