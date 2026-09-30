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
exports.CreateFacilityDto = void 0;
const class_validator_1 = require("class-validator");
const user_sports_interest_entity_1 = require("../../database/entities/user-sports-interest.entity");
class CreateFacilityDto {
    constructor() {
        this.courtOrPitchCount = 1;
        this.hasFloodlights = false;
        this.hasParking = false;
        this.hasChangingRooms = false;
    }
}
exports.CreateFacilityDto = CreateFacilityDto;
__decorate([
    (0, class_validator_1.IsEnum)(user_sports_interest_entity_1.SportType, {
        message: 'sportType must be one of CRICKET, FUTSAL, BADMINTON, BASKETBALL',
    }),
    __metadata("design:type", String)
], CreateFacilityDto.prototype, "sportType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateFacilityDto.prototype, "courtOrPitchCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityDto.prototype, "hasFloodlights", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityDto.prototype, "hasParking", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFacilityDto.prototype, "hasChangingRooms", void 0);
//# sourceMappingURL=create-facility.dto.js.map