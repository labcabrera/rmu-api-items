import { DomainEvent } from '../../../../src/modules/shared/domain/events/domain-event.js';

describe('DomainEvent', () => {
  const saved = process.env.RMU_KAFKA_CLIENT_ID;
  afterEach(() => {
    if (saved === undefined) delete process.env.RMU_KAFKA_CLIENT_ID;
    else process.env.RMU_KAFKA_CLIENT_ID = saved;
  });

  it('takes the producer from RMU_KAFKA_CLIENT_ID [F-items-07]', () => {
    process.env.RMU_KAFKA_CLIENT_ID = 'rmu-api-items-test';
    expect(new DomainEvent('created', { id: 'x' })).toMatchObject({
      eventType: 'created',
      eventVersion: '1',
      producer: 'rmu-api-items-test',
    });
  });

  it('falls back to rmu-api-items', () => {
    delete process.env.RMU_KAFKA_CLIENT_ID;
    expect(new DomainEvent('created', { id: 'x' }).producer).toBe('rmu-api-items');
  });
});
