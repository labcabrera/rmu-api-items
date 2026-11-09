/** Families of the superior materials (Treasure Law 3.2): metals, wood, bow wood, stone, cloth, leather and others. */
export const MATERIAL_GROUPS = ['metal', 'wood', 'bow-wood', 'stone', 'cloth', 'leather', 'other'] as const;
export type MaterialGroup = (typeof MATERIAL_GROUPS)[number];

/** Kinds of item a material can be used for (workspace spec 043, decision 4). */
export const MATERIAL_USES = ['weapon', 'ammunition', 'launcher', 'armor', 'shield'] as const;
export type MaterialUse = (typeof MATERIAL_USES)[number];

/** Cost of the material, in gold: an addition to the base item price, or a multiplier of it (soft woods, stone). */
export interface MaterialCost {
  add: number | null;
  multiplier: number | null;
}

/**
 * A superior material (workspace spec 043, decision 1). The values come from the rulebook and are imported from the
 * gitignored data directory (data/treasure-law/materials.json), never written in code.
 */
export interface Material {
  id: string;
  group: MaterialGroup;
  /** Modifier to the item strength in breakage checks */
  durability: number;
  /** Modifier to the crafting maneuver, and the same percent less production time; null is special */
  workability: number | null;
  /** OB, DB, Shield or range increment bonus of the item */
  bonus: number;
  /** Bonus of a blunt weapon, when it differs */
  bluntBonus: number | null;
  /** Bonus when it replaces metal (wood, stone), when it differs */
  metalBonus: number | null;
  cost: MaterialCost;
  /** Gold per pound, for uses where the quantity matters more than the production */
  costPerPound: number | null;
  /** Pounds per cubic foot */
  density: number | null;
  magical: boolean;
  alloy: boolean;
  /** Difficulty of the maneuver that makes the alloy (information) */
  alloyDifficulty: string | null;
  /** Weight of an armor of this material, as a fraction of the normal one (Elven steel, dragon scale) */
  armorWeightMultiplier: number | null;
  uses: MaterialUse[];
}
