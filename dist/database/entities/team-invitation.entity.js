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
exports.TeamInvitation = exports.InvitationStatus = exports.InvitationType = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("./team.entity");
const user_entity_1 = require("./user.entity");
var InvitationType;
(function (InvitationType) {
    InvitationType["MANAGER_TO_PLAYER"] = "MANAGER_TO_PLAYER";
    InvitationType["PLAYER_REQUEST_TO_JOIN"] = "PLAYER_REQUEST_TO_JOIN";
})(InvitationType || (exports.InvitationType = InvitationType = {}));
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "PENDING";
    InvitationStatus["ACCEPTED"] = "ACCEPTED";
    InvitationStatus["REJECTED"] = "REJECTED";
    InvitationStatus["EXPIRED"] = "EXPIRED";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
let TeamInvitation = class TeamInvitation {
};
exports.TeamInvitation = TeamInvitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], TeamInvitation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'bigint' }),
    __metadata("design:type", String)
], TeamInvitation.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.invitations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamInvitation.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invited_user_id', type: 'bigint' }),
    __metadata("design:type", String)
], TeamInvitation.prototype, "invitedUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invited_user_id' }),
    __metadata("design:type", user_entity_1.User)
], TeamInvitation.prototype, "invitedUser", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'invite_type',
        type: 'enum',
        enum: InvitationType,
    }),
    __metadata("design:type", String)
], TeamInvitation.prototype, "inviteType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    }),
    __metadata("design:type", String)
], TeamInvitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeamInvitation.prototype, "createdAt", void 0);
exports.TeamInvitation = TeamInvitation = __decorate([
    (0, typeorm_1.Entity)('team_invitations')
], TeamInvitation);
//# sourceMappingURL=team-invitation.entity.js.map