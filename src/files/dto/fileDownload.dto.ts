import { IsNotEmpty, IsString } from 'class-validator';

export class FileDownloadQuery {
  @IsString()
  @IsNotEmpty()
  filename: string;
}
