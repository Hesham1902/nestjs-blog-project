import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  username?: string;

  @IsString()
  profileImg?: string;
}
