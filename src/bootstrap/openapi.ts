import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';

/** The paths that answer without a token, documented without `security` (F-items-02). */
const PUBLIC_PATHS = ['/v1/health', '/v1/item-modifiers/options'];

export function configureOpenApi(app: INestApplication) {
  const document = buildOpenApiDocument(app);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      urls: [
        {
          url: '/api-spec',
          name: 'OpenAPI Specification',
        },
      ],
    },
  });
  app.use('/api-spec', (_req: Request, res: Response) => {
    res.json(document);
  });
}

/** The OpenAPI document of the API: every operation needs a token except the public paths. */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = app.get(ConfigService);
  const oidcUri = `${config.get<string>('RMU_IAM_URI')}/realms/${config.get<string>('RMU_IAM_REALM')}/protocol/openid-connect`;
  const openApiConfig = new DocumentBuilder()
    .setTitle('Items API')
    .setDescription('Rolemaster Unified Items API.')
    .setVersion('1.0')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: `${oidcUri}/auth`,
            tokenUrl: `${oidcUri}/token`,
            scopes: {
              read: 'Read',
              write: 'Write',
            },
          },
        },
      },
      'oauth2',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  // The security schemes on every operation that needs a token.
  for (const [path, methods] of Object.entries(document.paths)) {
    if (PUBLIC_PATHS.includes(path)) continue;
    for (const operation of Object.values(methods as Record<string, unknown>)) {
      if (operation && typeof operation === 'object' && 'responses' in operation) {
        (operation as { security?: Record<string, string[]>[] }).security = [{ oauth2: [], 'access-token': [] }];
      }
    }
  }
  return document;
}
