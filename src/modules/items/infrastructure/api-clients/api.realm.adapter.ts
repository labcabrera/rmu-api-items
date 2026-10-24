import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient, HttpClientError } from '../../../shared/infrastructure/http/http-client.js';
import { TokenService } from '../../../shared/infrastructure/security/token.service.js';
import { Realm, type RealmPort } from '../../application/ports/realm.port.js';

@Injectable()
export class ApiRealmAdapter implements RealmPort {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClient,
  ) {}

  async fetchRealmById(realmId: string): Promise<Realm | null> {
    const token = await this.tokenService.getToken();
    const uri = `${this.configService.get<string>('RMU_API_CORE_URI')}/realms/${realmId}`;
    try {
      return await this.httpClient.get<Realm>(uri, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      // Any other status reaches the client as a 500, as it did with axios (F-items-05).
      if (err instanceof HttpClientError && err.status === 404) return null;
      throw err;
    }
  }
}
