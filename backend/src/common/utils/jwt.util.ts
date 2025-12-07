import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export async function generateTokens(
  jwtService: JwtService,
  payload: TokenPayload,
  jwtSecret: string,
  jwtExpiresIn: string,
  refreshSecret: string,
  refreshExpiresIn: string,
): Promise<Tokens> {
  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(payload as any, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn as any,
    }),
    jwtService.signAsync(payload as any, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}
