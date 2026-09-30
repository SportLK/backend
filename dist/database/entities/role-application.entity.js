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
exports.RoleApplication = exports.ApplicationStatus = exports.RequestedRole = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var RequestedRole;
(function (RequestedRole) {
    RequestedRole["TEAM_MANAGER"] = "TEAM_MANAGER";
    RequestedRole["TOURNAMENT_ORGANIZER"] = "TOURNAMENT_ORGANIZER";
})(RequestedRole || (exports.RequestedRole = RequestedRole = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
let RoleApplication = class RoleApplication {
};
exports.RoleApplication = RoleApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], RoleApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], RoleApplication.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.roleApplications, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], RoleApplication.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: RequestedRole }),
    __metadata("design:type", String)
], RoleApplication.prototype, "requestedRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'justification_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoleApplication.prototype, "justificationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supporting_document_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoleApplication.prototype, "supportingDocumentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ApplicationStatus,
        default: ApplicationStatus.PENDING,
    }),
    __metadata("design:type", String)
], RoleApplication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_by_admin_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], RoleApplication.prototype, "reviewedByAdminId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_feedback', type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoleApplication.prototype, "adminFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reviewed_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], RoleApplication.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RoleApplication.prototype, "createdAt", void 0);
exports.RoleApplication = RoleApplication = __decorate([
    (0, typeorm_1.Entity)('role_applications')
], RoleApplication);
//# sourceMappingURL=role-application.entity.js.map