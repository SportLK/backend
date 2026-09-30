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
exports.MatchScore = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("./match.entity");
let MatchScore = class MatchScore {
};
exports.MatchScore = MatchScore;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], MatchScore.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', type: 'bigint', unique: true }),
    __metadata("design:type", String)
], MatchScore.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => match_entity_1.Match, (match) => match.score, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], MatchScore.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'home_team_score_display', length: 100, nullable: true }),
    __metadata("design:type", String)
], MatchScore.prototype, "homeTeamScoreDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'away_team_score_display', length: 100, nullable: true }),
    __metadata("design:type", String)
], MatchScore.prototype, "awayTeamScoreDisplay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detailed_scorecard_json', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], MatchScore.prototype, "detailedScorecardJson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_updated_by_user_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], MatchScore.prototype, "lastUpdatedByUserId", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], MatchScore.prototype, "updatedAt", void 0);
exports.MatchScore = MatchScore = __decorate([
    (0, typeorm_1.Entity)('match_scores')
], MatchScore);
//# sourceMappingURL=match-score.entity.js.map