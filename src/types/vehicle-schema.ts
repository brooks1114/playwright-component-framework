// ---------------------------------------------------------------------------
// FILE: src/types/vehicle.schema.ts
// ---------------------------------------------------------------------------

import { z } from "zod";

export const VehicleSchema = z.object({
  vin: z.string().min(1, "vin is required"),
  year: z
    .number()
    .int()
    .min(1900, "year must be >= 1900")
    .max(new Date().getFullYear() + 1, "year is too far in the future"),
  make: z.string().min(1, "make is required"),
  model: z.string().min(1, "model is required"),

  // You can keep adding strict rules for all ~75 props:
  // bodyStyle: z.enum(["Sedan", "SUV", "Truck", "Coupe", "Van"]),
  // mileage: z.number().int().nonnegative(),
  // color: z.string(),
  // isElectric: z.boolean(),
  // ...
});

export type VehicleData = z.infer<typeof VehicleSchema>;
