import slugify from 'slugify';
import { CommentEntity } from 'src/comments/models/comments.entity';
import { UserEntity } from 'src/user/models/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  body: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ nullable: true })
  headerImage: string;

  @Column({ nullable: true })
  publishDate: Date;

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: 'CASCADE' })
  author: UserEntity;

  @Column({ default: 0 })
  likes: number;

  @ManyToMany(() => UserEntity, (user) => user.likedBlogs)
  @JoinTable()
  usersWhoLiked: UserEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.blog)
  comments: CommentEntity[];

  @BeforeUpdate()
  updateTimeStampAndSlugs() {
    this.slug = slugify(this.title);
    this.updatedAt = new Date();
  }
}
