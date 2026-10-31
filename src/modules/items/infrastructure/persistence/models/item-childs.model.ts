import { Prop, Schema } from '@nestjs/mongoose';
import type { ArmorSlot } from '../../../domain/value-objects/armor-slot.vo.js';
import type { DifficultyCode } from '../../../domain/value-objects/difficulty-code.vo.js';
import type {
  AcidStrength,
  AcidTarget,
  AnimalStage,
  ArmorClass,
  Biome,
  CriticalSeverity,
  GemGrade,
  HerbEffectDelay,
  HerbGroup,
  HerbInjuryKind,
  HerbPrep,
  PoisonCategory,
  PoisonForm,
  PoisonSeverity,
} from '../../../domain/value-objects/item-features.vo.js';

@Schema({ _id: false })
export class ItemWeaponRange {
  @Prop({ type: Number, required: true })
  from: number;

  @Prop({ type: Number, required: true })
  to: number;

  @Prop({ type: Number, required: true })
  bonus: number;
}

@Schema({ _id: false })
export class ItemArmor {
  @Prop({ type: String, required: true })
  slot: ArmorSlot;

  @Prop({ type: Number, required: true })
  at: number;

  @Prop({ type: Number, required: true })
  enc: number;

  @Prop({ type: Number, required: true })
  maneuverPenalty: number;

  @Prop({ type: Number, required: true })
  rangedPenalty: number;

  @Prop({ type: Number, required: true })
  perceptionPenalty: number;

  @Prop({ type: String, required: true })
  baseDifficulty: DifficultyCode;

  @Prop({ type: [String], required: false, default: undefined })
  coverage?: ArmorSlot[] | null;

  @Prop({ type: String, required: false })
  class?: ArmorClass | null;
}

@Schema({ _id: false })
export class ItemShield {
  @Prop({ type: Number, required: true })
  db: number;

  @Prop({ type: Number, required: true })
  blockCount: number;
}

@Schema({ _id: false })
export class ItemContainer {
  @Prop({ type: Number, required: false })
  weight: number | null;

  @Prop({ type: Number, required: false })
  volume: number | null;

  @Prop({ type: Number, required: false })
  liquid: number | null;

  @Prop({ type: Number, required: false })
  units: number | null;
}

@Schema({ _id: false })
export class ItemLight {
  @Prop({ type: Number, required: false })
  radius: number | null;

  @Prop({ type: Number, required: false })
  durationHours: number | null;
}

@Schema({ _id: false })
export class ItemTransport {
  @Prop({ type: Number, required: false })
  capacity: number | null;

  @Prop({ type: Number, required: false })
  speed: number | null;
}

@Schema({ _id: false })
export class ItemAmmunition {
  @Prop({ type: [String], required: true })
  launchers: string[];

  @Prop({ type: Number, required: true })
  sizeAdjustment: number;
}

@Schema({ _id: false })
export class ItemRange {
  @Prop({ type: Number, required: true })
  min: number;

  @Prop({ type: Number, required: true })
  max: number;
}

/** Spec 042, decision 2. */
@Schema({ _id: false })
export class ItemPoison {
  @Prop({ type: String, required: true })
  category: PoisonCategory;

  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: String, required: true })
  form: PoisonForm;

  @Prop({ type: String, required: false })
  maxSeverity: PoisonSeverity | null;

  @Prop({ type: ItemRange, required: false })
  immediateHits: ItemRange | null;

  @Prop({ type: ItemRange, required: false })
  onsetRounds: ItemRange | null;
}

@Schema({ _id: false })
export class ItemAntidote {
  @Prop({ type: [String], required: true })
  categories: (PoisonCategory | 'any')[];

  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: Number, required: false })
  withinHours: number | null;
}

@Schema({ _id: false })
export class ItemDecimalRange {
  @Prop({ type: Number, required: true })
  min: number;

  @Prop({ type: Number, required: true })
  max: number;
}

@Schema({ _id: false })
export class HerbEffects {
  @Prop({ type: ItemRange, required: false })
  heal: ItemRange | null;

  @Prop({ type: Number, required: false })
  stunRelief: number | null;

  @Prop({ type: [String], required: false, default: undefined })
  treats: HerbInjuryKind[] | null;

  @Prop({ type: Number, required: false })
  recoveryBonus: number | null;
}

/** Spec 062. */
@Schema({ _id: false })
export class ItemHerb {
  @Prop({ type: String, required: true })
  group: HerbGroup;

  @Prop({ type: [String], required: true })
  biomes: Biome[];

  @Prop({ type: Boolean, required: true })
  highAltitude: boolean;

  @Prop({ type: String, required: true })
  find: DifficultyCode;

  @Prop({ type: String, required: true })
  form: string;

  @Prop({ type: String, required: true })
  prep: HerbPrep;

  @Prop({ type: String, required: false })
  season: string | null;

  @Prop({ type: String, required: true })
  effectDelay: HerbEffectDelay;

  @Prop({ type: Boolean, required: true })
  magical: boolean;

  @Prop({ type: Number, required: false })
  addictionFactor: number | null;

  @Prop({ type: HerbEffects, required: false })
  effects: HerbEffects | null;
}

@Schema({ _id: false })
export class AcidSplash {
  @Prop({ type: String, required: true })
  severity: CriticalSeverity;

  @Prop({ type: Number, required: true })
  modifier: number;
}

@Schema({ _id: false })
export class AcidImmersion {
  @Prop({ type: String, required: true })
  severity: string;

  @Prop({ type: Number, required: true })
  count: number;

  @Prop({ type: Number, required: true })
  everyRounds: number;
}

@Schema({ _id: false })
export class AcidIngestion {
  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: Number, required: true })
  penalty: number;

  @Prop({ type: Number, required: true })
  perFailure: number;
}

@Schema({ _id: false })
export class ItemAcid {
  @Prop({ type: String, required: true })
  strength: AcidStrength;

  @Prop({ type: AcidSplash, required: false })
  splash: AcidSplash | null;

  @Prop({ type: AcidImmersion, required: false })
  immersion: AcidImmersion | null;

  @Prop({ type: AcidIngestion, required: false })
  ingestion: AcidIngestion | null;

  @Prop({ type: Number, required: true })
  breakageMod: number;

  @Prop({ type: String, required: true })
  craftDifficulty: DifficultyCode;

  @Prop({ type: String, required: true })
  targets: AcidTarget;
}

@Schema({ _id: false })
export class ItemIntoxicant {
  @Prop({ type: Number, required: false })
  addictionFactor: number | null;

  @Prop({ type: String, required: false })
  form: string | null;

  @Prop({ type: String, required: false })
  prep: HerbPrep | null;
}

@Schema({ _id: false })
export class GemMagic {
  @Prop({ type: String, required: false })
  spells: string | null;

  @Prop({ type: [String], required: true })
  stats: string[];

  @Prop({ type: String, required: false })
  skills: string | null;

  @Prop({ type: String, required: false })
  other: string | null;
}

@Schema({ _id: false })
export class ItemGem {
  @Prop({ type: String, required: true })
  grade: GemGrade;

  @Prop({ type: String, required: true })
  mineral: string;

  @Prop({ type: Number, required: true })
  valuePerCarat: number;

  @Prop({ type: ItemDecimalRange, required: false })
  hardness: ItemDecimalRange | null;

  @Prop({ type: ItemDecimalRange, required: false })
  specificGravity: ItemDecimalRange | null;

  @Prop({ type: String, required: false })
  luster: string | null;

  @Prop({ type: Number, required: false })
  caratsPerCm: number | null;

  @Prop({ type: GemMagic, required: false })
  magic: GemMagic | null;
}

@Schema({ _id: false })
export class JewelryValue {
  @Prop({ type: Number, required: true })
  min: number;

  @Prop({ type: Number, required: true })
  max: number;

  @Prop({ type: String, required: false })
  dice: string | null;

  @Prop({ type: Boolean, required: true })
  openEnded: boolean;
}

@Schema({ _id: false })
export class ItemJewelry {
  @Prop({ type: JewelryValue, required: true })
  value: JewelryValue;

  @Prop({ type: String, required: false })
  slot: string | null;
}

@Schema({ _id: false })
export class ItemAnimal {
  @Prop({ type: String, required: false })
  npcId: string | null;

  @Prop({ type: Boolean, required: true })
  trained: boolean;

  @Prop({ type: String, required: true })
  stage: AnimalStage;

  @Prop({ type: Boolean, required: true })
  domesticated: boolean;
}

@Schema({ _id: false })
export class ItemProperty {
  @Prop({ type: Number, required: false })
  rent: number | null;

  @Prop({ type: String, required: false })
  size: string | null;

  @Prop({ type: String, required: false })
  height: string | null;
}

/** Spec 041, decision 4; spec 042 adds poison and antidote, spec 062 the rest. */
@Schema({ _id: false })
export class ItemFeatures {
  @Prop({ type: ItemContainer, required: false })
  container?: ItemContainer | null;

  @Prop({ type: ItemLight, required: false })
  light?: ItemLight | null;

  @Prop({ type: ItemTransport, required: false })
  transport?: ItemTransport | null;

  @Prop({ type: ItemAmmunition, required: false })
  ammunition?: ItemAmmunition | null;

  @Prop({ type: ItemPoison, required: false })
  poison?: ItemPoison | null;

  @Prop({ type: ItemAntidote, required: false })
  antidote?: ItemAntidote | null;

  @Prop({ type: ItemHerb, required: false })
  herb?: ItemHerb | null;

  @Prop({ type: ItemAcid, required: false })
  acid?: ItemAcid | null;

  @Prop({ type: ItemIntoxicant, required: false })
  intoxicant?: ItemIntoxicant | null;

  @Prop({ type: ItemGem, required: false })
  gem?: ItemGem | null;

  @Prop({ type: ItemJewelry, required: false })
  jewelry?: ItemJewelry | null;

  @Prop({ type: ItemAnimal, required: false })
  animal?: ItemAnimal | null;

  @Prop({ type: ItemProperty, required: false })
  property?: ItemProperty | null;
}
