import { ForbiddenError } from '../errors/errors.js';
import { RMU_ADMIN, RMU_TREASURE_LAW } from '../entities/user-roles.js';

/** Rulebook content: only users with Treasure Law access (or administrators, like the service account) can read it. */
export const checkTreasureLawAccess = (roles: string[]): void => {
  if (roles.includes(RMU_ADMIN) || roles.includes(RMU_TREASURE_LAW)) return;
  throw new ForbiddenError('Treasure Law content requires the rmu-treasure-law group');
};
