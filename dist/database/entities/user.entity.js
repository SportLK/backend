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
exports.User = exports.AccountStatus = exports.ActiveWorkspace = exports.BaseRole = void 0;
const typeorm_1 = require("typeorm");
const user_sports_interest_entity_1 = require("./user-sports-interest.entity");
const role_application_entity_1 = require("./role-application.entity");
const post_entity_1 = require("./post.entity");
const team_entity_1 = require("./team.entity");
const team_member_entity_1 = require("./team-member.entity");
const tournament_entity_1 = require("./tournament.entity");
const venue_booking_entity_1 = require("./venue-booking.entity");
const payment_entity_1 = require("./payment.entity");
const notification_entity_1 = require("./notification.entity");
var BaseRole;
(function (BaseRole) {
    BaseRole["PLAYER"] = "PLAYER";
    BaseRole["ADMIN"] = "ADMIN";
})(BaseRole || (exports.BaseRole = BaseRole = {}));
var ActiveWorkspace;
(function (ActiveWorkspace) {
    ActiveWorkspace["PLAYER"] = "PLAYER";
    ActiveWorkspace["TEAM_MANAGER"] = "TEAM_MANAGER";
    ActiveWorkspace["TOURNAMENT_ORGANIZER"] = "TOURNAMENT_ORGANIZER";
    ActiveWorkspace["ADMIN"] = "ADMIN";
})(ActiveWorkspace || (exports.ActiveWorkspace = ActiveWorkspace = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["DEACTIVATED"] = "DEACTIVATED";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 150 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', length: 100 }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', length: 20, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profile_image_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'base_role',
        type: 'enum',
        enum: BaseRole,
        default: BaseRole.PLAYER,
    }),
    __metadata("design:type", String)
], User.prototype, "baseRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_team_manager', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isTeamManager", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_tournament_organizer', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isTournamentOrganizer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'active_workspace',
        type: 'enum',
        enum: ActiveWorkspace,
        default: ActiveWorkspace.PLAYER,
    }),
    __metadata("design:type", String)
], User.prototype, "activeWorkspace", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'account_status',
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "accountStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_sports_interest_entity_1.UserSportsInterest, (interest) => interest.user),
    __metadata("design:type", Array)
], User.prototype, "sportsInterests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => role_application_entity_1.RoleApplication, (app) => app.user),
    __metadata("design:type", Array)
], User.prototype, "roleApplications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => post_entity_1.Post, (post) => post.author),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_entity_1.Team, (team) => team.manager),
    __metadata("design:type", Array)
], User.prototype, "managedTeams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_member_entity_1.TeamMember, (member) => member.user),
    __metadata("design:type", Array)
], User.prototype, "teamMemberships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tournament_entity_1.Tournament, (tournament) => tournament.organizer),
    __metadata("design:type", Array)
], User.prototype, "organizedTournaments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venue_booking_entity_1.VenueBooking, (booking) => booking.bookedByUser),
    __metadata("design:type", Array)
], User.prototype, "venueBookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.user),
    __metadata("design:type", Array)
], User.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notif) => notif.recipient),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map