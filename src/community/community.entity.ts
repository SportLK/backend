import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ length: 120 }) name: string;
  @Column({ length: 80 }) sport: string;
  @Column({ length: 100, nullable: true }) location: string | null;
  @Column({ type: 'text' }) description: string;
  @Column({ name: 'created_by_id', length: 36 }) createdById: string;
  @Column({ name: 'member_count', default: 1 }) memberCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'author_id', length: 36 }) authorId: string;
  @Column({ name: 'community_id', length: 36, nullable: true }) communityId: string | null;
  @Column({ length: 80, nullable: true }) sport: string | null;
  @Column({ type: 'text' }) body: string;
  @Column({ length: 20, default: 'visible' }) status: 'visible' | 'hidden';
  @Column({ name: 'likes_count', default: 0 }) likesCount: number;
  @Column({ name: 'comments_count', default: 0 }) commentsCount: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('community_comments')
export class CommunityComment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'post_id', length: 36 }) postId: string;
  @Column({ name: 'author_id', length: 36 }) authorId: string;
  @Column({ type: 'text' }) body: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('community_likes')
@Unique(['postId', 'userId'])
export class CommunityLike {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'post_id', length: 36 }) postId: string;
  @Column({ name: 'user_id', length: 36 }) userId: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('community_memberships')
@Unique(['communityId', 'userId'])
export class CommunityMembership {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'community_id', length: 36 }) communityId: string;
  @Column({ name: 'user_id', length: 36 }) userId: string;
  @Column({ length: 20, default: 'member' }) role: 'member' | 'owner';
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
