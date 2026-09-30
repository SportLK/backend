import { Post } from './post.entity';
import { User } from './user.entity';
export declare class PostComment {
    id: string;
    postId: string;
    post: Post;
    authorId: string;
    author: User;
    commentBody: string;
    createdAt: Date;
}
