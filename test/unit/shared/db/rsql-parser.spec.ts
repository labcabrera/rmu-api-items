import { RsqlParser } from '../../../../src/modules/shared/infrastructure/db/rsql-parser.js';

describe('RsqlParser comparison aliases', () => {
  const parser = new RsqlParser();

  it.each([
    ['level=lt=3', { level: { $lt: 3 } }],
    ['level=le=3', { level: { $lte: 3 } }],
    ['level=gt=3', { level: { $gt: 3 } }],
    ['level=ge=3', { level: { $gte: 3 } }],
    ['level<=3', { level: { $lte: 3 } }],
  ])('converts %s', (rsql, query) => {
    expect(parser.parse(rsql)).toEqual(query);
  });
});
