import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // áp cho toàn bộ route trong controller
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
