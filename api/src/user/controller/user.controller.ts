import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  BadRequestException,
  MaxFileSizeValidator,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User, UserRole } from '../models/user.interface';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExtractUser } from '../decorators/get-user.decorator';
import { join } from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import { diskStorage } from 'multer';

// export const storage = {
//   storage: diskStorage({
//     destination: './uploads/profileImgs',
//     filename: function (req, file, cb) {
//       // console.log(file);
//       const uniqueName = uuidv4() + '-' + file.originalname.replace(/\s/g, '');
//       console.log(uniqueName);
//       cb(null, uniqueName);
//     },
//   }),
// };

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  create(@Body() user: RegisterDto): Promise<RegisterDto> {
    return this.userService.create(user);
  }

  @Post('/login')
  login(@Body() user: LoginDto): Promise<object> {
    return this.userService.login(user);
  }

  @Get(':id')
  findOne(@Param() params): Promise<User> {
    return this.userService.findOne(params.id);
  }

  @Get()
  findAll(@Query() query: any) {
    // eslint-disable-next-line prefer-const
    let { page = 1, limit = 10, ...rest } = query;
    limit = limit > 100 ? 100 : limit;
    const options = { page: +page, limit: +limit };

    if (Object.keys(rest).length > 0) {
      return this.userService.paginateFilter(options, { ...rest });
    } else {
      return this.userService.paginate({
        page: options.page,
        limit: options.limit,
        route: 'http://localhost:3000/user',
      });
    }
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('role/:id')
  updateRoleOfUser(
    @Body('role') role: any,
    @Param('id', ParseIntPipe) id: string,
  ): Promise<any> {
    return this.userService.updateRoleOfUser(role, id);
  }
  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.userService.deleteOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
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
    return this.userService.UploadToS3(file, user.id);
  }

  @Put(':id')
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: User,
  ): Promise<any> {
    return this.userService.updateOne(id, user);
  }
}
