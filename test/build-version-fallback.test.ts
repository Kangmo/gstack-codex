import { describe, test, expect } from 'bun:test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(import.meta.dir, '..');

describe('build version stamping', () => {
  test('package build delegates version stamping to a helper script', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toContain('bash scripts/write-build-version.sh browse/dist/.version design/dist/.version');
    expect(pkg.scripts.build).not.toContain('git rev-parse HEAD > browse/dist/.version');
    expect(pkg.scripts.build).not.toContain('git rev-parse HEAD > design/dist/.version');
  });

  test('helper falls back to VERSION when git metadata is unavailable', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gstack-build-version-'));
    const browseVersion = path.join(tmpDir, 'browse.version');
    const designVersion = path.join(tmpDir, 'design.version');
    const expected = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf-8').trim();

    execSync(`bash scripts/write-build-version.sh "${browseVersion}" "${designVersion}"`, {
      cwd: ROOT,
      env: process.env,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    expect(fs.readFileSync(browseVersion, 'utf-8').trim()).toBe(expected);
    expect(fs.readFileSync(designVersion, 'utf-8').trim()).toBe(expected);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
