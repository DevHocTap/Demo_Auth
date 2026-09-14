import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(username: string, password: string, email: string) {
    const existed = await this.prisma.user.findUnique({
      where: { username, email },
    });
    if (existed) {
      throw new ConflictException('Tài khoản đã tồn tại');
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { username, password: hash, email },
    });

    return { id: user.id, username: user.username, email: user.email };
  }
}
