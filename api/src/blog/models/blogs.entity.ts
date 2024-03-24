import { UserEntity } from 'src/user/models/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @Column({ default: 0 })
  likes: number;

  @Column({ nullable: true })
  headerImage: string;

  @Column({ nullable: true })
  publishDate: Date;

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => UserEntity, (user) => user.blogs)
  author: UserEntity;

  //   @ManyToOne(() => UserEntity, (user) => user.blogs)
  //   user: UserEntity;

  @BeforeUpdate()
  updateTimeStamp() {
    this.updatedAt = new Date();
  }
}
