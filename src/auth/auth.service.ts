import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly tokens: Repository<RefreshToken>,
  ) {}

  async register(dto: RegisterDto, ua?: string) {
    if (await this.users.findByEmail(dto.email))
      throw new ForbiddenException('El correo ya está registrado.');
    const hash = await argon2.hash(dto.password);
    const user = await this.users.create(dto.email, hash);
    return this.issueSession(user.id, user.email, ua);
  }

  private async issueSession(userId: string, email: string, ua?: string) {
    const sessionId = randomUUID();
    const pair = await this.signTokens(userId, email, sessionId);
    await this.persist(sessionId, userId, pair.refreshToken, ua);
    return pair;
  }

  private async signTokens(sub: string, email: string, sessionId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub, email, sessionId },
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
        },
      ),
      this.jwt.signAsync(
        { sub, email, sessionId },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async persist(
    id: string,
    userId: string,
    token: string,
    ua?: string,
  ) {
    await this.tokens.save(
      this.tokens.create({
        id,
        userId,
        hashedToken: await argon2.hash(token),
        userAgent: ua ?? null,
        revoked: false,
        expiresAt: this.refreshExpiry(),
      }),
    );
  }

  private refreshExpiry(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }

  async login(dto: LoginDto, ua?: string) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await argon2.verify(user.password, dto.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return this.issueSession(user.id, user.email, ua);
  }

  async refreshTokens(
    userId: string,
    email: string,
    sessionId: string,
    presented: string,
    ua?: string,
  ) {
    const session = await this.tokens.findOne({ where: { id: sessionId } });
    if (!session || session.revoked || session.expiresAt < new Date()) {
      await this.revokeAll(userId);
      throw new ForbiddenException('Sesión inválida. Inicia sesión de nuevo.');
    }
    const ok = await argon2.verify(session.hashedToken, presented);
    if (!ok) {
      await this.revokeAll(userId); // reúso de token rotado
      throw new ForbiddenException(
        'Reúso detectado. Se cerraron todas las sesiones.',
      );
    }
    const pair = await this.signTokens(userId, email, sessionId);
    session.hashedToken = await argon2.hash(pair.refreshToken);
    session.expiresAt = this.refreshExpiry();
    session.userAgent = ua ?? session.userAgent;
    await this.tokens.save(session);
    return pair;
  }

  async logout(sessionId: string) {
    await this.tokens.update({ id: sessionId }, { revoked: true });
  }

  async revokeAll(userId: string) {
    await this.tokens.update({ userId, revoked: false }, { revoked: true });
  }

  listSessions(userId: string) {
    return this.tokens.find({
      where: { userId, revoked: false },
      select: {
        id: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  }
}
