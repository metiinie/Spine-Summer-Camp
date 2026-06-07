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
exports.RegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const registrations_service_1 = require("./registrations.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_registration_dto_1 = require("./dto/create-registration.dto");
const find_all_query_dto_1 = require("./dto/find-all-query.dto");
const admin_action_dto_1 = require("./dto/admin-action.dto");
let RegistrationsController = class RegistrationsController {
    regService;
    constructor(regService) {
        this.regService = regService;
    }
    createRegistration(body) {
        return this.regService.create(body);
    }
    checkStatus(query) {
        return this.regService.checkStatus(query);
    }
    getRegistration(id) {
        return this.regService.findOne(id);
    }
    getRegistrations(query) {
        return this.regService.findAll(query);
    }
    approveOrReject(body, req) {
        const user = req.user;
        return this.regService.approveOrReject(body, user.userId);
    }
    saveAdminNote(body, req) {
        const user = req.user;
        return this.regService.saveNote(body, user.userId);
    }
    async exportCsv(res, req) {
        const user = req.user;
        const csv = await this.regService.generateCsvData(user.userId);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="registrations-${Date.now()}.csv"`);
        res.send(csv);
    }
};
exports.RegistrationsController = RegistrationsController;
__decorate([
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 10 } }),
    (0, common_1.Post)('registrations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_registration_dto_1.CreateRegistrationDto]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "createRegistration", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { ttl: 60000, limit: 20 } }),
    (0, common_1.Get)('registrations/status'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "checkStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    (0, common_1.Get)('registrations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "getRegistration", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    (0, common_1.Get)('admin/registrations'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_query_dto_1.FindAllQueryDto]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "getRegistrations", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    (0, common_1.Post)('admin/action'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_action_dto_1.AdminActionDto, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "approveOrReject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'STAFF'),
    (0, common_1.Post)('admin/note'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_action_dto_1.AdminNoteDto, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "saveAdminNote", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('admin/export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegistrationsController.prototype, "exportCsv", null);
exports.RegistrationsController = RegistrationsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [registrations_service_1.RegistrationsService])
], RegistrationsController);
//# sourceMappingURL=registrations.controller.js.map