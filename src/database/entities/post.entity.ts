import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PostComment } from './post-comment.entity';
import { PostLike } from './post-like.entity';
import { PostReport } from './post-report.entity';

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  TEAM_ONLY = 'TEAM_ONLY',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'author_id', type: 'bigint' })
  authorId: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'text' })
  caption: string;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl: string;

  @Column({ name: 'sport_tag', length: 50, nullable: true })
  sportTag: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentsCount: number;

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @OneToMany(() => PostReport, (report) => report.post)
  reports: PostReport[];
}
