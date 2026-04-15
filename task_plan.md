# Task Plan: Port gstack from Claude to Codex

## Goal
Port the upstream `gstack` project to work with Codex, ideally with one shared codepath for Codex CLI and Codex App, with tests added first and passing locally.

## Phases
- [x] Phase 1: Plan and setup
- [x] Phase 2: Research harness requirements and upstream design
- [ ] Phase 3: Define detailed port plan and test plan
- [ ] Phase 4: Write failing tests for Codex port
- [ ] Phase 5: Implement Codex port
- [ ] Phase 6: Verify, fix, and deliver

## Key Questions
1. What are the current Codex harness requirements and constraints from official OpenAI docs?
2. Which parts of `gstack` are Claude-specific versus provider-agnostic?
3. Can Codex CLI and Codex App share one transport / integration layer, or do they require separate adapters?
4. What test surface is needed to keep the port stable?

## Decisions Made
- Use `planning-with-files` workflow for persistent execution state and research notes.
- Prefer one shared Codex integration path first; fall back to Codex CLI-first only if the APIs or runtime constraints force divergence.
- Treat repo-local `.agents/skills` as the shared skill surface for Codex CLI and Codex App.
- Keep CLI-global install compatibility, but do not couple the shared port to Claude-only layout assumptions.
- Use the locally installed `codex-cli 0.120.0` behavior as a validation target alongside official docs.

## Errors Encountered
- Upstream verification initially failed because `bun` was not installed locally; resolved by installing Bun.
- Upstream free test run exposed current breakages: stale golden fixtures, missing generated Codex artifacts on fresh clone, version mismatch between `package.json` and `VERSION`, and setup/build incompatibility with current Bun CLI behavior.

## Status
**Currently in Phase 3** - Writing the detailed port plan and preparing Codex-first tests before importing and fixing the upstream code.
