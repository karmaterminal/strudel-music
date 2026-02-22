#!/usr/bin/env node

// smoke-test.mjs — Quick validation that the render pipeline works.
// Creates a minimal pattern, renders it, and verifies WAV output.

import { execFileSync } from "node:child_process";
import { existsSync, unlinkSync, statSync, writeFileSync, mkdtempSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const tmpDir = mkdtempSync(path.join(os.tmpdir(), "strudel-smoke-"));
const testPattern = path.join(tmpDir, "test-pattern.js");
const testOutput = path.join(tmpDir, "test-output.wav");

// Minimal Strudel pattern — single note
writeFileSync(testPattern, `note("c3").s("sine")`);

console.log("Smoke test: rendering minimal pattern...");

try {
  const result = execFileSync(
    "node",
    [path.resolve("src/runtime/render.mjs"), testPattern, testOutput, "2", "120"],
    { cwd: process.cwd(), timeout: 30000, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );
  console.log(result);
} catch (err) {
  console.error("Render stderr:", err.stderr);
  console.error("Render stdout:", err.stdout);
  throw new Error(`render.mjs exited with status ${err.status}`);
}

if (!existsSync(testOutput)) {
  throw new Error("No WAV output produced");
}

const stat = statSync(testOutput);
console.log(`Output: ${testOutput} (${stat.size} bytes)`);

if (stat.size < 100) {
  throw new Error(`WAV file suspiciously small: ${stat.size} bytes`);
}

// Verify WAV header
const { readFileSync } = await import("node:fs");
const header = readFileSync(testOutput).subarray(0, 12);
const riff = header.toString("ascii", 0, 4);
const wave = header.toString("ascii", 8, 12);

if (riff !== "RIFF" || wave !== "WAVE") {
  throw new Error(`Invalid WAV header: ${riff}...${wave}`);
}

console.log("✅ Smoke test passed — valid WAV file produced");

// Cleanup
unlinkSync(testPattern);
unlinkSync(testOutput);
