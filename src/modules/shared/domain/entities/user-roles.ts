export type UserRole = 'rmu-admin' | 'rmu-user' | 'rmu-core-law' | 'rmu-treasure-law';

export const RMU_ADMIN: UserRole = 'rmu-admin';
export const RMU_USER: UserRole = 'rmu-user';
/** Keycloak group that grants access to Core Law content. */
export const RMU_CORE_LAW: UserRole = 'rmu-core-law';
/** Keycloak group that grants access to Treasure Law content. */
export const RMU_TREASURE_LAW: UserRole = 'rmu-treasure-law';
