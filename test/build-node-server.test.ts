import { describe, test, expect } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(import.meta.dir, '..');
const BUILD_SCRIPT = fs.readFileSync(path.join(ROOT, 'browse', 'scripts', 'build-node-server.sh'), 'utf-8');

describe('Windows node-server build script', () => {
  test('uses outdir-based bundling so Bun can emit native assets', () => {
    expect(BUILD_SCRIPT).toContain('--outdir');
    expect(BUILD_SCRIPT).not.toContain('--outfile "$DIST_DIR/server-node.mjs"');
  });

  test('pins the entrypoint filename to server-node.mjs', () => {
    expect(BUILD_SCRIPT).toContain('--entry-naming server-node.mjs');
  });
});
