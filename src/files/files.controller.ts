import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FileDownloadQuery } from './dto/fileDownload.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

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
  downloadFile(@Query() query: FileDownloadQuery, @Res() res: Response) {
    const { filename } = query;

    const file = createReadStream(join(process.cwd(), `/uploads/${filename}`));

    file.on('error', () => {
      const error = new NotFoundException('File is not found');
      res.status(error.getStatus()).send(error.message);
    });

    //TODO: set file type https://docs.nestjs.com/techniques/streaming-files#example:~:text=the%20two%20engines.-,Example,-%23
    file.pipe(res);
  }
}
