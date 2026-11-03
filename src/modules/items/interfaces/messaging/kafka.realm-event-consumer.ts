import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Ctx, EventPattern, type KafkaContext, Payload } from '@nestjs/microservices';
import { DeleteItemsByRealmCommand } from '../../application/cqrs/commands/delete-items-by-realm.command.js';

/** The topic core publishes when a realm is deleted. */
export const REALM_DELETED_TOPIC = 'internal.rmu-core.realm.deleted.v1';

/** The part of a core realm event this consumer reads. */
export interface RealmDeletedPayload {
  data?: { id?: string };
}

@Controller()
export class KafkaRealmEventConsumer {
  private readonly logger = new Logger(KafkaRealmEventConsumer.name);

  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Deletes the items of the realm (spec 073, decision 9). An error is logged with the realm id and never rethrown: a
   * permanent error would otherwise block the partition. The command is idempotent, so it can be repeated by hand.
   */
  @EventPattern<string>(REALM_DELETED_TOPIC)
  async handleRealmDeleted(@Payload() event: RealmDeletedPayload, @Ctx() context: KafkaContext): Promise<void> {
    const topic = context.getTopic();
    const realmId = event?.data?.id;
    if (!realmId) {
      this.logger.error(`Realm id not found in the event payload on ${topic}`);
      return;
    }
    this.logger.log(`Received realm deleted event on ${topic} for realm ${realmId}`);
    try {
      await this.commandBus.execute(new DeleteItemsByRealmCommand(realmId));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error deleting the items of realm ${realmId} (${topic}): ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
