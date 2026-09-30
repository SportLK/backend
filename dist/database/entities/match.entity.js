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
exports.Match = exports.MatchStatus = void 0;
const typeorm_1 = require("typeorm");
const tournament_entity_1 = require("./tournament.entity");
const team_entity_1 = require("./team.entity");
const venue_entity_1 = require("./venue.entity");
const match_score_entity_1 = require("./match-score.entity");
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["SCHEDULED"] = "SCHEDULED";
    MatchStatus["LIVE"] = "LIVE";
    MatchStatus["COMPLETED"] = "COMPLETED";
    MatchStatus["ABANDONED"] = "ABANDONED";
    MatchStatus["POSTPONED"] = "POSTPONED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tournament_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "tournamentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, (t) => t.matches, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'tournament_id' }),
    __metadata("design:type", tournament_entity_1.Tournament)
], Match.prototype, "tournament", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'home_team_id', type: 'bigint' }),
    __metadata("design:type", String)
], Match.prototype, "homeTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'home_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "homeTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'away_team_id', type: 'bigint' }),
    __metadata("design:type", String)
], Match.prototype, "awayTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'away_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "awayTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venue_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => venue_entity_1.Venue, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'venue_id' }),
    __metadata("design:type", venue_entity_1.Venue)
], Match.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scheduled_start_time', type: 'datetime' }),
    __metadata("design:type", Date)
], Match.prototype, "scheduledStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'match_status',
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Match.prototype, "matchStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'winner_team_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Match.prototype, "winnerTeamId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => team_entity_1.Team, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'winner_team_id' }),
    __metadata("design:type", team_entity_1.Team)
], Match.prototype, "winnerTeam", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => match_score_entity_1.MatchScore, (score) => score.match),
    __metadata("design:type", match_score_entity_1.MatchScore)
], Match.prototype, "score", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches')
], Match);
//# sourceMappingURL=match.entity.js.map