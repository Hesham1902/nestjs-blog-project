import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileImgDto {
  @IsNotEmpty()
  @IsString()
  profileImg: string;
}
