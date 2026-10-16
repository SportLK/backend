import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateCommentDto, CreateCommunityDto, CreatePostDto } from './community.dto';
import { Community, CommunityComment, CommunityLike, CommunityMembership, CommunityPost } from './community.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community) private readonly communities: Repository<Community>,
    @InjectRepository(CommunityPost) private readonly posts: Repository<CommunityPost>,
    @InjectRepository(CommunityComment) private readonly comments: Repository<CommunityComment>,
    @InjectRepository(CommunityLike) private readonly likes: Repository<CommunityLike>,
    @InjectRepository(CommunityMembership) private readonly memberships: Repository<CommunityMembership>,
    private readonly dataSource: DataSource,
  ) {}

  async listCommunities(userId: string) {
    const communities = await this.communities.find({ order: { memberCount: 'DESC', createdAt: 'DESC' } });
    if (!communities.length) return [];
    const joined = await this.memberships.find({
      where: { userId, communityId: In(communities.map((community) => community.id)) },
    });
    const joinedIds = new Set(joined.map((membership) => membership.communityId));
    return communities.map((community) => ({ ...community, isMember: joinedIds.has(community.id) }));
  }

  async createCommunity(userId: string, dto: CreateCommunityDto) {
    return this.dataSource.transaction(async (manager) => {
      const community = await manager.getRepository(Community).save(manager.getRepository(Community).create({
        ...dto,
        location: dto.location ?? null,
        createdById: userId,
      }));
      await manager.getRepository(CommunityMembership).save({ communityId: community.id, userId, role: 'owner' });
      return { ...community, isMember: true };
    });
  }

  async joinCommunity(communityId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const communities = manager.getRepository(Community);
      const community = await communities.findOne({ where: { id: communityId } });
      if (!community) throw new NotFoundException('Community not found');
      const memberships = manager.getRepository(CommunityMembership);
      const existing = await memberships.findOne({ where: { communityId, userId } });
      if (existing) return { isMember: true, memberCount: community.memberCount };
      await memberships.save(memberships.create({ communityId, userId, role: 'member' }));
      await communities.increment({ id: communityId }, 'memberCount', 1);
      return { isMember: true, memberCount: community.memberCount + 1 };
    });
  }

  async leaveCommunity(communityId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const communities = manager.getRepository(Community);
      const community = await communities.findOne({ where: { id: communityId } });
      if (!community) throw new NotFoundException('Community not found');
      const memberships = manager.getRepository(CommunityMembership);
      const existing = await memberships.findOne({ where: { communityId, userId } });
      if (existing) {
        await memberships.remove(existing);
        await communities.decrement({ id: communityId }, 'memberCount', 1);
      }
      return { isMember: false, memberCount: Math.max(0, community.memberCount - (existing ? 1 : 0)) };
    });
  }

  listPosts(includeHidden = false) {
    const query = this.posts.createQueryBuilder('post')
      .orderBy('post.createdAt', 'DESC')
      .limit(60);
    if (!includeHidden) query.where('post.status = :status', { status: 'visible' });
    return query.getMany();
  }

  async createPost(authorId: string, dto: CreatePostDto) {
    return this.posts.save(this.posts.create({
      authorId,
      body: dto.body,
      sport: dto.sport ?? null,
      communityId: dto.communityId ?? null,
    }));
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.posts.findOne({ where: { id: postId, status: 'visible' } });
    if (!post) throw new NotFoundException('Post not found');
    return this.dataSource.transaction(async (manager) => {
      const likes = manager.getRepository(CommunityLike);
      const existing = await likes.findOne({ where: { postId, userId } });
      if (existing) {
        await likes.remove(existing);
        await manager.decrement(CommunityPost, { id: postId }, 'likesCount', 1);
        return { liked: false, likesCount: Math.max(0, post.likesCount - 1) };
      }
      await likes.save(likes.create({ postId, userId }));
      await manager.increment(CommunityPost, { id: postId }, 'likesCount', 1);
      return { liked: true, likesCount: post.likesCount + 1 };
    });
  }

  async addComment(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.posts.findOne({ where: { id: postId, status: 'visible' } });
    if (!post) throw new NotFoundException('Post not found');
    const comment = await this.comments.save(this.comments.create({ postId, authorId, body: dto.body }));
    await this.posts.increment({ id: postId }, 'commentsCount', 1);
    return comment;
  }

  listComments(postId: string) {
    return this.comments.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }

  async setPostStatus(postId: string, status: 'visible' | 'hidden') {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    post.status = status;
    return this.posts.save(post);
  }
}
