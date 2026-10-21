# Agent instructions

pnpm workspaces + Turborepo monorepo.

- `packages/pixelvision`: the published library. No runtime dependencies, no DOM or Node APIs in
  `src`: it must run in browsers, workers, Node and React Native (Hermes).
- `packages/parity`: private. Runs every ported function and jsfeat 0.0.8 on the same seeded
  fixtures and compares the output.

## Rules

- Every public function: TSDoc with `@param`, `@returns`, `@throws` and an `@example`; option types
  in a sibling `.model.ts`.
- Every public function has unit tests (coverage threshold is 100%) and, when jsfeat has an
  equivalent, a parity test. Prove a new parity test can fail by breaking the implementation once.
- Integer output must be identical to jsfeat. Float output may differ within a documented tolerance.
  Deliberate differences from jsfeat (bug fixes, wider input support) are recorded in
  `docs/jsfeat-differences.md` and the "Migrating from jsfeat" guide only.
- pixelvision is its own product. User-facing text (READMEs, the docs site, TSDoc, which feeds
  the API reference) describes what a function does and guarantees, without comparing it to
  jsfeat. A short note that results match OpenCV is fine where that helps users.
- Conventional Commits. No AI attribution anywhere.
- `pnpm check` must pass before committing.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
