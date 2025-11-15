// types/vehicle-schema.ts
export interface VehicleData {
    make: string;
    model: string;
    year: string;
    color: string;
    vin: string;
    mileage: string;
    fuelType: string;
    transmission: string;
    engine: string;
    driveType: string;
    warranty?: string;
    certifiedPreOwned?: boolean;
}

export const VEHICLE_DEFAULTS: Partial<VehicleData> = {
    warranty: 'None',
    certifiedPreOwned: false,
};