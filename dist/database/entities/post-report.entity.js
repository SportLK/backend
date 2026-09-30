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
exports.PostReport = exports.ReportStatus = void 0;
const typeorm_1 = require("typeorm");
const post_entity_1 = require("./post.entity");
const user_entity_1 = require("./user.entity");
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["RESOLVED"] = "RESOLVED";
    ReportStatus["DISMISSED"] = "DISMISSED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
let PostReport = class PostReport {
};
exports.PostReport = PostReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], PostReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id', type: 'bigint' }),
    __metadata("design:type", String)
], PostReport.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, (post) => post.reports, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'post_id' }),
    __metadata("design:type", post_entity_1.Post)
], PostReport.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reporter_id', type: 'bigint' }),
    __metadata("design:type", String)
], PostReport.prototype, "reporterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'reporter_id' }),
    __metadata("design:type", user_entity_1.User)
], PostReport.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PostReport.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    }),
    __metadata("design:type", String)
], PostReport.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'handled_by_admin_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], PostReport.prototype, "handledByAdminId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PostReport.prototype, "createdAt", void 0);
exports.PostReport = PostReport = __decorate([
    (0, typeorm_1.Entity)('post_reports')
], PostReport);
//# sourceMappingURL=post-report.entity.js.map