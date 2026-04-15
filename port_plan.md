# Port Plan: gstack to Codex

## Goal
Create a Codex-first fork of `gstack` that works reliably with current Codex CLI, keeps one shared repo-local skill surface for Codex CLI and Codex App where possible, and has a repeatable test story.

## Compatibility Strategy

### Primary target
- Use repo-local `.agents/skills` as the shared skill surface for Codex CLI and Codex App.
- Keep `agents/openai.yaml` metadata for App UX and implicit invocation hints.
- Preserve CLI-global install support through `~/.codex/skills/gstack` because the local `codex-cli 0.120.0` installation still uses that path in practice.

### App support stance
- Shared skill definitions are feasible for CLI and App because official docs say Codex skills are available in both products.
- App-specific affordances such as local environment actions and worktrees are additive, not a separate skill format.
- If App-only environment automation proves unverifiable from the available docs and local environment, ship the CLI path first with repo-local `.agents/skills` intact so App can still discover the same skills inside the repo.

## Detailed Step-by-Step Plan

### Phase 1: Establish the Codex port baseline
1. Clone upstream `gstack` and pin the inspected upstream commit in notes.
2. Verify the local Codex CLI version and actual on-disk skill locations.
3. Verify official Codex docs for:
   - AGENTS discovery and limits
   - skill discovery and metadata
   - hook/rule locations
   - app behavior relevant to shared skill usage
4. Decide the shared portability model:
   - repo-local `.agents/skills` is canonical
   - global `~/.codex/skills` remains a CLI compatibility layer
5. Record observed upstream failures on a fresh clone.

### Phase 2: Import upstream into this repo
1. Copy the upstream project into the current repository, excluding upstream `.git`.
2. Preserve local planning files already created for this task.
3. Verify the imported tree structure matches the upstream source.
4. Confirm the imported repo is Codex-first in this fork’s plan and notes.

### Phase 3: Write tests first for the ported behavior
1. Add or update tests that define the desired Codex-first behavior before changing implementation.
2. Test the shared repository layout:
   - repo-local `.agents/skills` artifacts exist or are generated deterministically
   - Codex metadata files exist where required
   - shared runtime references point to `.agents/skills/gstack/...`
3. Test the CLI install behavior:
   - setup still provisions a minimal `~/.codex/skills/gstack` runtime root
   - generated Codex skills are linked from the Codex output, not Claude source dirs
4. Test current toolchain compatibility:
   - build/setup commands work with the installed Bun version
   - setup tests no longer hang because of obsolete Bun CLI usage
5. Test repository consistency:
   - `package.json` version matches `VERSION`
   - golden fixtures match generated skill outputs
   - uninstall behavior matches the intended user-facing output
6. Keep tests scoped and deterministic so free test runs catch Codex regressions without paid E2E runs.

### Phase 4: Implement the Codex-first fixes
1. Fix source-of-truth drift:
   - align `package.json` and `VERSION`
   - refresh golden fixtures after intentional generated-skill changes
2. Fix generated artifact availability:
   - ensure `.agents/skills` Codex artifacts are available in the repo or generated in a deterministic, tested way before tests/setup depend on them
   - keep `agents/openai.yaml` metadata present for Codex App/skill UX
3. Fix Bun compatibility:
   - update `bun build --compile` invocation patterns to the current Bun CLI syntax
   - ensure setup scripts fail fast instead of hanging when build fails
4. Fix test/setup assumptions:
   - adjust tests that require generated Codex or Factory artifacts to generate or locate them correctly
   - reconcile uninstall output expectations with actual uninstall behavior
5. Review shared-path references:
   - keep runtime asset references anchored under `.agents/skills/gstack/...`
   - avoid Claude-only path leakage in generated Codex skills
6. Preserve existing host abstraction unless a path is clearly dead code for the Codex-first fork.

### Phase 5: Validate the port locally
1. Run targeted unit suites for modified areas first:
   - `test/host-config.test.ts`
   - `test/gen-skill-docs.test.ts`
   - `test/uninstall.test.ts`
   - `test/team-mode.test.ts`
   - `test/worktree.test.ts`
2. Re-run the broader free suite:
   - `bun test browse/test/ test/ --ignore ...` or equivalent repo test command
3. If failures remain:
   - isolate by subsystem
   - patch the minimal root cause
   - rerun the affected test file immediately
   - rerun the free suite after the targeted fixes pass
4. Run Codex-specific optional verification if feasible in this environment:
   - regenerate Codex skill docs
   - run Codex-focused tests that do not require paid evals
   - if paid/interactive E2E is available and safe, run the Codex E2E subset

### Phase 6: Codex App follow-through
1. Confirm the shared `.agents/skills` layout is present in the repo for App discovery.
2. Confirm `agents/openai.yaml` metadata is generated and committed/available.
3. If practical, add repo documentation for Codex App usage:
   - open the repo in Codex App
   - ensure skills appear in slash commands
   - note any optional local-environment setup steps
4. If App-local automation remains unverified:
   - document that the same skills should be discoverable by App from `.agents/skills`
   - explicitly mark App-specific `.codex` local-environment automation as future work

## Test Plan

### Free deterministic tests
- Run `bun test` after the import and after each major fix batch.
- Prioritize these failure-prone suites:
  - `test/host-config.test.ts`
  - `test/gen-skill-docs.test.ts`
  - `test/team-mode.test.ts`
  - `test/uninstall.test.ts`
  - `test/worktree.test.ts`
- Add/update assertions for:
  - Codex generated skill presence
  - `agents/openai.yaml` generation
  - sidecar path correctness
  - setup behavior under current Bun
  - version consistency

### Codex-specific validation
- Verify `codex --version` and command availability.
- Verify generated skills can be discovered from the intended location(s).
- If the environment permits:
  - run `EVALS=1 bun test test/codex-e2e.test.ts`
- If not feasible:
  - explicitly report that Codex E2E remains unrun and why.

### Regression loop
1. Run the failing test file directly.
2. Fix the narrowest root cause.
3. Re-run that file.
4. Re-run the free suite.
5. Repeat until the free suite passes.

## Acceptance Criteria
- The repository contains a functioning Codex-first port of gstack.
- Repo-local `.agents/skills` is the shared artifact surface for Codex use.
- CLI install compatibility remains intact.
- Free local tests pass.
- Remaining Codex App-specific uncertainty, if any, is documented precisely rather than hand-waved.
