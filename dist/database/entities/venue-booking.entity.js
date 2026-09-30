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
exports.VenueBooking = exports.BookingStatus = void 0;
const typeorm_1 = require("typeorm");
const venue_entity_1 = require("./venue.entity");
const user_entity_1 = require("./user.entity");
const payment_entity_1 = require("./payment.entity");
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["REFUNDED"] = "REFUNDED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
let VenueBooking = class VenueBooking {
};
exports.VenueBooking = VenueBooking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], VenueBooking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'venue_id', type: 'bigint' }),
    __metadata("design:type", String)
], VenueBooking.prototype, "venueId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => venue_entity_1.Venue, (venue) => venue.bookings, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'venue_id' }),
    __metadata("design:type", venue_entity_1.Venue)
], VenueBooking.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booked_by_user_id', type: 'bigint' }),
    __metadata("design:type", String)
], VenueBooking.prototype, "bookedByUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.venueBookings, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'booked_by_user_id' }),
    __metadata("design:type", user_entity_1.User)
], VenueBooking.prototype, "bookedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'booking_date', type: 'date' }),
    __metadata("design:type", String)
], VenueBooking.prototype, "bookingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], VenueBooking.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], VenueBooking.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], VenueBooking.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'booking_status',
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING_PAYMENT,
    }),
    __metadata("design:type", String)
], VenueBooking.prototype, "bookingStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_id', type: 'bigint', nullable: true }),
    __metadata("design:type", String)
], VenueBooking.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", payment_entity_1.Payment)
], VenueBooking.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], VenueBooking.prototype, "createdAt", void 0);
exports.VenueBooking = VenueBooking = __decorate([
    (0, typeorm_1.Entity)('venue_bookings')
], VenueBooking);
//# sourceMappingURL=venue-booking.entity.js.map