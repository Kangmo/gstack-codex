import { describe, test, expect } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(import.meta.dir, '..');

describe('Codex-first port layout', () => {
  test('repo-local Codex skill tree exists for shared CLI/App discovery', () => {
    expect(fs.existsSync(path.join(ROOT, '.agents', 'skills', 'gstack', 'SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, '.agents', 'skills', 'gstack-ship', 'SKILL.md'))).toBe(true);
  });

  test('repo-local Codex skills include openai metadata for App UX', () => {
    expect(fs.existsSync(path.join(ROOT, '.agents', 'skills', 'gstack', 'agents', 'openai.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, '.agents', 'skills', 'gstack-ship', 'agents', 'openai.yaml'))).toBe(true);
  });

  test('gitignore does not hide repo-local Codex skills in this Codex-first fork', () => {
    const ignoredLines = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf-8')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    expect(ignoredLines).not.toContain('.agents/');
    expect(ignoredLines).not.toContain('.agents');
  });
});
