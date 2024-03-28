import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from 'src/user/models/user.interface';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  headerImage?: any;

  @IsOptional()
  slug?: string;

  @IsOptional()
  author?: User;
}
