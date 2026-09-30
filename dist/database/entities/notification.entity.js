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
exports.Notification = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["MATCH_ALERT"] = "MATCH_ALERT";
    NotificationType["SCORE_UPDATE"] = "SCORE_UPDATE";
    NotificationType["CHALLENGE_RECEIVED"] = "CHALLENGE_RECEIVED";
    NotificationType["PAYMENT_RECEIPT"] = "PAYMENT_RECEIPT";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_id', type: 'bigint' }),
    __metadata("design:type", String)
], Notification.prototype, "recipientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.notifications, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'recipient_id' }),
    __metadata("design:type", user_entity_1.User)
], Notification.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notification_title', length: 150 }),
    __metadata("design:type", String)
], Notification.prototype, "notificationTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notification_body', type: 'text' }),
    __metadata("design:type", String)
], Notification.prototype, "notificationBody", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'notification_type',
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.SYSTEM,
    }),
    __metadata("design:type", String)
], Notification.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_read', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications')
], Notification);
//# sourceMappingURL=notification.entity.js.map