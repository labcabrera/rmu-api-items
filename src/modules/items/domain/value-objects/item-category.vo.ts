/** Spec 042 adds poison and herb (antidotes). Spec 041 adds the general equipment categories: container, light, mount, vehicle, service and instrument. */
export const ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'shield',
  'clothes',
  'coins',
  'tools',
  'food',
  'ammunition',
  'container',
  'light',
  'mount',
  'vehicle',
  'service',
  'instrument',
  'poison',
  'herb',
  'other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];
