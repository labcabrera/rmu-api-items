export const ARMOR_SLOTS = ['body', 'head', 'legs', 'arms'] as const;

export type ArmorSlot = (typeof ARMOR_SLOTS)[number];
