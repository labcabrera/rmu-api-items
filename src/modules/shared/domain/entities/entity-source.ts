/** Where an entity comes from (spec 063): the rulebooks (`system`, admin only) or a user (`user`). */
export const ENTITY_SOURCES = ['system', 'user'] as const;
export type EntitySource = (typeof ENTITY_SOURCES)[number];
