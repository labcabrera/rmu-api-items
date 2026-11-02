import type { EntitySource } from './entity-source.js';

export interface RbacEntity {
  owner: string;
  accessType: string;
  entitySource: EntitySource;
}
