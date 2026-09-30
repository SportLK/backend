import { User } from './user.entity';
import { PostComment } from './post-comment.entity';
import { PostLike } from './post-like.entity';
import { PostReport } from './post-report.entity';
export declare enum PostVisibility {
    PUBLIC = "PUBLIC",
    TEAM_ONLY = "TEAM_ONLY"
}
export declare class Post {
    id: string;
    authorId: string;
    author: User;
    caption: string;
    mediaUrl: string;
    sportTag: string;
    likesCount: number;
    commentsCount: number;
    visibility: PostVisibility;
    createdAt: Date;
    comments: PostComment[];
    likes: PostLike[];
    reports: PostReport[];
}
