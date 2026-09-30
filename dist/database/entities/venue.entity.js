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
exports.Venue = void 0;
const typeorm_1 = require("typeorm");
const venue_facility_entity_1 = require("./venue-facility.entity");
const venue_booking_entity_1 = require("./venue-booking.entity");
const tournament_entity_1 = require("./tournament.entity");
let Venue = class Venue {
};
exports.Venue = Venue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Venue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venue_name', length: 150 }),
    __metadata("design:type", String)
], Venue.prototype, "venueName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'location_coordinates',
        type: 'point',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false,
    }),
    (0, typeorm_1.Index)({ spatial: true }),
    __metadata("design:type", String)
], Venue.prototype, "locationCoordinates", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line', length: 255 }),
    __metadata("design:type", String)
], Venue.prototype, "addressLine", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Venue.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Venue.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'hourly_base_rate',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
    }),
    __metadata("design:type", Number)
], Venue.prototype, "hourlyBaseRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Venue.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Venue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venue_facility_entity_1.VenueFacility, (facility) => facility.venue),
    __metadata("design:type", Array)
], Venue.prototype, "facilities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venue_booking_entity_1.VenueBooking, (booking) => booking.venue),
    __metadata("design:type", Array)
], Venue.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tournament_entity_1.Tournament, (tournament) => tournament.venue),
    __metadata("design:type", Array)
], Venue.prototype, "tournaments", void 0);
exports.Venue = Venue = __decorate([
    (0, typeorm_1.Entity)('venues')
], Venue);
//# sourceMappingURL=venue.entity.js.map