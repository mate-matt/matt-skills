#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const skillPath = process.argv[2];

if (!skillPath) {
  fail("Usage: bun run scripts/validate-skill.mjs <skill-directory>");
}

const skillMd = join(skillPath, "SKILL.md");
if (!existsSync(skillMd)) {
  fail(`SKILL.md not found: ${skillMd}`);
}

const content = readFileSync(skillMd, "utf8");
if (!content.startsWith("---\n")) {
  fail("SKILL.md must start with YAML frontmatter");
}

const match = content.match(/^---\n([\s\S]*?)\n---/);
if (!match) {
  fail("SKILL.md frontmatter must be closed with ---");
}

const frontmatter = parseFlatYaml(match[1]);
const allowedKeys = new Set(["name", "description"]);
const keys = Object.keys(frontmatter);

for (const key of keys) {
  if (!allowedKeys.has(key)) {
    fail(`Unexpected frontmatter key "${key}". Allowed keys: name, description`);
  }
}

const name = frontmatter.name?.trim();
const description = frontmatter.description?.trim();

if (!name) fail("Missing frontmatter field: name");
if (!description) fail("Missing frontmatter field: description");
if (!/^[a-z0-9-]+$/.test(name)) {
  fail(`Invalid skill name "${name}". Use lowercase letters, digits, and hyphens only.`);
}
if (name.startsWith("-") || name.endsWith("-") || name.includes("--")) {
  fail(`Invalid skill name "${name}". Do not start/end with hyphen or use consecutive hyphens.`);
}
if (name.length > 64) {
  fail(`Skill name is too long (${name.length}); maximum is 64 characters.`);
}
if (basename(skillPath) !== name) {
  fail(`Skill folder name "${basename(skillPath)}" must match frontmatter name "${name}".`);
}
if (description.length < 40) {
  fail("Description should be descriptive enough to trigger the skill.");
}

if (name === "matt-pic-grab-image") {
  const scriptPath = join(skillPath, "scripts", "grab-image.ts");
  if (!existsSync(scriptPath)) {
    fail(`Expected bundled script not found: ${scriptPath}`);
  }

  const policyPath = join(skillPath, "references", "source-policy.md");
  if (!existsSync(policyPath)) {
    fail(`Expected source policy not found: ${policyPath}`);
  }
}

if (name === "fx-brief-material-renderer") {
  if (!content.includes("@mate-matt/fxbrief")) {
    fail("fx-brief-material-renderer should document the @mate-matt/fxbrief CLI fallback.");
  }
  if (!content.includes("npx playwright install chromium")) {
    fail("fx-brief-material-renderer should document Chromium installation for Playwright.");
  }
}

console.log(`Skill is valid: ${name}`);

function parseFlatYaml(source) {
  const output = {};
  let currentKey = null;

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyValue) {
      currentKey = keyValue[1];
      output[currentKey] = unquote(keyValue[2] ?? "");
      continue;
    }

    if (/^\s+/.test(rawLine) && currentKey) {
      output[currentKey] += ` ${line.trim()}`;
      continue;
    }

    fail(`Unsupported YAML line in frontmatter: ${rawLine}`);
  }

  return output;
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
