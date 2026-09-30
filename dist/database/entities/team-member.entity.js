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
exports.TeamMember = exports.TeamMemberRole = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("./team.entity");
const user_entity_1 = require("./user.entity");
var TeamMemberRole;
(function (TeamMemberRole) {
    TeamMemberRole["CAPTAIN"] = "CAPTAIN";
    TeamMemberRole["VICE_CAPTAIN"] = "VICE_CAPTAIN";
    TeamMemberRole["SQUAD_PLAYER"] = "SQUAD_PLAYER";
})(TeamMemberRole || (exports.TeamMemberRole = TeamMemberRole = {}));
let TeamMember = class TeamMember {
};
exports.TeamMember = TeamMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], TeamMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_id', type: 'bigint' }),
    __metadata("design:type", String)
], TeamMember.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, (team) => team.members, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamMember.prototype, "team", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], TeamMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.teamMemberships, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TeamMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_role',
        type: 'enum',
        enum: TeamMemberRole,
        default: TeamMemberRole.SQUAD_PLAYER,
    }),
    __metadata("design:type", String)
], TeamMember.prototype, "memberRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jersey_number', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TeamMember.prototype, "jerseyNumber", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'joined_at' }),
    __metadata("design:type", Date)
], TeamMember.prototype, "joinedAt", void 0);
exports.TeamMember = TeamMember = __decorate([
    (0, typeorm_1.Entity)('team_members'),
    (0, typeorm_1.Unique)(['teamId', 'userId'])
], TeamMember);
//# sourceMappingURL=team-member.entity.js.map