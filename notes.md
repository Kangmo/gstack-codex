# Notes: gstack Codex Port

## Sources

### Official docs: Harness engineering article
- URL: https://openai.com/index/harness-engineering/
- Date on page: February 11, 2026
- Key points:
  - Keep `AGENTS.md` short and use it as a table of contents into richer in-repo docs.
  - Versioned plans and docs should live in the repository so Codex can discover them in-context.
  - Worktrees, local observability, and runnable validation loops materially improve agent reliability.
  - Human leverage shifts from typing code to designing scaffolding, constraints, and feedback loops.

### Official docs: Codex AGENTS.md guide
- URL: https://developers.openai.com/codex/guides/agents-md
- Key points:
  - Codex discovers global and nested `AGENTS.md` / `AGENTS.override.md` files hierarchically.
  - Combined project instruction loading is capped by `project_doc_max_bytes` (32 KiB by default).
  - `CODEX_HOME` can be redirected for isolated profiles and automation runs.

### Official docs: Codex skills
- URL: https://developers.openai.com/codex/skills
- Key points:
  - Skills are officially available in Codex CLI, IDE extension, and Codex App.
  - Skills use progressive disclosure: metadata first, full `SKILL.md` only when invoked.
  - Repo-local discovery uses `.agents/skills` from the current working directory up to the repo root.
  - `agents/openai.yaml` provides Codex App UI metadata and invocation policy.

### Official docs: Codex rules
- URL: https://developers.openai.com/codex/rules
- Key points:
  - Rules are experimental and govern command escalation outside the sandbox.
  - Rules are loaded from Codex config layers and can define allow/prompt/forbidden prefix rules.

### Official docs: Codex hooks
- URL: https://developers.openai.com/codex/hooks
- Key points:
  - Hooks live in `~/.codex/hooks.json` and repo-local `.codex/hooks.json`.
  - Multiple matching hooks run; repo-local hooks should resolve from git root for stability.

### Official docs: Codex app commands
- URL: https://developers.openai.com/codex/app/commands
- Key points:
  - Enabled skills appear in the Codex App slash-command list.
  - App deeplinks and slash commands are first-class; explicit skill mentions use `$skill`.

### Official docs: Codex app server
- URL: https://developers.openai.com/codex/app-server
- Key points:
  - App server exposes thread and command execution APIs.
  - `externalAgentConfig/detect` / `import` can migrate `CLAUDE.md` to `AGENTS.md` and copy skills.
  - Auth can come from ChatGPT or API keys; app-server can also run without OpenAI auth depending on provider.

### Official docs: How OpenAI uses Codex
- URL: https://cdn.openai.com/pdf/6a2631dc-783e-479b-b1a4-af0cfbd38630/how-openai-uses-codex.pdf
- Key points:
  - Best practice is plan first, then execute.
  - Codex benefits from startup scripts, env vars, and internet configuration.
  - `AGENTS.md` is the persistent context layer for repo-specific conventions.

### Upstream source: gstack
- URL: https://github.com/garrytan/gstack
- Commit inspected: `23000672673224f04a5d0cb8d692356069c95f6a`
- Key points:
  - Upstream is already multi-host, not Claude-only. It has `hosts/codex.ts`, a Codex E2E suite, and Codex-specific skill generation.
  - The host abstraction is declarative via `HostConfig`, with content rewrites, metadata generation, and install behaviors per host.
  - Codex support centers on generated `.agents/skills/gstack-*` skill folders plus a minimal runtime root under `~/.codex/skills/gstack`.
  - Setup creates a `.agents/skills/gstack` sidecar with runtime symlinks for shared assets.
  - The browse binary and most workflow logic are host-agnostic; the main host-specific surface is skill generation/install layout.
  - Fresh-clone upstream verification currently exposes drift and portability issues.

### Local environment verification
- `codex --version`: `codex-cli 0.120.0`
- Observed local Codex directories:
  - `~/.codex/skills` exists and is actively used on this machine.
  - `~/.agents` exists, but `~/.agents/skills` is not populated here.
- Implication:
  - Official docs emphasize `.agents/skills`, but the current local CLI install still uses `~/.codex/skills` in practice.
  - The safest port is dual-surface: repo-local `.agents/skills` for shared discovery plus CLI-global compatibility for `~/.codex/skills`.

## Synthesized Findings

### Harness constraints
- Codex App and CLI can share the same skill definitions if they live in repo-local `.agents/skills`.
- Codex App adds environment/worktree affordances, but the reusable workflow layer is still `SKILL.md` + optional `agents/openai.yaml`.
- `AGENTS.md` should stay compact and point to deeper docs or generated artifacts.

### Upstream architecture
- gstack’s heavy lifting is already host-neutral: browser daemon, design CLI, worktree support, and the template generator.
- The real Claude coupling is in generated skill text, install layout, and a few path/tool rewrites.
- Upstream’s Codex host is mature enough to use as the base port rather than rewriting from scratch.

### Port gaps to fix
- A fresh clone does not immediately expose generated Codex repo-local artifacts.
- Some tests assume generated artifacts exist, but the repo does not ship them.
- Current Bun behavior breaks upstream `setup` flows that rely on older build invocation semantics.
- Source-of-truth drift exists between version files, golden files, and generated outputs.

### Port direction
- Build a Codex-first fork around the existing host abstraction instead of deleting upstream architecture.
- Keep shared `.agents/skills` artifacts as the canonical repo-local interface for both Codex CLI and App.
- Preserve `~/.codex/skills` install compatibility because the locally installed CLI still uses it.
