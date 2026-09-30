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
exports.VenueFacility = void 0;
const typeorm_1 = require("typeorm");
const venue_entity_1 = require("./venue.entity");
const user_sports_interest_entity_1 = require("./user-sports-interest.entity");
let VenueFacility = class VenueFacility {
};
exports.VenueFacility = VenueFacility;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], VenueFacility.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venue_id', type: 'bigint' }),
    __metadata("design:type", String)
], VenueFacility.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => venue_entity_1.Venue, (venue) => venue.facilities, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'venue_id' }),
    __metadata("design:type", venue_entity_1.Venue)
], VenueFacility.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: user_sports_interest_entity_1.SportType }),
    __metadata("design:type", String)
], VenueFacility.prototype, "sportType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'court_or_pitch_count', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], VenueFacility.prototype, "courtOrPitchCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_floodlights', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], VenueFacility.prototype, "hasFloodlights", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_parking', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], VenueFacility.prototype, "hasParking", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_changing_rooms', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], VenueFacility.prototype, "hasChangingRooms", void 0);
exports.VenueFacility = VenueFacility = __decorate([
    (0, typeorm_1.Entity)('venue_facilities')
], VenueFacility);
//# sourceMappingURL=venue-facility.entity.js.map