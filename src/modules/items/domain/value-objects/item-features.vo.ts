import type { DifficultyCode } from './difficulty-code.vo.js';
import type { MagicItemFeature } from './item-magic.vo.js';

/**
 * What an item of the general equipment does besides being carried (workspace spec 041, decision 4): optional blocks
 * that any category but weapon, armor and shield may have. They are information; no rule reads them yet.
 */

/** What a container holds: pounds, cubic feet, gallons or units (e.g. 20 arrows). */
export interface ItemContainer {
  weight: number | null;
  volume: number | null;
  liquid: number | null;
  units: number | null;
}

/** A light source: radius lit in feet and hours of each load (candle, oil, torch). */
export interface ItemLight {
  radius: number | null;
  durationHours: number | null;
}

/** A mount or a vehicle: pounds it carries and feet per round. */
export interface ItemTransport {
  capacity: number | null;
  speed: number | null;
}

/** Ammunition: the item types that shoot it and its attack size adjustment. */
export interface ItemAmmunition {
  launchers: string[];
  sizeAdjustment: number;
}

/** Poison categories of Core Law §15.6 plus the irritants of Treasure Law, which have no general effects (spec 042). */
export const POISON_CATEGORIES = [
  'circulatory',
  'conversion',
  'muscle',
  'nerve',
  'paralytic',
  'reduction',
  'respiratory',
  'irritant',
] as const;
export type PoisonCategory = (typeof POISON_CATEGORIES)[number];

export const POISON_SEVERITIES = ['mild', 'moderate', 'severe', 'extreme'] as const;
export type PoisonSeverity = (typeof POISON_SEVERITIES)[number];

/** How a poison is delivered: liquids and pastes can coat a weapon (Treasure Law 2.3, "Prep"). */
export const POISON_FORMS = ['liquid', 'paste', 'powder', 'ingest', 'gas'] as const;
export type PoisonForm = (typeof POISON_FORMS)[number];

/** Inclusive range rolled when used (hits, rounds). */
export interface ItemRange {
  min: number;
  max: number;
}

/**
 * A poison (spec 042, decision 2): its category gives the general effects (core poison tables), the level is the
 * attack level of the resistance roll. Its own effects beyond these fields are in the description.
 */
export interface ItemPoison {
  category: PoisonCategory;
  level: number;
  form: PoisonForm;
  /** Worst severity it can reach, whatever the RR failure; null is extreme */
  maxSeverity: PoisonSeverity | null;
  /** Hits dealt at once when the RR fails */
  immediateHits: ItemRange | null;
  /** Rounds until its first effects, instead of the onset of the table */
  onsetRounds: ItemRange | null;
}

/** An antidote (spec 042, decision 10): it stops poisonings of these categories up to its level. */
export interface ItemAntidote {
  categories: (PoisonCategory | 'any')[];
  level: number;
  /** Hours after the exposure it still works; null is any time */
  withinHours: number | null;
}

/** Biome codes of Treasure Law Table 2-3b, the same as Core Law 15-1 (spec 062). */
export const BIOMES = ['A', 'O', 'U', 'I', 'T', 'B', 'X', 'P', 'F', 'D', 'S', 'J'] as const;
export type Biome = (typeof BIOMES)[number];

export const HERB_GROUPS = ['antidote', 'general', 'injury', 'life', 'minor-healing', 'alteration', 'stun'] as const;
export type HerbGroup = (typeof HERB_GROUPS)[number];

/** How a herb or an intoxicant is taken (Treasure Law, "Prep"). */
export const HERB_PREPS = ['apply', 'brew', 'ingest', 'liquid', 'paste', 'powder'] as const;
export type HerbPrep = (typeof HERB_PREPS)[number];

export const HERB_EFFECT_DELAYS = ['immediate', 'rounds', 'minutes'] as const;
export type HerbEffectDelay = (typeof HERB_EFFECT_DELAYS)[number];

/** Kebab key of the part of the plant: leaf, root, berry, moss... (the front shows herb-form-<key>). */
export type HerbForm = string;

/** Injury types of the strategic health model (rmu-api-strategic injury.vo.ts), or any. */
export const HERB_INJURY_KINDS = ['bone', 'cut-burn', 'muscle-tendon', 'organ', 'poison-disease', 'skin-tissue', 'unknown', 'any'] as const;
export type HerbInjuryKind = (typeof HERB_INJURY_KINDS)[number];

/** Only what a rule reads; the rest of the effect is in the description. */
export interface HerbEffects {
  /** Hits restored (dice range) */
  heal: ItemRange | null;
  /** Rounds of stun removed (999 = all) */
  stunRelief: number | null;
  treats: HerbInjuryKind[] | null;
  /** Extra bonus to the recovery-time roll, when stated */
  recoveryBonus: number | null;
}

/** A herb (spec 062). An antidote herb also has the antidote block. */
export interface ItemHerb {
  group: HerbGroup;
  biomes: Biome[];
  /** "/A": it also grows at high altitude */
  highAltitude: boolean;
  find: DifficultyCode;
  form: HerbForm;
  prep: HerbPrep;
  /** Short text as printed */
  season: string | null;
  effectDelay: HerbEffectDelay;
  /** False for the mundane herbs */
  magical: boolean;
  addictionFactor: number | null;
  effects: HerbEffects | null;
}

export const ACID_STRENGTHS = ['extremely-weak', 'very-weak', 'weak', 'mild', 'strong', 'very-strong', 'extremely-strong'] as const;
export type AcidStrength = (typeof ACID_STRENGTHS)[number];

export const CRITICAL_SEVERITIES = ['A', 'B', 'C', 'D', 'E'] as const;
export type CriticalSeverity = (typeof CRITICAL_SEVERITIES)[number];

/** Holy water is an acid that only harms undead and demons. */
export const ACID_TARGETS = ['any', 'undead-demon', 'undead', 'demon'] as const;
export type AcidTarget = (typeof ACID_TARGETS)[number];

/** An acid (spec 062). Splash "A-50" is {A, -50}; immersion "2B/rnd" is {B, 2, 1}; ingestion "-1/3 failure" is {penalty -1, perFailure 3}. */
export interface ItemAcid {
  strength: AcidStrength;
  splash: { severity: CriticalSeverity; modifier: number } | null;
  immersion: { severity: string; count: number; everyRounds: number } | null;
  ingestion: { level: number; penalty: number; perFailure: number } | null;
  breakageMod: number;
  craftDifficulty: DifficultyCode;
  targets: AcidTarget;
}

export interface ItemIntoxicant {
  addictionFactor: number | null;
  form: HerbForm | null;
  prep: HerbPrep | null;
}

export const GEM_GRADES = ['precious', 'semi-precious'] as const;
export type GemGrade = (typeof GEM_GRADES)[number];

/** Inclusive decimal range (hardness, specific gravity). */
export interface ItemDecimalRange {
  min: number;
  max: number;
}

/** Magic affinity of a gem (Table 2-4f). */
export interface GemMagic {
  spells: string | null;
  stats: string[];
  skills: string | null;
  other: string | null;
}

/** A gem (spec 062): its value is per carat, so info.cost is null. */
export interface ItemGem {
  grade: GemGrade;
  /** Kebab key of the mineral, shared by its varieties */
  mineral: string;
  /** Gold per carat */
  valuePerCarat: number;
  hardness: ItemDecimalRange | null;
  specificGravity: ItemDecimalRange | null;
  /** Code as printed (V, A, R...); the front shows gem-luster-<code> */
  luster: string | null;
  /** Carats of a 1 cm sphere */
  caratsPerCm: number | null;
  magic: GemMagic | null;
}

/** A jewelry type (spec 062): the base value range before the class factor ("1-100+"). */
export interface ItemJewelry {
  value: { min: number; max: number; dice: string | null; openEnded: boolean };
  /** Kebab key: finger, ear, neck, head, wrist, ankle... */
  slot: string | null;
}

export const ANIMAL_STAGES = ['adult', 'young', 'egg'] as const;
export type AnimalStage = (typeof ANIMAL_STAGES)[number];

/** An animal for sale (spec 062): npcId is the Creature Law creature, when there is one. */
export interface ItemAnimal {
  npcId: string | null;
  trained: boolean;
  stage: AnimalStage;
  domesticated: boolean;
}

/** A property (spec 062): rent in gold per year. */
export interface ItemProperty {
  rent: number | null;
  size: string | null;
  height: string | null;
}

export interface ItemFeatures {
  container?: ItemContainer | null;
  light?: ItemLight | null;
  transport?: ItemTransport | null;
  ammunition?: ItemAmmunition | null;
  poison?: ItemPoison | null;
  antidote?: ItemAntidote | null;
  herb?: ItemHerb | null;
  acid?: ItemAcid | null;
  intoxicant?: ItemIntoxicant | null;
  gem?: ItemGem | null;
  jewelry?: ItemJewelry | null;
  animal?: ItemAnimal | null;
  property?: ItemProperty | null;
  /** Spec 067: allowed in every category, weapon, armor and shield included */
  magic?: MagicItemFeature | null;
}

export const ARMOR_CLASSES = ['light', 'medium', 'heavy'] as const;

/** Class of a helmet, vambraces or greaves (Core Law, piecemeal armor). */
export type ArmorClass = (typeof ARMOR_CLASSES)[number];
