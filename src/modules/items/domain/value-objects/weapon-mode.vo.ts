export const WEAPON_MODES = ['one-hand', 'two-hands'] as const;

export type WeaponMode = (typeof WEAPON_MODES)[number];
