import { Blog } from 'src/blog/models/blog.interface';

export interface User {
  id?: number;
  name?: string;
  username?: string;
  email: string;
  password: string;
  role?: UserRole;
  blogs?: Blog[];
  profileImg?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  USER = 'user',
}
