import { BadRequestException, Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly apiKey = process.env.LIVEKIT_API_KEY ?? '';
  private readonly apiSecret = process.env.LIVEKIT_API_SECRET ?? '';

  async createToken(
    roomName: string,
    participantName: string
  ): Promise<{ token: string }> {
    if (!this.apiKey || !this.apiSecret) {
      throw new BadRequestException('LiveKit keys not configured');
    }

    const token = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantName,
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return { token: await token.toJwt() };
  }
}
