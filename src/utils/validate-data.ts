// utils/validate-data.ts
import type { VehicleData } from "../types/vehicle-schema";

export function assertValidVehicle(data: any): asserts data is VehicleData {
  const required = ["make", "model", "year", "vin"];
  for (const key of required) {
    if (!(key in data)) throw new Error(`Missing required field: ${key}`);
  }
}
