#!/usr/bin/env node

import { rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const tempDir = os.tmpdir();
const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const patternPath = path.join(tempDir, `strudel-smoke-${suffix}.js`);
const wavPath = path.join(tempDir, `strudel-smoke-${suffix}.wav`);
const renderScript = path.resolve("src/runtime/render.mjs");

try {
  writeFileSync(patternPath, "stack(s('bd sd'), note('c3 e3 g3'))\n", "utf8");

  const run = spawnSync(
    process.execPath,
    [renderScript, patternPath, wavPath, "2", "120"],
    { stdio: "inherit" }
  );

  if (run.status !== 0) {
    throw new Error(`render.mjs exited with status ${run.status}`);
  }

  const stats = statSync(wavPath);
  if (stats.size <= 1000) {
    throw new Error(`WAV output too small: ${stats.size} bytes`);
  }

  console.log(`Smoke test passed: ${wavPath} (${stats.size} bytes)`);
} finally {
  rmSync(patternPath, { force: true });
  rmSync(wavPath, { force: true });
}

