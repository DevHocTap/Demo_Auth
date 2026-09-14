import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập hệ thống!');
    }

    try {
      // verifyAsync dùng secret đã cấu hình trong JwtModule.register
      const payload = await this.jwtService.verifyAsync(token);
      // Gắn payload vào request để controller lấy ra qua @Req() hoặc decorator
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Xác thực không hợp lệ!');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
