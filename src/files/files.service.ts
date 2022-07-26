import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prismaService: PrismaService) {}

  async getAll() {
    const files = await this.prismaService.file.findMany();
    return files;
  }

  async saveFileMetadata(file: Express.Multer.File) {
    await this.prismaService.file.create({
      data: {
        filename: file.filename,
        mimetype: file.mimetype,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
      },
    });
  }
}
