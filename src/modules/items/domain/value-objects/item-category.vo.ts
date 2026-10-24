export const ITEM_CATEGORIES = ['weapon', 'armor', 'shield', 'clothes', 'coins', 'tools', 'food', 'ammunition', 'other'] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
