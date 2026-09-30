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
exports.UserSportsInterest = exports.SkillLevel = exports.SportType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var SportType;
(function (SportType) {
    SportType["CRICKET"] = "CRICKET";
    SportType["FUTSAL"] = "FUTSAL";
    SportType["BADMINTON"] = "BADMINTON";
    SportType["BASKETBALL"] = "BASKETBALL";
})(SportType || (exports.SportType = SportType = {}));
var SkillLevel;
(function (SkillLevel) {
    SkillLevel["BEGINNER"] = "BEGINNER";
    SkillLevel["INTERMEDIATE"] = "INTERMEDIATE";
    SkillLevel["ADVANCED"] = "ADVANCED";
})(SkillLevel || (exports.SkillLevel = SkillLevel = {}));
let UserSportsInterest = class UserSportsInterest {
};
exports.UserSportsInterest = UserSportsInterest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], UserSportsInterest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], UserSportsInterest.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sportsInterests, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserSportsInterest.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SportType }),
    __metadata("design:type", String)
], UserSportsInterest.prototype, "sportType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SkillLevel,
        default: SkillLevel.BEGINNER,
    }),
    __metadata("design:type", String)
], UserSportsInterest.prototype, "skillLevel", void 0);
exports.UserSportsInterest = UserSportsInterest = __decorate([
    (0, typeorm_1.Entity)('user_sports_interests')
], UserSportsInterest);
//# sourceMappingURL=user-sports-interest.entity.js.map