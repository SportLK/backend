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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenuesController = void 0;
const common_1 = require("@nestjs/common");
const venues_service_1 = require("./venues.service");
const create_venue_dto_1 = require("./dto/create-venue.dto");
const nearby_venues_query_dto_1 = require("./dto/nearby-venues-query.dto");
let VenuesController = class VenuesController {
    constructor(venuesService) {
        this.venuesService = venuesService;
    }
    create(createVenueDto) {
        return this.venuesService.create(createVenueDto);
    }
    findNearby(query) {
        return this.venuesService.findNearby(query);
    }
    findAll(sportType, city) {
        return this.venuesService.findAll(sportType, city);
    }
    findOne(id) {
        return this.venuesService.findOne(id);
    }
    update(id, updateVenueDto) {
        return this.venuesService.update(id, updateVenueDto);
    }
    remove(id) {
        return this.venuesService.remove(id);
    }
};
exports.VenuesController = VenuesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_venue_dto_1.CreateVenueDto]),
    __metadata("design:returntype", void 0)
], VenuesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nearby_venues_query_dto_1.NearbyVenuesQueryDto]),
    __metadata("design:returntype", void 0)
], VenuesController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sportType')),
    __param(1, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VenuesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VenuesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VenuesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VenuesController.prototype, "remove", null);
exports.VenuesController = VenuesController = __decorate([
    (0, common_1.Controller)('venues'),
    __metadata("design:paramtypes", [venues_service_1.VenuesService])
], VenuesController);
//# sourceMappingURL=venues.controller.js.map