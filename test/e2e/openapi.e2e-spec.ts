import type { OpenAPIObject } from '@nestjs/swagger';
import { buildOpenApiDocument } from '../../src/bootstrap/openapi.js';
import { startApp, type E2eApp } from './support/app.js';

type Operation = { security?: unknown[]; responses: Record<string, { description?: string; content?: unknown }> };
type Schema = { properties?: Record<string, { type?: string; items?: { type?: string; $ref?: string }; description?: string }> };

let e2e: E2eApp;
let document: OpenAPIObject;

beforeAll(async () => {
  e2e = await startApp();
  document = buildOpenApiDocument(e2e.app);
});

afterAll(async () => {
  await e2e?.stop();
});

const operation = (path: string, method: string) => (document.paths[path] as Record<string, Operation>)[method];
const schema = (name: string) => document.components!.schemas![name] as Schema;

describe('OpenAPI', () => {
  it('documents the public paths without security [F-items-02]', () => {
    expect(operation('/v1/health', 'get').security).toBeUndefined();
    expect(operation('/v1/item-modifiers/options', 'get').security).toBeUndefined();
    expect(operation('/v1/items', 'get').security).toEqual([{ oauth2: [], 'access-token': [] }]);
  });

  it('documents the content of a page as an array of items [F-items-15]', () => {
    expect(schema('ItemPageDto').properties!.content).toMatchObject({ type: 'array', items: { $ref: '#/components/schemas/ItemDto' } });
  });

  it('documents 201 for the creations [F-items-18]', () => {
    expect(Object.keys(operation('/v1/items', 'post').responses)).toContain('201');
    expect(Object.keys(operation('/v1/items', 'post').responses)).not.toContain('200');
    expect(Object.keys(operation('/v1/items/{id}/modifiers', 'post').responses)).toContain('201');
    expect(Object.keys(operation('/v1/items/{id}/modifiers', 'post').responses)).not.toContain('200');
  });

  it('describes the shield and the info of the PATCH [F-items-18]', () => {
    const properties = schema('UpdateItemDto').properties!;
    expect(properties.shield.description).not.toBe('Item armor');
    expect(properties.info.description).not.toBe('Item armor');
  });

  it('uses examples of items in the error format [F-receta-22]', () => {
    expect(JSON.stringify(schema('ErrorDto'))).not.toMatch(/race/i);
  });
});
