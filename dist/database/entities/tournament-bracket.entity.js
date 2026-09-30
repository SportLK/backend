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
exports.TournamentBracket = void 0;
const typeorm_1 = require("typeorm");
const tournament_entity_1 = require("./tournament.entity");
const match_entity_1 = require("./match.entity");
let TournamentBracket = class TournamentBracket {
};
exports.TournamentBracket = TournamentBracket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], TournamentBracket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tournament_id', type: 'bigint' }),
    __metadata("design:type", String)
], TournamentBracket.prototype, "tournamentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tournament_entity_1.Tournament, (t) => t.brackets, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tournament_id' }),
    __metadata("design:type", tournament_entity_1.Tournament)
], TournamentBracket.prototype, "tournament", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'round_number', type: 'int' }),
    __metadata("design:type", Number)
], TournamentBracket.prototype, "roundNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_sequence_in_round', type: 'int' }),
    __metadata("design:type", Number)
], TournamentBracket.prototype, "matchSequenceInRound", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], TournamentBracket.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], TournamentBracket.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'next_bracket_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], TournamentBracket.prototype, "nextBracketId", void 0);
exports.TournamentBracket = TournamentBracket = __decorate([
    (0, typeorm_1.Entity)('tournament_brackets')
], TournamentBracket);
//# sourceMappingURL=tournament-bracket.entity.js.map