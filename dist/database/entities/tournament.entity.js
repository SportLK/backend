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
exports.Tournament = exports.TournamentStatus = exports.TournamentFormat = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const venue_entity_1 = require("./venue.entity");
const user_sports_interest_entity_1 = require("./user-sports-interest.entity");
const tournament_registration_entity_1 = require("./tournament-registration.entity");
const tournament_bracket_entity_1 = require("./tournament-bracket.entity");
const match_entity_1 = require("./match.entity");
var TournamentFormat;
(function (TournamentFormat) {
    TournamentFormat["KNOCKOUT_SINGLE"] = "KNOCKOUT_SINGLE";
    TournamentFormat["ROUND_ROBIN"] = "ROUND_ROBIN";
    TournamentFormat["GROUP_AND_KNOCKOUT"] = "GROUP_AND_KNOCKOUT";
})(TournamentFormat || (exports.TournamentFormat = TournamentFormat = {}));
var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["DRAFT"] = "DRAFT";
    TournamentStatus["OPEN_FOR_REGISTRATION"] = "OPEN_FOR_REGISTRATION";
    TournamentStatus["ONGOING"] = "ONGOING";
    TournamentStatus["COMPLETED"] = "COMPLETED";
    TournamentStatus["CANCELLED"] = "CANCELLED";
})(TournamentStatus || (exports.TournamentStatus = TournamentStatus = {}));
let Tournament = class Tournament {
};
exports.Tournament = Tournament;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Tournament.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organizer_id', type: 'bigint' }),
    __metadata("design:type", String)
], Tournament.prototype, "organizerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.organizedTournaments, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_id' }),
    __metadata("design:type", user_entity_1.User)
], Tournament.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venue_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], Tournament.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => venue_entity_1.Venue, (venue) => venue.tournaments, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'venue_id' }),
    __metadata("design:type", venue_entity_1.Venue)
], Tournament.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tournament_name', length: 150 }),
    __metadata("design:type", String)
], Tournament.prototype, "tournamentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_sports_interest_entity_1.SportType }),
    __metadata("design:type", String)
], Tournament.prototype, "sportType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tournament_format',
        type: 'enum',
        enum: TournamentFormat,
        default: TournamentFormat.KNOCKOUT_SINGLE,
    }),
    __metadata("design:type", String)
], Tournament.prototype, "tournamentFormat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_participating_teams', type: 'int', default: 16 }),
    __metadata("design:type", Number)
], Tournament.prototype, "maxParticipatingTeams", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'registration_fee',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
    }),
    __metadata("design:type", Number)
], Tournament.prototype, "registrationFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", String)
], Tournament.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    __metadata("design:type", String)
], Tournament.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tournament_status',
        type: 'enum',
        enum: TournamentStatus,
        default: TournamentStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Tournament.prototype, "tournamentStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Tournament.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tournament_registration_entity_1.TournamentRegistration, (reg) => reg.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "registrations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tournament_bracket_entity_1.TournamentBracket, (bracket) => bracket.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "brackets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_entity_1.Match, (match) => match.tournament),
    __metadata("design:type", Array)
], Tournament.prototype, "matches", void 0);
exports.Tournament = Tournament = __decorate([
    (0, typeorm_1.Entity)('tournaments')
], Tournament);
//# sourceMappingURL=tournament.entity.js.map