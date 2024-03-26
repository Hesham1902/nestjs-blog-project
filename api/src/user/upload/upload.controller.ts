import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ExtractUser } from '../decorators/get-user.decorator';
import { User } from '../models/user.interface';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  /* This when you want to upload a file to file system (locally)
  import { diskStorage } from 'multer';

  export const storage = {
    storage: diskStorage({
      destination: './uploads/profileImgs',
      filename: function (req, file, cb) {
        // console.log(file);
        const uniqueName = uuidv4() + '-' + file.originalname.replace(/\s/g, '');
        console.log(uniqueName);
        cb(null, uniqueName);
      },
    }),
  };
*/
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Patch()
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: 'png|jpeg|jpg' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @ExtractUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('Invalid file object');
    }
    // return this.userService.updateOne(user.id, { profileImg: file.filename });
    return this.uploadService.UploadToS3(file, user.id);
  }
}
