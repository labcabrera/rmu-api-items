export const ITEM_RARITIES = ['common', 'uncommon', 'rare', 'very-rare'] as const;

export type ItemRarity = (typeof ITEM_RARITIES)[number];
