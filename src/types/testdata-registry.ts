/* ============================================================================
 * FILE: src/types/testdata-registry.ts
 * - Registry of all test-data + schemas
 * - One entry per "contract" (not per JSON file)
//  This supports array JSON now, and can be easily extended later for
//  single-file or folder-of-singles (vehicles, etc.).
 * ============================================================================
 */

import { z } from "zod";
import { MatterDetailsSchema } from "./create-matter/matter-details-section.schema";
import { VehicleSchema } from "./vehicle-schema";

export type SourceKind =
  | "arrayFile" // JSON = [ { ... }, { ... } ]
  | "singleFile" // JSON = { ... }
  | "folderOfSingles"; // folder of *.json, each = { ... }

export interface TestDataEntry {
  name: string;
  schema: z.ZodTypeAny;
  kind: SourceKind;
  /**
   * For:
   *  - arrayFile / singleFile → each path is a file (relative to project root)
   *  - folderOfSingles        → each path is a folder containing *.json files
   */
  paths: string[];
}

export const TESTDATA_REGISTRY: TestDataEntry[] = [
  {
    name: "MatterDetailsSection",
    schema: MatterDetailsSchema,
    kind: "arrayFile",
    paths: [
      "./src/test-data/components/create-matter/matter-details-section.json",
    ],
  },
  {
    name: "Vehicle",
    schema: VehicleSchema,
    kind: "folderOfSingles",
    paths: ["./src/test-data/vehicles"], // folder with many vehicle-*.json
  },
];
