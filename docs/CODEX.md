# Codex Guide

This guide explains how `gstack` works in OpenAI Codex, what upstream already
supported, what this Codex-focused port adds, and how to invoke `gstack` skills
from Codex CLI and Codex App.

## Short Version

Upstream `gstack` already had partial native Codex support.

The important distinction is:

- `codex/` is a Claude-facing wrapper skill that shells out to Codex.
- The real native Codex integration lives in the Codex host config, generated
  `.agents/skills` output, `agents/openai.yaml`, and `./setup --host codex`.

This port hardens that support and makes the same generated Codex skill tree
usable for both Codex CLI and Codex App.

## What Upstream Already Supported

Upstream already included real Codex support in these places:

- `hosts/codex.ts`
  - Declares a native Codex host.
  - Uses `localSkillRoot: '.agents/skills/gstack'`.
  - Enables metadata generation with `openai.yaml`.

- `setup`
  - Supports `./setup --host codex`.
  - Generates `.agents/skills` output for Codex.
  - Installs generated skills into `~/.codex/skills`.

- `agents/openai.yaml`
  - Provides the root Codex metadata entry for `gstack`.

- `test/codex-e2e.test.ts`
  - Shows upstream already intended Codex CLI end-to-end coverage.

## What The `codex/` Folder Is

The `codex/` directory is not the main native Codex runtime surface.

It is a Claude skill that invokes Codex as a second-opinion tool. That is useful,
but it is different from native Codex host support.

So:

- `codex/` means Claude can call Codex.
- It does not, by itself, mean `gstack` is fully wired for native Codex usage.

## What This Port Adds

This port does not invent Codex support from zero. It makes the existing support
reliable, shared, and easier to use.

### Shared CLI/App code path

The generated repo-local `.agents/skills` tree is treated as the shared Codex
surface.

That means:

- Codex CLI can install from generated Codex skills.
- Codex App can use the same repo-local `.agents/skills` tree when the repo is open.

### Better metadata wiring

The global runtime root under `~/.codex/skills/gstack` now includes:

- `agents/openai.yaml`

That keeps root-level metadata available for Codex discovery and App-oriented UX.

### More deterministic setup

The Codex generation path in `setup` only regenerates `.agents/skills` when the
artifacts are missing or stale.

That reduces noisy rebuilds and keeps install behavior predictable.

### Repo-local Codex tree stays visible

The port stops `.gitignore` from hiding `.agents/` wholesale. Only the runtime
sidecars under `.agents/skills/gstack/*` are ignored.

That matters because the generated Codex skill tree is now a first-class part of
the repo layout.

### Regression coverage

The port adds tests that lock in:

- repo-local Codex skill discovery
- presence of `agents/openai.yaml`
- correct minimal global runtime root contents
- Codex-friendly install and build behavior

## Install For Codex

From a clone of this repo:

```bash
./setup --host codex
```

After install:

- generated Codex skills are available under `~/.codex/skills/gstack-*`
- the minimal runtime root is available under `~/.codex/skills/gstack`
- the shared repo-local Codex tree lives under `.agents/skills/gstack-*`

## Codex CLI vs Codex App

The practical model is:

- Codex CLI uses `~/.codex/skills`
- Codex App can use the repo-local `.agents/skills` tree when this repository is open

The point of this port is to keep those two paths aligned instead of maintaining
separate logic.

## How To Invoke `gstack` In Codex

In Codex, use the `gstack-*` skill names directly in your prompt.

Claude examples in the upstream README are often written like:

```text
/review
/qa
/ship
```

For Codex, the corresponding form is:

```text
Use gstack-review ...
Use gstack-qa ...
Use gstack-ship ...
```

The root metadata prompt is also valid:

```text
Use gstack to locate the bundled gstack skills.
```

When you already know the specific skill you want, calling it directly is clearer.

## Prompt Examples

### Planning

```text
Use gstack-office-hours to pressure-test this product idea before we build anything. Ask the forcing questions, write down the wedge, and stop at the plan.
```

```text
Use gstack-autoplan for this feature: add team invitations with email magic links. Produce the reviewed plan first, then implement it, then run the relevant tests.
```

```text
Use gstack-plan-eng-review on this implementation plan. Focus on architecture, data flow, edge cases, and test coverage gaps.
```

```text
Use gstack-plan-devex-review on this SDK onboarding plan. Focus on time-to-hello-world, friction points, and missing magical moments.
```

### Review and debugging

```text
Use gstack-review to review the current branch diff. Findings first, ordered by severity, with file references.
```

```text
Use gstack-investigate to debug why login intermittently fails in staging. Do root cause analysis first, then implement the fix, then verify it.
```

```text
Use gstack-cso to run a security audit on this repo. Prioritize concrete exploit scenarios, auth boundaries, secret handling, and CI/CD risks.
```

### QA and browser testing

```text
Use gstack-qa on https://staging.example.com. Test the signup flow end to end, fix bugs you find, and add regression coverage where appropriate.
```

```text
Use gstack-qa-only on https://staging.example.com. I want a bug report only, no code changes.
```

```text
Use gstack-benchmark to compare this branch against baseline performance and flag any regressions in load time or resource size.
```

### Shipping and docs

```text
Use gstack-document-release to update README, CONTRIBUTING, and any stale docs to match what was actually shipped on this branch.
```

```text
Use gstack-ship to run the release workflow for the current branch. Run checks, update release artifacts if needed, and prepare the PR.
```

```text
Use gstack-setup-deploy to configure deployment for this project, then use gstack-land-and-deploy after the PR is ready.
```

## End-to-End Example

If you want Codex to use the full `gstack` workflow for a feature, a good prompt is:

```text
Use gstack-autoplan for this feature: build a notifications center with unread state, mark-all-read, and email preferences. Implement the approved plan, run the relevant tests, use gstack-review on the diff, then use gstack-document-release to sync docs.
```

If you want a plan only:

```text
Use gstack-office-hours and then gstack-autoplan for a v2 API redesign. Save the plan and test plan, but do not implement anything yet.
```

If you want a fast bugfix workflow:

```text
Use gstack-investigate to find the root cause of the broken password reset flow, fix it, add regression coverage, and then use gstack-review on the resulting diff.
```

## Recommended Prompt Style

The most reliable structure is:

```text
Use gstack-<skill> to <goal>. Include any constraints, URLs, branches, or stop conditions.
```

Examples:

- `Use gstack-review to review the current branch diff. Findings first.`
- `Use gstack-qa on https://staging.example.com and fix bugs found.`
- `Use gstack-office-hours to sharpen this idea, then stop at the plan.`

## Summary

If you ask, "Does upstream already support Codex?"

The answer is:

- Yes, partially.

If you ask, "What does this port add?"

The answer is:

- It makes the Codex path more reliable, metadata-complete, test-guarded, and
  shared across Codex CLI and Codex App.
