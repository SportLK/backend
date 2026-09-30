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
exports.TeamChallenge = exports.ChallengeStatus = void 0;
const typeorm_1 = require("typeorm");
const team_entity_1 = require("./team.entity");
const user_sports_interest_entity_1 = require("./user-sports-interest.entity");
var ChallengeStatus;
(function (ChallengeStatus) {
    ChallengeStatus["PENDING"] = "PENDING";
    ChallengeStatus["ACCEPTED"] = "ACCEPTED";
    ChallengeStatus["DECLINED"] = "DECLINED";
    ChallengeStatus["COMPLETED"] = "COMPLETED";
    ChallengeStatus["CANCELLED"] = "CANCELLED";
})(ChallengeStatus || (exports.ChallengeStatus = ChallengeStatus = {}));
let TeamChallenge = class TeamChallenge {
};
exports.TeamChallenge = TeamChallenge;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], TeamChallenge.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'challenger_team_id', type: 'bigint' }),
    __metadata("design:type", String)
], TeamChallenge.prototype, "challengerTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'challenger_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamChallenge.prototype, "challengerTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'challenged_team_id', type: 'bigint' }),
    __metadata("design:type", String)
], TeamChallenge.prototype, "challengedTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'challenged_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], TeamChallenge.prototype, "challengedTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venue_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], TeamChallenge.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proposed_match_date', type: 'datetime' }),
    __metadata("design:type", Date)
], TeamChallenge.prototype, "proposedMatchDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_sports_interest_entity_1.SportType }),
    __metadata("design:type", String)
], TeamChallenge.prototype, "sportType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChallengeStatus,
        default: ChallengeStatus.PENDING,
    }),
    __metadata("design:type", String)
], TeamChallenge.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TeamChallenge.prototype, "createdAt", void 0);
exports.TeamChallenge = TeamChallenge = __decorate([
    (0, typeorm_1.Entity)('team_challenges')
], TeamChallenge);
//# sourceMappingURL=team-challenge.entity.js.map