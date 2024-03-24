import { User } from 'src/user/models/user.interface';

export interface Blog {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: number;
  author?: User;
  headerImage?: string;
  publishDate?: Date;
  isPublished?: boolean;
}
