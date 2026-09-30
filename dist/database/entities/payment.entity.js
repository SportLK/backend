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
exports.Payment = exports.PaymentStatus = exports.PaymentPurpose = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var PaymentPurpose;
(function (PaymentPurpose) {
    PaymentPurpose["TOURNAMENT_REGISTRATION"] = "TOURNAMENT_REGISTRATION";
    PaymentPurpose["VENUE_BOOKING"] = "VENUE_BOOKING";
})(PaymentPurpose || (exports.PaymentPurpose = PaymentPurpose = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["INITIATED"] = "INITIATED";
    PaymentStatus["SUCCESSFUL"] = "SUCCESSFUL";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CHARGEDBACK"] = "CHARGEDBACK";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], Payment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.payments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Payment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payhere_order_id', unique: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "payhereOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payhere_payment_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "payherePaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
    }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, default: 'LKR' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_purpose',
        type: 'enum',
        enum: PaymentPurpose,
    }),
    __metadata("design:type", String)
], Payment.prototype, "paymentPurpose", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_status',
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.INITIATED,
    }),
    __metadata("design:type", String)
], Payment.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'md5_verification_signature', length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "md5VerificationSignature", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=payment.entity.js.map