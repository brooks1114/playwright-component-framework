// ---------------------------------------------------------------------------
// FILE: tools/validate-testdata.ts  (same script you already have;
// this just shows it’s compatible with folderOfSingles)
// ---------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import { TESTDATA_REGISTRY, SourceKind } from "../src/types/testdata-registry";

type ValidationResult = {
  component: string;
  dataPath: string;
  ok: boolean;
  error?: string;
};

function readJson(filePath: string): unknown {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf-8");
  return JSON.parse(raw);
}

function validateArrayFile(entry: any, filePath: string): ValidationResult[] {
  const json = readJson(filePath);
  const arraySchema = entry.schema.array();
  const parsed = arraySchema.safeParse(json);

  if (!parsed.success) {
    return [
      {
        component: entry.name,
        dataPath: filePath,
        ok: false,
        error: JSON.stringify(parsed.error.format(), null, 2),
      },
    ];
  }

  return [
    {
      component: entry.name,
      dataPath: filePath,
      ok: true,
    },
  ];
}

function validateSingleFile(entry: any, filePath: string): ValidationResult[] {
  const json = readJson(filePath);
  const parsed = entry.schema.safeParse(json);

  if (!parsed.success) {
    return [
      {
        component: entry.name,
        dataPath: filePath,
        ok: false,
        error: JSON.stringify(parsed.error.format(), null, 2),
      },
    ];
  }

  return [
    {
      component: entry.name,
      dataPath: filePath,
      ok: true,
    },
  ];
}

function validateFolderOfSingles(
  entry: any,
  folderPath: string
): ValidationResult[] {
  const absFolder = path.resolve(folderPath);
  const files = fs
    .readdirSync(absFolder)
    .filter((f) => f.toLowerCase().endsWith(".json"));

  const results: ValidationResult[] = [];

  for (const file of files) {
    const fullPath = path.join(absFolder, file);
    const json = readJson(fullPath);
    const parsed = entry.schema.safeParse(json);

    if (!parsed.success) {
      results.push({
        component: entry.name,
        dataPath: fullPath,
        ok: false,
        error: JSON.stringify(parsed.error.format(), null, 2),
      });
    } else {
      results.push({
        component: entry.name,
        dataPath: fullPath,
        ok: true,
      });
    }
  }

  return results;
}

function validateEntry(entry: any): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const p of entry.paths) {
    switch (entry.kind as SourceKind) {
      case "arrayFile":
        results.push(...validateArrayFile(entry, p));
        break;

      case "singleFile":
        results.push(...validateSingleFile(entry, p));
        break;

      case "folderOfSingles":
        results.push(...validateFolderOfSingles(entry, p));
        break;

      default:
        results.push({
          component: entry.name,
          dataPath: p,
          ok: false,
          error: `Unknown source kind: ${entry.kind}`,
        });
    }
  }

  return results;
}

function main() {
  const allResults: ValidationResult[] = [];

  for (const entry of TESTDATA_REGISTRY) {
    allResults.push(...validateEntry(entry));
  }

  const failures = allResults.filter((r) => !r.ok);
  const successes = allResults.filter((r) => r.ok);

  console.log("=== Test Data Validation Results ===");
  console.log(`✅ OK:  ${successes.length}`);
  console.log(`❌ Bad: ${failures.length}`);
  console.log("");

  for (const fail of failures) {
    console.error(`Component: ${fail.component}`);
    console.error(`Source:    ${fail.dataPath}`);
    console.error(`Error:`);
    console.error(fail.error);
    console.error("--------------------------------------------------");
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
