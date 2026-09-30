import { Post } from './post.entity';
import { User } from './user.entity';
export declare enum ReportStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    DISMISSED = "DISMISSED"
}
export declare class PostReport {
    id: string;
    postId: string;
    post: Post;
    reporterId: string;
    reporter: User;
    reason: string;
    status: ReportStatus;
    handledByAdminId: string;
    createdAt: Date;
}
