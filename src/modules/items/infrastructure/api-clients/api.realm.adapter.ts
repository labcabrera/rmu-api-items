import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient, isUpstreamHttpError } from '../../../shared/infrastructure/http/http-client.js';
import { BadGatewayError } from '../../../shared/domain/errors/errors.js';
import { TokenService } from '../../../shared/infrastructure/security/token.service.js';
import { Realm, type RealmLevel, type RealmPort } from '../../application/ports/realm.port.js';

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
    // Encoded: the id never changes the path of core, which is called with the service token (F-items-17).
    const uri = `${this.configService.get<string>('RMU_API_CORE_URI')}/realms/${encodeURIComponent(realmId)}`;
    try {
      return await this.httpClient.get<Realm>(uri, { token });
    } catch (err) {
      if (isUpstreamHttpError(err) && err.status === 404) return null;
      throw err;
    }
  }

  /**
   * Spec 073: `GET /realms/access?userId=` of core, with the service token. Every error is the HttpClient's (502 or
   * 504): access is never granted because core failed.
   */
  async fetchUserRealms(userId: string): Promise<RealmLevel[]> {
    const token = await this.tokenService.getToken();
    const uri = `${this.configService.get<string>('RMU_API_CORE_URI')}/realms/access?userId=${encodeURIComponent(userId)}`;
    const levels = await this.httpClient.get<RealmLevel[]>(uri, { token });
    if (!Array.isArray(levels)) throw new BadGatewayError('Core answered the realm access of a user without a list');
    return levels;
  }
}
