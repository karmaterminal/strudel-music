// The Claude Code plugin (#71): the marketplace at .claude-plugin/marketplace.json lists one
// plugin under plugins/, whose skill sets up a working copy of this repository and follows that
// copy's SKILL.md. These checks keep it installable, and keep the repository root publishable to
// ClawHub. `claude plugin validate --strict` checks the manifests against Claude Code's schema.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), 'utf8'));
const marketplace = readJson('.claude-plugin/marketplace.json');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? [full, ...walk(full)] : [full];
  });
}

// The frontmatter as key → value, one key per line.
function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, 'SKILL.md has no frontmatter');
  return Object.fromEntries(match[1].split('\n').map((line) => {
    const at = line.indexOf(':');
    return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^"(.*)"$/, '$1')];
  }));
}

const plugins = marketplace.plugins.map((entry) => {
  const dir = path.join(root, entry.source);
  const skillsDir = path.join(dir, 'skills');
  const skills = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  return { entry, dir, skills: skills.map((name) => ({ name, file: path.join(skillsDir, name, 'SKILL.md') })) };
});

test('the marketplace names each plugin and where it is', () => {
  assert.equal(marketplace.name, 'strudel-music');
  assert.ok(marketplace.owner?.name, 'the marketplace has no owner.name');
  assert.ok(plugins.length > 0, 'the marketplace lists no plugins');
  for (const { entry, dir } of plugins) {
    assert.match(entry.source, /^\.\/plugins\/[a-z0-9-]+$/, `${entry.name}: source must be ./plugins/<name>`);
    const manifest = JSON.parse(readFileSync(path.join(dir, '.claude-plugin/plugin.json'), 'utf8'));
    assert.equal(manifest.name, entry.name, `${entry.source}: plugin.json names another plugin`);
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/, `${entry.name}: version must be x.y.z`);
  }
});

test('each skill is named after its folder', () => {
  for (const { entry, skills } of plugins) {
    assert.ok(skills.length > 0, `${entry.name} has no skills`);
    for (const skill of skills) {
      const fields = frontmatter(readFileSync(skill.file, 'utf8'));
      assert.equal(fields.name, skill.name, `${skill.file}: name doesn't match its folder`);
      assert.ok(fields.description, `${skill.file}: no description`);
      assert.ok(fields.description.length <= 1024, `${skill.file}: description over 1024 characters`);
    }
  }
});

test('the repository root still publishes to ClawHub', () => {
  // ClawHub refuses a skill folder that looks like a plugin. A root marketplace.json is fine.
  for (const file of ['.claude-plugin/plugin.json', 'openclaw.plugin.json', '.codex-plugin/plugin.json',
    '.cursor-plugin/plugin.json']) {
    assert.equal(existsSync(path.join(root, file)), false, `${file} makes ClawHub refuse the repository`);
  }
  assert.equal('openclaw' in readJson('package.json'), false, 'an openclaw key in package.json makes ClawHub refuse it');
});

test('the plugin skill points at the working copy instead of copying it', () => {
  const rootHeadings = readFileSync(path.join(root, 'SKILL.md'), 'utf8').match(/^## .+$/gm);
  for (const { dir, skills } of plugins) {
    // The plugin cache copy may not keep a symlink.
    for (const file of walk(dir)) {
      assert.equal(lstatSync(file).isSymbolicLink(), false, `${path.relative(root, file)} is a symlink`);
    }
    for (const skill of skills) {
      const text = readFileSync(skill.file, 'utf8');
      assert.ok(text.includes('${CLAUDE_PLUGIN_DATA}/strudel-music/SKILL.md'),
        `${path.relative(root, skill.file)} doesn't read the working copy's SKILL.md`);
      for (const heading of rootHeadings) {
        assert.equal(text.split('\n').includes(heading), false,
          `${path.relative(root, skill.file)} repeats the root SKILL.md's "${heading}"`);
      }
    }
  }
});

test('Claude Code leaves the skill text as written', () => {
  // When it loads a skill, Claude Code puts the arguments in place of $ARGUMENTS, $ARGUMENTS[n]
  // and $0, $1..., and runs any !`command` or ```! block. ${CLAUDE_PLUGIN_DATA} is meant to be
  // filled in.
  for (const { skills } of plugins) {
    for (const skill of skills) {
      const text = readFileSync(skill.file, 'utf8');
      const name = path.relative(root, skill.file);
      assert.doesNotMatch(text, /\$ARGUMENTS|\$\d/, `${name} has an argument placeholder`);
      assert.doesNotMatch(text, /(^|\s)!`|```!/m, `${name} has a command Claude Code would run on load`);
    }
  }
});

test('a command with the data path stops if Claude Code left it unfilled', () => {
  // Unfilled, bash would read ${CLAUDE_PLUGIN_DATA} as empty and point the command at /.
  for (const { skills } of plugins) {
    for (const skill of skills) {
      const text = readFileSync(skill.file, 'utf8');
      for (const block of text.match(/```bash\n[\s\S]*?```/g) ?? []) {
        if (!block.includes('${CLAUDE_PLUGIN_DATA}')) continue;
        assert.match(block, /^```bash\nset -u\b/, `${path.relative(root, skill.file)}: a block using the data path doesn't start with set -u`);
      }
    }
  }
});
