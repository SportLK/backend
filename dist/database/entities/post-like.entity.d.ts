import { Post } from './post.entity';
import { User } from './user.entity';
export declare class PostLike {
    id: string;
    postId: string;
    post: Post;
    userId: string;
    user: User;
    createdAt: Date;
}
