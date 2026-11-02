import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  MAGIC_BONUS_KINDS,
  MAGIC_ITEM_KINDS,
  MAGIC_REALMS,
  MAGIC_SPELL_USES,
  type MagicBonusKind,
  type MagicItemBonus,
  type MagicItemFeature,
  type MagicItemKind,
  type MagicItemSpell,
  type MagicSpellUse,
} from '../../../domain/value-objects/item-magic.vo.js';

/** A structured bonus of a magic item (spec 067). */
export class MagicItemBonusDto {
  @ApiProperty({ type: String, enum: MAGIC_BONUS_KINDS, example: 'ob' })
  @IsIn(MAGIC_BONUS_KINDS)
  kind: MagicBonusKind;

  @ApiProperty({ example: 10 })
  @IsNumber()
  value: number;

  @ApiProperty({ type: String, required: false, description: 'Skill, stat or resistance it applies to', example: 'perception' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  target?: string | null;

  @ApiProperty({ type: String, required: false, description: 'Creature type it works against', example: 'undead' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  against?: string | null;

  static toEntity(dto: MagicItemBonusDto): MagicItemBonus {
    return { kind: dto.kind, value: dto.value, target: dto.target ?? null, against: dto.against ?? null };
  }
}

/** A spell of the recipe or one the item casts (spec 067). */
export class MagicItemSpellDto {
  @ApiProperty({ example: 'Light' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiProperty({ type: String, required: false, description: 'Spell list', example: 'light-law' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  list?: string | null;

  @ApiProperty({ type: String, enum: MAGIC_SPELL_USES, example: 'daily' })
  @IsIn(MAGIC_SPELL_USES)
  use: MagicSpellUse;

  @ApiProperty({ type: Number, required: false, description: 'Uses per day, only for the daily use', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  perDay?: number | null;

  static toEntity(dto: MagicItemSpellDto): MagicItemSpell {
    return { name: dto.name, level: dto.level, list: dto.list ?? null, use: dto.use, perDay: dto.perDay ?? null };
  }
}

/** The magic block of an item type (spec 067, decision 4): any category may have it. */
export class ItemMagicDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  itemLevel: number;

  @ApiProperty({ type: String, enum: MAGIC_ITEM_KINDS, example: 'weapon' })
  @IsIn(MAGIC_ITEM_KINDS)
  kind: MagicItemKind;

  @ApiProperty({ type: Number, required: false, description: 'Working days of the recipe', example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  days: number | null;

  @ApiProperty({ type: Number, required: false, description: 'Gold, power level Superior, base item included', example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  standardPrice: number | null;

  @ApiProperty({ type: Number, required: false, description: 'Gold, the base item part of the standard price', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice: number | null;

  @ApiProperty({ required: false, description: 'It needs attunement; false when missing', example: false })
  @IsOptional()
  @IsBoolean()
  attunement: boolean;

  @ApiProperty({ type: Number, required: false, description: 'Max charges', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  charges: number | null;

  @ApiProperty({ type: String, enum: MAGIC_REALMS, required: false, example: 'essence' })
  @IsOptional()
  @IsIn(MAGIC_REALMS)
  realm: string | null;

  @ApiProperty({ type: [MagicItemBonusDto], required: false, description: '[] when missing' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => MagicItemBonusDto)
  bonuses: MagicItemBonusDto[];

  @ApiProperty({ type: [MagicItemSpellDto], required: false, description: '[] when missing' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => MagicItemSpellDto)
  spells: MagicItemSpellDto[];

  @ApiProperty({ type: String, required: false, description: 'Book section', example: '6.5' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  section: string | null;

  static toEntity(dto: ItemMagicDto): MagicItemFeature {
    return {
      itemLevel: dto.itemLevel,
      kind: dto.kind,
      days: dto.days ?? null,
      standardPrice: dto.standardPrice ?? null,
      basePrice: dto.basePrice ?? null,
      attunement: dto.attunement ?? false,
      charges: dto.charges ?? null,
      realm: dto.realm ?? null,
      bonuses: (dto.bonuses ?? []).map(bonus => MagicItemBonusDto.toEntity(bonus)),
      spells: (dto.spells ?? []).map(spell => MagicItemSpellDto.toEntity(spell)),
      section: dto.section ?? null,
    };
  }
}
