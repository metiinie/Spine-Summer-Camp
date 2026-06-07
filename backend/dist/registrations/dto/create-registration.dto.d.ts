export declare class CamperDto {
    firstName: string;
    lastName: string;
    age: number;
    dateOfBirth: string;
    gender: string;
    gradeLevel: string;
    schoolName: string;
    tShirtSize: string;
    height?: number;
    weight?: number;
}
export declare class ParentDto {
    primaryName: string;
    primaryRelationship: string;
    primaryPhone: string;
    primaryEmail: string;
    secondaryName?: string;
    secondaryPhone?: string;
    secondaryRelationship?: string;
    subCity: string;
    district: string;
    houseNumber?: string;
}
export declare class SessionDto {
    session: string;
}
export declare class MedicalDto {
    allergies?: string;
    conditions?: string;
    dietary?: string;
}
export declare class WaiverDto {
    liabilityRelease: boolean;
    mediaRelease: boolean;
    parentSignature: string;
    dateSigned?: string;
}
export declare class CreateRegistrationDto {
    camper: CamperDto;
    parent: ParentDto;
    session: SessionDto;
    medical?: MedicalDto;
    waiver?: WaiverDto;
}
