import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabaseUrl = process.env.SUPABASE_URL ?? '';
  private readonly supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';
  private readonly supabase = createClient(
    this.supabaseUrl,
    this.supabaseAnonKey
  );

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid auth token');
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email ?? null;
    const phone = supabaseUser.phone ?? null;

    if (!email && !phone) {
      throw new UnauthorizedException('Missing user identity');
    }

    const authProviders = supabaseUser.app_metadata?.providers ?? [];

    const user = await this.prisma.user.upsert({
      where: { id: supabaseUser.id },
      update: {
        email,
        phoneNumber: phone,
        authProviders,
      },
      create: {
        id: supabaseUser.id,
        email,
        phoneNumber: phone,
        authProviders,
        screenName: supabaseUser.user_metadata?.screen_name ?? null,
      },
    });

    request.user = user;

    return true;
  }
}
