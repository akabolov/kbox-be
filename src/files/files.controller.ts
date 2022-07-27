import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileDownloadQuery } from './dto/fileDownload.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(
    private filesService: FilesService,
    private prisma: PrismaService,
  ) {}

  @Get('/')
  async getFiles() {
    return this.filesService.getAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads' }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.filesService.saveFileMetadata(file);
  }

  @Get('download')
  async downloadFile(
    @Query() query: FileDownloadQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { filename } = query;

    const fileStream = createReadStream(
      join(process.cwd(), `/uploads/${filename}`),
    );

    fileStream.on('error', () => {
      const error = new NotFoundException('File is not found');
      res.status(error.getStatus()).send(error.message);
    });

    const file = await this.prisma.file.findUnique({
      where: {
        filename,
      },
    });

    if (file) {
      res.set({
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
      });

      return new StreamableFile(fileStream);
    }
  }
}
