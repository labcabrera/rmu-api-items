import type { CommandBus } from '@nestjs/cqrs';
import type { KafkaContext } from '@nestjs/microservices';
import { DeleteItemsByRealmCommand } from '../../../src/modules/items/application/cqrs/commands/delete-items-by-realm.command.js';
import {
  KafkaRealmEventConsumer,
  REALM_DELETED_TOPIC,
} from '../../../src/modules/items/interfaces/messaging/kafka.realm-event-consumer.js';

const context = { getTopic: () => REALM_DELETED_TOPIC } as unknown as KafkaContext;

const setup = (execute = vi.fn(() => Promise.resolve())) => {
  const consumer = new KafkaRealmEventConsumer({ execute } as unknown as CommandBus);
  const logger = (consumer as unknown as { logger: { error: (...args: unknown[]) => void; log: () => void } }).logger;
  const error = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
  vi.spyOn(logger, 'log').mockImplementation(() => undefined);
  return { consumer, execute, error };
};

describe('KafkaRealmEventConsumer', () => {
  it('runs the command that deletes the items of the realm', async () => {
    const { consumer, execute } = setup();
    await consumer.handleRealmDeleted({ data: { id: 'realm-a' } }, context);
    expect(execute).toHaveBeenCalledWith(new DeleteItemsByRealmCommand('realm-a'));
  });

  it('logs a payload without realm id and runs nothing', async () => {
    const { consumer, execute, error } = setup();
    await consumer.handleRealmDeleted({}, context);
    expect(execute).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(REALM_DELETED_TOPIC));
  });

  it('logs a failing command with the realm id and the topic, without rethrowing', async () => {
    const { consumer, error } = setup(vi.fn(() => Promise.reject(new Error('mongo down'))));
    await expect(consumer.handleRealmDeleted({ data: { id: 'realm-a' } }, context)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/realm-a.*internal\.rmu-core\.realm\.deleted\.v1.*mongo down/),
      expect.any(String),
    );
  });

  it('does not rethrow a synchronous error of the command bus', async () => {
    const { consumer, error } = setup(
      vi.fn(() => {
        throw new Error('no handler');
      }),
    );
    await expect(consumer.handleRealmDeleted({ data: { id: 'realm-a' } }, context)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledWith(expect.stringContaining('no handler'), expect.any(String));
  });
});
