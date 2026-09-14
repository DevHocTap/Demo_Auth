import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Kiểm tra email có tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 2. So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 3. Tạo Payload cho JWT Token
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    // 4. Trả về access_token và thông tin user cơ bản
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
