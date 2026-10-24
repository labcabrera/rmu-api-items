import { Module } from '@nestjs/common';
import { HttpClient } from '../http/http-client.js';
import { JwtStrategy } from './jwt.strategy.js';
import { TokenService } from './token.service.js';

@Module({
  providers: [JwtStrategy, TokenService, HttpClient],
  exports: [TokenService, HttpClient],
})
export class AuthModule {}
