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
exports.Team = exports.TeamStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const team_member_entity_1 = require("./team-member.entity");
const team_invitation_entity_1 = require("./team-invitation.entity");
const user_sports_interest_entity_1 = require("./user-sports-interest.entity");
const tournament_registration_entity_1 = require("./tournament-registration.entity");
var TeamStatus;
(function (TeamStatus) {
    TeamStatus["ACTIVE"] = "ACTIVE";
    TeamStatus["INACTIVE"] = "INACTIVE";
    TeamStatus["SUSPENDED"] = "SUSPENDED";
})(TeamStatus || (exports.TeamStatus = TeamStatus = {}));
let Team = class Team {
};
exports.Team = Team;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Team.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manager_id', type: 'bigint' }),
    __metadata("design:type", String)
], Team.prototype, "managerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.managedTeams, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'manager_id' }),
    __metadata("design:type", user_entity_1.User)
], Team.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_name', unique: true, length: 100 }),
    __metadata("design:type", String)
], Team.prototype, "teamName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_sports_interest_entity_1.SportType }),
    __metadata("design:type", String)
], Team.prototype, "sportType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'team_bio', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "teamBio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primary_location_city', length: 100, nullable: true }),
    __metadata("design:type", String)
], Team.prototype, "primaryLocationCity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TeamStatus,
        default: TeamStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Team.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Team.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_member_entity_1.TeamMember, (member) => member.team),
    __metadata("design:type", Array)
], Team.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_invitation_entity_1.TeamInvitation, (invitation) => invitation.team),
    __metadata("design:type", Array)
], Team.prototype, "invitations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tournament_registration_entity_1.TournamentRegistration, (reg) => reg.team),
    __metadata("design:type", Array)
], Team.prototype, "tournamentRegistrations", void 0);
exports.Team = Team = __decorate([
    (0, typeorm_1.Entity)('teams')
], Team);
//# sourceMappingURL=team.entity.js.map