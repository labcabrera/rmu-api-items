import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient, isUpstreamHttpError } from '../../../shared/infrastructure/http/http-client.js';
import { TokenService } from '../../../shared/infrastructure/security/token.service.js';
import { Realm, type RealmPort } from '../../application/ports/realm.port.js';

@Injectable()
export class ApiRealmAdapter implements RealmPort {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClient,
  ) {}

  /**
   * The realm from core, or null if core answers 404. Any other failure is the HttpClient's error (spec 021): core down
   * or a 5xx/401/403 on the service token → 502, no answer in time → 504 (F-items-05).
   */
  async fetchRealmById(realmId: string): Promise<Realm | null> {
    const token = await this.tokenService.getToken();
    const uri = `${this.configService.get<string>('RMU_API_CORE_URI')}/realms/${realmId}`;
    try {
      return await this.httpClient.get<Realm>(uri, { token });
    } catch (err) {
      if (isUpstreamHttpError(err) && err.status === 404) return null;
      throw err;
    }
  }
}
