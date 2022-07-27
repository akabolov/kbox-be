import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, hash: string) {
    await this.prisma.user.create({
      data: {
        email,
        hash,
      },
    });
  }
}
