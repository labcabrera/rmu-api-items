import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { DIFFICULTY_CODES, type DifficultyCode } from '../../../domain/value-objects/difficulty-code.vo.js';
import {
  ACID_STRENGTHS,
  ACID_TARGETS,
  ANIMAL_STAGES,
  type AcidStrength,
  type AcidTarget,
  type AnimalStage,
  BIOMES,
  type Biome,
  CRITICAL_SEVERITIES,
  type CriticalSeverity,
  GEM_GRADES,
  type GemGrade,
  HERB_EFFECT_DELAYS,
  HERB_GROUPS,
  HERB_INJURY_KINDS,
  HERB_PREPS,
  type HerbEffectDelay,
  type HerbEffects,
  type HerbGroup,
  type HerbInjuryKind,
  type HerbPrep,
  type ItemAcid,
  type ItemAnimal,
  type ItemDecimalRange,
  type ItemGem,
  type ItemHerb,
  type ItemIntoxicant,
  type ItemJewelry,
  type ItemProperty,
  type ItemAmmunition,
  type ItemAntidote,
  type ItemContainer,
  type ItemFeatures,
  type ItemLight,
  type ItemPoison,
  type ItemRange,
  type ItemTransport,
  POISON_CATEGORIES,
  POISON_FORMS,
  POISON_SEVERITIES,
  type PoisonCategory,
  type PoisonForm,
  type PoisonSeverity,
} from '../../../domain/value-objects/item-features.vo.js';

export class ItemContainerDto {
  @ApiProperty({ type: Number, description: 'Pounds it holds', required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight: number | null;

  @ApiProperty({ type: Number, description: 'Cubic feet it holds', required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume: number | null;

  @ApiProperty({ type: Number, description: 'Gallons it holds', required: false, example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  liquid: number | null;

  @ApiProperty({ type: Number, description: 'Units it holds (arrows, weapons)', required: false, example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  units: number | null;

  static toEntity(dto: ItemContainerDto): ItemContainer {
    return { weight: dto.weight ?? null, volume: dto.volume ?? null, liquid: dto.liquid ?? null, units: dto.units ?? null };
  }
}

export class ItemLightDto {
  @ApiProperty({ type: Number, description: 'Radius lit, in feet', required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  radius: number | null;

  @ApiProperty({ type: Number, description: 'Hours of light of each load', required: false, example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationHours: number | null;

  static toEntity(dto: ItemLightDto): ItemLight {
    return { radius: dto.radius ?? null, durationHours: dto.durationHours ?? null };
  }
}

export class ItemTransportDto {
  @ApiProperty({ type: Number, description: 'Pounds it carries', required: false, example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity: number | null;

  @ApiProperty({ type: Number, description: 'Feet per round', required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed: number | null;

  static toEntity(dto: ItemTransportDto): ItemTransport {
    return { capacity: dto.capacity ?? null, speed: dto.speed ?? null };
  }
}

export class ItemAmmunitionDto {
  @ApiProperty({ type: [String], description: 'Item types that shoot it', example: ['short-bow'] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  launchers: string[];

  @ApiProperty({ type: Number, description: 'Attack size adjustment', example: 0 })
  @IsInt()
  sizeAdjustment: number;

  static toEntity(dto: ItemAmmunitionDto): ItemAmmunition {
    return { launchers: [...new Set(dto.launchers)], sizeAdjustment: dto.sizeAdjustment };
  }
}

export class ItemRangeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  min: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  max: number;

  static toEntity(dto: ItemRangeDto | null | undefined): ItemRange | null {
    return dto ? { min: dto.min, max: dto.max } : null;
  }
}

/** Spec 042, decision 2. */
export class ItemPoisonDto {
  @ApiProperty({ type: String, enum: POISON_CATEGORIES, example: 'circulatory' })
  @IsIn(POISON_CATEGORIES)
  category: PoisonCategory;

  @ApiProperty({ description: 'Attack level of the resistance roll', example: 5 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiProperty({ type: String, enum: POISON_FORMS, example: 'paste' })
  @IsIn(POISON_FORMS)
  form: PoisonForm;

  @ApiProperty({ type: String, enum: POISON_SEVERITIES, required: false, description: 'Worst severity it can reach' })
  @IsOptional()
  @IsIn(POISON_SEVERITIES)
  maxSeverity: PoisonSeverity | null;

  @ApiProperty({ type: ItemRangeDto, required: false, description: 'Hits dealt at once when the RR fails' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemRangeDto)
  immediateHits: ItemRangeDto | null;

  @ApiProperty({ type: ItemRangeDto, required: false, description: 'Rounds until its first effects' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemRangeDto)
  onsetRounds: ItemRangeDto | null;

  static toEntity(dto: ItemPoisonDto): ItemPoison {
    return {
      category: dto.category,
      level: dto.level,
      form: dto.form,
      maxSeverity: dto.maxSeverity ?? null,
      immediateHits: ItemRangeDto.toEntity(dto.immediateHits),
      onsetRounds: ItemRangeDto.toEntity(dto.onsetRounds),
    };
  }
}

export class ItemAntidoteDto {
  @ApiProperty({ type: [String], enum: [...POISON_CATEGORIES, 'any'], example: ['nerve'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsIn([...POISON_CATEGORIES, 'any'], { each: true })
  categories: (PoisonCategory | 'any')[];

  @ApiProperty({ description: 'Highest poison level it stops', example: 4 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiProperty({ type: Number, required: false, description: 'Hours after the exposure it still works' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  withinHours: number | null;

  static toEntity(dto: ItemAntidoteDto): ItemAntidote {
    return { categories: [...new Set(dto.categories)], level: dto.level, withinHours: dto.withinHours ?? null };
  }
}

const KEBAB_KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class ItemDecimalRangeDto {
  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty({ example: 7.5 })
  @IsNumber()
  @Min(0)
  max: number;

  static toEntity(dto: ItemDecimalRangeDto | null | undefined): ItemDecimalRange | null {
    return dto ? { min: dto.min, max: dto.max } : null;
  }
}

/** Only what a rule reads; the rest of the effect is in the description (spec 062). */
export class HerbEffectsDto {
  @ApiProperty({ type: ItemRangeDto, required: false, description: 'Hits restored (dice range)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemRangeDto)
  heal: ItemRangeDto | null;

  @ApiProperty({ type: Number, required: false, description: 'Rounds of stun removed (999 = all)', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stunRelief: number | null;

  @ApiProperty({ type: [String], enum: HERB_INJURY_KINDS, required: false, description: 'Injury types it treats', example: ['bone'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsIn(HERB_INJURY_KINDS, { each: true })
  treats: HerbInjuryKind[] | null;

  @ApiProperty({ type: Number, required: false, description: 'Extra bonus to the recovery-time roll', example: 10 })
  @IsOptional()
  @IsInt()
  recoveryBonus: number | null;

  static toEntity(dto: HerbEffectsDto | null | undefined): HerbEffects | null {
    if (!dto) return null;
    return {
      heal: ItemRangeDto.toEntity(dto.heal),
      stunRelief: dto.stunRelief ?? null,
      treats: dto.treats ? [...new Set(dto.treats)] : null,
      recoveryBonus: dto.recoveryBonus ?? null,
    };
  }
}

/** A herb (spec 062). An antidote herb also has the antidote block. */
export class ItemHerbDto {
  @ApiProperty({ type: String, enum: HERB_GROUPS, example: 'general' })
  @IsIn(HERB_GROUPS)
  group: HerbGroup;

  @ApiProperty({ type: [String], enum: BIOMES, description: 'Biome codes (Table 2-3b)', example: ['F', 'D'] })
  @IsArray()
  @ArrayMaxSize(BIOMES.length)
  @IsIn(BIOMES, { each: true })
  biomes: Biome[];

  @ApiProperty({ description: 'It also grows at high altitude ("/A")', example: false })
  @IsBoolean()
  highAltitude: boolean;

  @ApiProperty({ type: String, enum: DIFFICULTY_CODES, description: 'Difficulty to find it', example: 'h' })
  @IsIn(DIFFICULTY_CODES)
  find: DifficultyCode;

  @ApiProperty({ description: 'Kebab key of the part of the plant', example: 'leaf' })
  @IsString()
  @MaxLength(50)
  @Matches(KEBAB_KEY)
  form: string;

  @ApiProperty({ type: String, enum: HERB_PREPS, example: 'brew' })
  @IsIn(HERB_PREPS)
  prep: HerbPrep;

  @ApiProperty({ type: String, required: false, description: 'Season as printed', example: 'Spring' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  season: string | null;

  @ApiProperty({ type: String, enum: HERB_EFFECT_DELAYS, example: 'immediate' })
  @IsIn(HERB_EFFECT_DELAYS)
  effectDelay: HerbEffectDelay;

  @ApiProperty({ description: 'False for the mundane herbs', example: true })
  @IsBoolean()
  magical: boolean;

  @ApiProperty({ type: Number, required: false, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  addictionFactor: number | null;

  @ApiProperty({ type: HerbEffectsDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HerbEffectsDto)
  effects: HerbEffectsDto | null;

  static toEntity(dto: ItemHerbDto): ItemHerb {
    return {
      group: dto.group,
      biomes: [...new Set(dto.biomes)],
      highAltitude: dto.highAltitude,
      find: dto.find,
      form: dto.form,
      prep: dto.prep,
      season: dto.season ?? null,
      effectDelay: dto.effectDelay,
      magical: dto.magical,
      addictionFactor: dto.addictionFactor ?? null,
      effects: HerbEffectsDto.toEntity(dto.effects),
    };
  }
}

export class AcidSplashDto {
  @ApiProperty({ type: String, enum: CRITICAL_SEVERITIES, description: 'Acid critical severity', example: 'A' })
  @IsIn(CRITICAL_SEVERITIES)
  severity: CriticalSeverity;

  @ApiProperty({ description: 'Modifier of the critical roll', example: -50 })
  @IsInt()
  modifier: number;
}

export class AcidImmersionDto {
  @ApiProperty({ description: 'Acid critical severity', example: 'B' })
  @IsString()
  @MaxLength(5)
  severity: string;

  @ApiProperty({ description: 'Criticals each time', example: 2 })
  @IsInt()
  @Min(1)
  count: number;

  @ApiProperty({ description: 'Rounds between criticals', example: 1 })
  @IsInt()
  @Min(1)
  everyRounds: number;
}

export class AcidIngestionDto {
  @ApiProperty({ description: 'Attack level of the resistance roll', example: 5 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiProperty({ description: 'Penalty per step of failure', example: -1 })
  @IsInt()
  penalty: number;

  @ApiProperty({ description: 'Points of failure per penalty step', example: 3 })
  @IsInt()
  @Min(1)
  perFailure: number;
}

/** An acid (spec 062); holy water only harms undead and demons. */
export class ItemAcidDto {
  @ApiProperty({ type: String, enum: ACID_STRENGTHS, example: 'mild' })
  @IsIn(ACID_STRENGTHS)
  strength: AcidStrength;

  @ApiProperty({ type: AcidSplashDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AcidSplashDto)
  splash: AcidSplashDto | null;

  @ApiProperty({ type: AcidImmersionDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AcidImmersionDto)
  immersion: AcidImmersionDto | null;

  @ApiProperty({ type: AcidIngestionDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AcidIngestionDto)
  ingestion: AcidIngestionDto | null;

  @ApiProperty({ description: 'Breakage modifier', example: 10 })
  @IsInt()
  breakageMod: number;

  @ApiProperty({ type: String, enum: DIFFICULTY_CODES, example: 'm' })
  @IsIn(DIFFICULTY_CODES)
  craftDifficulty: DifficultyCode;

  @ApiProperty({ type: String, enum: ACID_TARGETS, example: 'any' })
  @IsIn(ACID_TARGETS)
  targets: AcidTarget;

  static toEntity(dto: ItemAcidDto): ItemAcid {
    return {
      strength: dto.strength,
      splash: dto.splash ? { severity: dto.splash.severity, modifier: dto.splash.modifier } : null,
      immersion: dto.immersion
        ? { severity: dto.immersion.severity, count: dto.immersion.count, everyRounds: dto.immersion.everyRounds }
        : null,
      ingestion: dto.ingestion
        ? { level: dto.ingestion.level, penalty: dto.ingestion.penalty, perFailure: dto.ingestion.perFailure }
        : null,
      breakageMod: dto.breakageMod,
      craftDifficulty: dto.craftDifficulty,
      targets: dto.targets,
    };
  }
}

export class ItemIntoxicantDto {
  @ApiProperty({ type: Number, required: false, example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  addictionFactor: number | null;

  @ApiProperty({ type: String, required: false, description: 'Kebab key of its form', example: 'leaf' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(KEBAB_KEY)
  form: string | null;

  @ApiProperty({ type: String, enum: HERB_PREPS, required: false, example: 'ingest' })
  @IsOptional()
  @IsIn(HERB_PREPS)
  prep: HerbPrep | null;

  static toEntity(dto: ItemIntoxicantDto): ItemIntoxicant {
    return { addictionFactor: dto.addictionFactor ?? null, form: dto.form ?? null, prep: dto.prep ?? null };
  }
}

/** Magic affinity of a gem (Table 2-4f). */
export class GemMagicDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  spells: string | null;

  @ApiProperty({ type: [String], description: 'Stat keys', example: ['in'] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  stats: string[];

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  skills: string | null;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  other: string | null;
}

/** A gem (spec 062): its value is per carat, so info.cost is null. */
export class ItemGemDto {
  @ApiProperty({ type: String, enum: GEM_GRADES, example: 'precious' })
  @IsIn(GEM_GRADES)
  grade: GemGrade;

  @ApiProperty({ description: 'Kebab key of the mineral, shared by its varieties', example: 'beryl' })
  @IsString()
  @MaxLength(50)
  @Matches(KEBAB_KEY)
  mineral: string;

  @ApiProperty({ description: 'Gold per carat', example: 12.5 })
  @IsNumber()
  @Min(0)
  valuePerCarat: number;

  @ApiProperty({ type: ItemDecimalRangeDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemDecimalRangeDto)
  hardness: ItemDecimalRangeDto | null;

  @ApiProperty({ type: ItemDecimalRangeDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemDecimalRangeDto)
  specificGravity: ItemDecimalRangeDto | null;

  @ApiProperty({ type: String, required: false, description: 'Luster code as printed', example: 'V' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  luster: string | null;

  @ApiProperty({ type: Number, required: false, description: 'Carats of a 1 cm sphere', example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  caratsPerCm: number | null;

  @ApiProperty({ type: GemMagicDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GemMagicDto)
  magic: GemMagicDto | null;

  static toEntity(dto: ItemGemDto): ItemGem {
    return {
      grade: dto.grade,
      mineral: dto.mineral,
      valuePerCarat: dto.valuePerCarat,
      hardness: ItemDecimalRangeDto.toEntity(dto.hardness),
      specificGravity: ItemDecimalRangeDto.toEntity(dto.specificGravity),
      luster: dto.luster ?? null,
      caratsPerCm: dto.caratsPerCm ?? null,
      magic: dto.magic
        ? {
            spells: dto.magic.spells ?? null,
            stats: [...dto.magic.stats],
            skills: dto.magic.skills ?? null,
            other: dto.magic.other ?? null,
          }
        : null,
    };
  }
}

export class JewelryValueDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  min: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  max: number;

  @ApiProperty({ type: String, required: false, example: '1d100' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dice: string | null;

  @ApiProperty({ description: 'Open-ended upwards ("1-100+")', example: true })
  @IsBoolean()
  openEnded: boolean;
}

/** A jewelry type (spec 062): the base value range before the class factor. */
export class ItemJewelryDto {
  @ApiProperty({ type: JewelryValueDto })
  @IsObject()
  @ValidateNested()
  @Type(() => JewelryValueDto)
  value: JewelryValueDto;

  @ApiProperty({ type: String, required: false, description: 'Kebab key: finger, ear, neck...', example: 'finger' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(KEBAB_KEY)
  slot: string | null;

  static toEntity(dto: ItemJewelryDto): ItemJewelry {
    return {
      value: { min: dto.value.min, max: dto.value.max, dice: dto.value.dice ?? null, openEnded: dto.value.openEnded },
      slot: dto.slot ?? null,
    };
  }
}

/** An animal for sale (spec 062). */
export class ItemAnimalDto {
  @ApiProperty({ type: String, required: false, description: 'The creature of the npcs API, when there is one' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  npcId: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  trained: boolean;

  @ApiProperty({ type: String, enum: ANIMAL_STAGES, example: 'adult' })
  @IsIn(ANIMAL_STAGES)
  stage: AnimalStage;

  @ApiProperty({ example: true })
  @IsBoolean()
  domesticated: boolean;

  static toEntity(dto: ItemAnimalDto): ItemAnimal {
    return { npcId: dto.npcId ?? null, trained: dto.trained, stage: dto.stage, domesticated: dto.domesticated };
  }
}

/** A property (spec 062): rent in gold per year. */
export class ItemPropertyDto {
  @ApiProperty({ type: Number, required: false, description: 'Gold per year', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rent: number | null;

  @ApiProperty({ type: String, required: false, example: '20x30 ft' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  size: string | null;

  @ApiProperty({ type: String, required: false, example: '2 floors' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  height: string | null;

  static toEntity(dto: ItemPropertyDto): ItemProperty {
    return { rent: dto.rent ?? null, size: dto.size ?? null, height: dto.height ?? null };
  }
}

/** The general equipment blocks (workspace spec 041, decision 4): each one optional. */
export class ItemFeaturesDto {
  @ApiProperty({ type: ItemContainerDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemContainerDto)
  container?: ItemContainerDto | null;

  @ApiProperty({ type: ItemLightDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemLightDto)
  light?: ItemLightDto | null;

  @ApiProperty({ type: ItemTransportDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemTransportDto)
  transport?: ItemTransportDto | null;

  @ApiProperty({ type: ItemAmmunitionDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemAmmunitionDto)
  ammunition?: ItemAmmunitionDto | null;

  @ApiProperty({ type: ItemPoisonDto, required: false, description: 'Poison data (spec 042)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemPoisonDto)
  poison?: ItemPoisonDto | null;

  @ApiProperty({ type: ItemAntidoteDto, required: false, description: 'Antidote data (spec 042)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemAntidoteDto)
  antidote?: ItemAntidoteDto | null;

  @ApiProperty({ type: ItemHerbDto, required: false, description: 'Herb data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemHerbDto)
  herb?: ItemHerbDto | null;

  @ApiProperty({ type: ItemAcidDto, required: false, description: 'Acid data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemAcidDto)
  acid?: ItemAcidDto | null;

  @ApiProperty({ type: ItemIntoxicantDto, required: false, description: 'Intoxicant data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemIntoxicantDto)
  intoxicant?: ItemIntoxicantDto | null;

  @ApiProperty({ type: ItemGemDto, required: false, description: 'Gem data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemGemDto)
  gem?: ItemGemDto | null;

  @ApiProperty({ type: ItemJewelryDto, required: false, description: 'Jewelry data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemJewelryDto)
  jewelry?: ItemJewelryDto | null;

  @ApiProperty({ type: ItemAnimalDto, required: false, description: 'Animal data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemAnimalDto)
  animal?: ItemAnimalDto | null;

  @ApiProperty({ type: ItemPropertyDto, required: false, description: 'Property data (spec 062)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemPropertyDto)
  property?: ItemPropertyDto | null;

  /** Only the blocks it has; null when it has none. */
  static toEntity(dto: ItemFeaturesDto): ItemFeatures | null {
    const features: ItemFeatures = {};
    if (dto.container) features.container = ItemContainerDto.toEntity(dto.container);
    if (dto.light) features.light = ItemLightDto.toEntity(dto.light);
    if (dto.transport) features.transport = ItemTransportDto.toEntity(dto.transport);
    if (dto.ammunition) features.ammunition = ItemAmmunitionDto.toEntity(dto.ammunition);
    if (dto.poison) features.poison = ItemPoisonDto.toEntity(dto.poison);
    if (dto.antidote) features.antidote = ItemAntidoteDto.toEntity(dto.antidote);
    if (dto.herb) features.herb = ItemHerbDto.toEntity(dto.herb);
    if (dto.acid) features.acid = ItemAcidDto.toEntity(dto.acid);
    if (dto.intoxicant) features.intoxicant = ItemIntoxicantDto.toEntity(dto.intoxicant);
    if (dto.gem) features.gem = ItemGemDto.toEntity(dto.gem);
    if (dto.jewelry) features.jewelry = ItemJewelryDto.toEntity(dto.jewelry);
    if (dto.animal) features.animal = ItemAnimalDto.toEntity(dto.animal);
    if (dto.property) features.property = ItemPropertyDto.toEntity(dto.property);
    return Object.keys(features).length > 0 ? features : null;
  }

  static fromEntity(entity: ItemFeatures | null | undefined): ItemFeaturesDto | null {
    if (!entity) return null;
    const dto = new ItemFeaturesDto();
    if (entity.container) dto.container = { ...entity.container };
    if (entity.light) dto.light = { ...entity.light };
    if (entity.transport) dto.transport = { ...entity.transport };
    if (entity.ammunition) dto.ammunition = { ...entity.ammunition, launchers: [...entity.ammunition.launchers] };
    if (entity.poison) dto.poison = Object.assign(new ItemPoisonDto(), entity.poison);
    if (entity.antidote) dto.antidote = { ...entity.antidote, categories: [...entity.antidote.categories] };
    if (entity.herb) dto.herb = structuredClone(entity.herb);
    if (entity.acid) dto.acid = structuredClone(entity.acid);
    if (entity.intoxicant) dto.intoxicant = structuredClone(entity.intoxicant);
    if (entity.gem) dto.gem = structuredClone(entity.gem);
    if (entity.jewelry) dto.jewelry = structuredClone(entity.jewelry);
    if (entity.animal) dto.animal = structuredClone(entity.animal);
    if (entity.property) dto.property = structuredClone(entity.property);
    return Object.keys(dto).length > 0 ? dto : null;
  }
}
