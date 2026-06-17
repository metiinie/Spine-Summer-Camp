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
exports.CreateRegistrationDto = exports.WaiverDto = exports.MedicalDto = exports.SessionDto = exports.ParentDto = exports.CamperDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const PHONE_PATTERN = /^\+?[0-9\s().-]{9,20}$/;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
class CamperDto {
    firstName;
    lastName;
    age;
    gender;
    gradeLevel;
    schoolName;
    tShirtSize;
    height;
    weight;
}
exports.CamperDto = CamperDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CamperDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CamperDto.prototype, "lastName", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(4),
    (0, class_validator_1.Max)(18),
    __metadata("design:type", Number)
], CamperDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['MALE', 'FEMALE']),
    __metadata("design:type", String)
], CamperDto.prototype, "gender", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CamperDto.prototype, "gradeLevel", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CamperDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['YOUTH_S', 'YOUTH_M', 'YOUTH_L', 'ADULT_S', 'ADULT_M', 'ADULT_L', 'ADULT_XL']),
    __metadata("design:type", String)
], CamperDto.prototype, "tShirtSize", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value != null ? Math.round(Number(value)) : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(220),
    __metadata("design:type", Number)
], CamperDto.prototype, "height", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value != null ? Math.round(Number(value)) : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(150),
    __metadata("design:type", Number)
], CamperDto.prototype, "weight", void 0);
class ParentDto {
    primaryName;
    primaryRelationship;
    primaryPhone;
    primaryEmail;
    secondaryName;
    secondaryPhone;
    secondaryRelationship;
    subCity;
    district;
    houseNumber;
}
exports.ParentDto = ParentDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], ParentDto.prototype, "primaryName", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], ParentDto.prototype, "primaryRelationship", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.Matches)(PHONE_PATTERN, { message: 'Invalid primary phone number' }),
    __metadata("design:type", String)
], ParentDto.prototype, "primaryPhone", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ParentDto.prototype, "primaryEmail", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], ParentDto.prototype, "secondaryName", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, class_validator_1.Matches)(PHONE_PATTERN, { message: 'Invalid secondary phone number' }),
    __metadata("design:type", String)
], ParentDto.prototype, "secondaryPhone", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], ParentDto.prototype, "secondaryRelationship", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ParentDto.prototype, "subCity", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ParentDto.prototype, "district", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], ParentDto.prototype, "houseNumber", void 0);
class SessionDto {
    session;
    packageType;
    selectedActivities;
}
exports.SessionDto = SessionDto;
__decorate([
    (0, class_validator_1.IsIn)(['HALF_DAY', 'FULL_DAY']),
    __metadata("design:type", String)
], SessionDto.prototype, "session", void 0);
__decorate([
    (0, class_validator_1.IsIn)([
        'FULL_PACKAGE_FULL_DAY',
        'FULL_PACKAGE_HALF_DAY',
        'MIXED_PACKAGE',
        'SELF_PACKAGE',
    ]),
    __metadata("design:type", String)
], SessionDto.prototype, "packageType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsIn)(['FOOTBALL', 'SWIMMING', 'CYCLING', 'CULTURAL_DANCE', 'KARATE'], {
        each: true,
    }),
    __metadata("design:type", Array)
], SessionDto.prototype, "selectedActivities", void 0);
class MedicalDto {
    allergies;
    conditions;
    dietary;
}
exports.MedicalDto = MedicalDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], MedicalDto.prototype, "allergies", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], MedicalDto.prototype, "conditions", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], MedicalDto.prototype, "dietary", void 0);
class WaiverDto {
    liabilityRelease;
    mediaRelease;
    parentSignature;
    dateSigned;
}
exports.WaiverDto = WaiverDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.Equals)(true, { message: 'Liability release must be accepted' }),
    __metadata("design:type", Boolean)
], WaiverDto.prototype, "liabilityRelease", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WaiverDto.prototype, "mediaRelease", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], WaiverDto.prototype, "parentSignature", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], WaiverDto.prototype, "dateSigned", void 0);
class CreateRegistrationDto {
    camper;
    parent;
    session;
    medical;
    waiver;
    idempotencyKey;
}
exports.CreateRegistrationDto = CreateRegistrationDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CamperDto),
    __metadata("design:type", CamperDto)
], CreateRegistrationDto.prototype, "camper", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ParentDto),
    __metadata("design:type", ParentDto)
], CreateRegistrationDto.prototype, "parent", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SessionDto),
    __metadata("design:type", SessionDto)
], CreateRegistrationDto.prototype, "session", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MedicalDto),
    __metadata("design:type", MedicalDto)
], CreateRegistrationDto.prototype, "medical", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsNotEmptyObject)(),
    (0, class_transformer_1.Type)(() => WaiverDto),
    __metadata("design:type", WaiverDto)
], CreateRegistrationDto.prototype, "waiver", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(128),
    (0, class_validator_1.Matches)(IDEMPOTENCY_KEY_PATTERN, { message: 'Invalid idempotency key' }),
    __metadata("design:type", String)
], CreateRegistrationDto.prototype, "idempotencyKey", void 0);
//# sourceMappingURL=create-registration.dto.js.map