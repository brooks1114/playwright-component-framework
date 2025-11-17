// scripts/update-vehicle-data.ts
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { VEHICLE_DEFAULTS } from "../../types/vehicle-schema";

const DATA_DIR = resolve(__dirname, "../data/vehicles");

readdirSync(DATA_DIR)
  .filter((f) => f.endsWith(".json"))
  .forEach((file) => {
    const path = resolve(DATA_DIR, file);
    const data = JSON.parse(readFileSync(path, "utf-8"));
    const updated = { ...VEHICLE_DEFAULTS, ...data };
    if (JSON.stringify(updated) !== JSON.stringify(data)) {
      writeFileSync(path, JSON.stringify(updated, null, 2) + "\n");
      console.log(`Updated: ${file}`);
    }
  });
