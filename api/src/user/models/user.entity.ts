import {
  BeforeInsert,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user.interface';
import { BlogEntity } from 'src/blog/models/blog.entity';
import { CommentEntity } from 'src/comments/models/comments.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  profileImg: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  passwordResetCodeVerified: boolean;

  @Column({ nullable: true })
  emailVerifiedCode: string;

  @Column({ nullable: true })
  passwordResetCode: string;

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  @ManyToMany(() => BlogEntity, (blog) => blog.likes)
  likedBlogs: BlogEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.user)
  comments: CommentEntity[];

  @BeforeInsert()
  emailToLowercase() {
    this.email = this.email.toLowerCase();
  }
}
