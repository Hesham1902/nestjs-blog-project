import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileImgDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  profileImg: string;
}
