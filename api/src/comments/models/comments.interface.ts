import { Blog } from 'src/blog/models/blog.interface';
import { User } from 'src/user/models/user.interface';

export class Comment {
  id?: number;
  content?: string;
  user?: User;
  blog?: Blog;
  createdAt?: Date;
  updatedAt?: Date;
}
