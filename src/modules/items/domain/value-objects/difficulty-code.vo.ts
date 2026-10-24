export const DIFFICULTY_CODES = ['c', 's', 'r', 'e', 'l', 'm', 'h', 'vh', 'xh', 'sf', 'a', 'ni'] as const;

export type DifficultyCode = (typeof DIFFICULTY_CODES)[number];
