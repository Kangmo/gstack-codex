# Codex Support: Upstream vs This Port

## Short Answer

Yes, upstream `gstack` already had native Codex support, but it was only partial.

The `codex/` folder is **not** the main native Codex integration. It is a Claude
skill that shells out to Codex as a second-opinion tool. The real native Codex
integration lives in the host config, generated `.agents` skill tree, metadata,
and `setup --host codex` flow.

## What Upstream Already Supported

Upstream already included the following Codex support:

- `hosts/codex.ts`
  - Defines a real Codex host.
  - Uses `localSkillRoot: '.agents/skills/gstack'`.
  - Enables metadata generation with `openai.yaml`.

- `setup`
  - Supports `--host codex`.
  - Generates `.agents/skills` output for Codex.
  - Installs generated Codex-format skills into `~/.codex/skills`.

- `agents/openai.yaml`
  - Provides Codex metadata for the root gstack skill.

- `test/codex-e2e.test.ts`
  - Shows upstream already intended to test Codex CLI behavior.

## What The `codex/` Folder Actually Is

The `codex/` folder is a **Claude-facing wrapper skill**, not the native Codex
runtime surface.

- It is named `codex` in frontmatter.
- Its description says it is an "OpenAI Codex CLI wrapper".
- Its preamble still references `~/.claude/skills/gstack`.

So the folder means:

- Claude can call Codex.

It does **not** mean:

- gstack is fully ported to run natively inside Codex CLI or Codex App.

## What This Port Added

This port did not invent Codex support from scratch. It hardened and unified the
existing support so the same code path works cleanly for Codex CLI and Codex App.

### 1. Codex-first shared repo layout

The repo-local `.agents/skills` tree is now treated as the canonical shared
surface for Codex tooling.

- Added regression coverage to require repo-local Codex skill discovery.
- Added regression coverage to require App-oriented metadata in repo-local skills.

Result:

- Codex CLI can install from the generated Codex skills.
- Codex App can use the same repo-local `.agents/skills` tree when the repo is open.

### 2. `.gitignore` no longer hides the repo-local Codex tree

Upstream behavior could hide `.agents/`, which is the exact tree Codex needs.

This port changed ignore rules so:

- `.agents/` is not ignored wholesale.
- Only runtime sidecars under `.agents/skills/gstack/*` are ignored.

Result:

- The generated Codex skill tree stays visible in the repo.
- Shared CLI/App behavior is easier to reason about and test.

### 3. `setup` became more deterministic for Codex installs

The Codex generation path in `setup` was tightened so generated `.agents/skills`
artifacts are refreshed only when missing or stale.

Result:

- Less unnecessary regeneration.
- More predictable install behavior.
- Better alignment between local repo state and installed Codex artifacts.

### 4. Global Codex runtime root now includes metadata

This port ensured the installed runtime root at:

- `~/.codex/skills/gstack`

also exposes:

- `agents/openai.yaml`

Result:

- Codex CLI still works from the global install path.
- Codex App-style metadata/discovery now has a consistent root-level path too.

### 5. New regression tests for the shared Codex path

This port added tests that explicitly lock in the Codex-first layout and behavior,
including:

- repo-local `.agents/skills/gstack` exists
- repo-local `.agents/skills/gstack-ship` exists
- Codex skills include `agents/openai.yaml`
- `.gitignore` does not hide `.agents/`
- the minimal global runtime root includes only runtime assets plus metadata

Result:

- The port is protected against future regressions.

### 6. Build/install fixes that matter in Codex environments

This port also fixed adjacent issues that broke reliability during installation
and test execution:

- Added `scripts/write-build-version.sh`
  - Falls back to `VERSION` when git metadata is unavailable.
- Fixed `browse/scripts/build-node-server.sh`
  - Uses `--outdir` plus `--entry-naming` so Bun can emit native assets correctly.
- Added test escape hatch:
  - `GSTACK_SKIP_BROWSER_CHECK=1`
  - Used for setup-related tests where Playwright verification is not the thing
    being tested.

Result:

- Better behavior in non-git environments.
- More reliable build output.
- More stable Codex-focused test execution.

## Net Effect

Upstream `gstack` already supported Codex CLI in principle.

This port adds:

- a cleaner shared code path for Codex CLI and Codex App
- better repo-local discoverability
- correct metadata wiring
- more deterministic setup behavior
- stronger regression coverage
- better install/build reliability

## Practical Summary

If you ask, "Did upstream already support Codex?"

The answer is:

- Yes, partially.

If you ask, "What did this port add?"

The answer is:

- It made that support reliable, test-guarded, and shared across Codex CLI and
  Codex App instead of being mostly CLI-oriented and partially implicit.
