"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.PostVisibility = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const post_comment_entity_1 = require("./post-comment.entity");
const post_like_entity_1 = require("./post-like.entity");
const post_report_entity_1 = require("./post-report.entity");
var PostVisibility;
(function (PostVisibility) {
    PostVisibility["PUBLIC"] = "PUBLIC";
    PostVisibility["TEAM_ONLY"] = "TEAM_ONLY";
})(PostVisibility || (exports.PostVisibility = PostVisibility = {}));
let Post = class Post {
};
exports.Post = Post;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'author_id', type: 'bigint' }),
    __metadata("design:type", String)
], Post.prototype, "authorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.posts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'author_id' }),
    __metadata("design:type", user_entity_1.User)
], Post.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Post.prototype, "caption", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "mediaUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sport_tag', length: 50, nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "sportTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'likes_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "likesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comments_count', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Post.prototype, "commentsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PostVisibility,
        default: PostVisibility.PUBLIC,
    }),
    __metadata("design:type", String)
], Post.prototype, "visibility", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_comment_entity_1.PostComment, (comment) => comment.post),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_like_entity_1.PostLike, (like) => like.post),
    __metadata("design:type", Array)
], Post.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_report_entity_1.PostReport, (report) => report.post),
    __metadata("design:type", Array)
], Post.prototype, "reports", void 0);
exports.Post = Post = __decorate([
    (0, typeorm_1.Entity)('posts')
], Post);
//# sourceMappingURL=post.entity.js.map