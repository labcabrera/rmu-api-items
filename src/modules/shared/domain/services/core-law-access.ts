import { ForbiddenError } from '../errors/errors.js';
import { RMU_ADMIN, RMU_CORE_LAW } from '../entities/user-roles.js';

/** Rulebook content: only users with Core Law access (or administrators, like the service account) can read it. */
export const checkCoreLawAccess = (roles: string[]): void => {
  if (roles.includes(RMU_ADMIN) || roles.includes(RMU_CORE_LAW)) return;
  throw new ForbiddenError('Core Law content requires the rmu-core-law group');
};
