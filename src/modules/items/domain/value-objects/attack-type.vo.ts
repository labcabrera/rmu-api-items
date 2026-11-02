export const ATTACK_TYPES = ['melee', 'ranged', 'thrown'] as const;

export type AttackType = (typeof ATTACK_TYPES)[number];
