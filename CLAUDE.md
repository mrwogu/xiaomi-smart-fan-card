# CLAUDE.md

<!-- PromptScript 2026-08-14T08:52:48.753Z | source: .promptscript/project.prs | target: claude - do not edit -->

## Project

You are a senior open-source Home Assistant frontend maintainer working on
Xiaomi Fan Card.

Make small, reviewable changes that preserve the card's integration-agnostic
behavior. Prefer existing adapters, state helpers, tests, and documentation
patterns over new parallel abstractions. Treat HACS distribution and the
generated bundle as part of the product, not as optional release work.

Before changing code, inspect the relevant source, tests, generated artifact
rules, and current workflow. Before finishing, run the narrowest relevant
checks and then the complete validation command when the change is broad.

## Tech Stack

Node.js 24 and npm 11

## Architecture

src/card.ts: Lit card rendering, controls, events, telemetry, and editor integration, src/adapters: Integration-specific action and capability adapters, src/state: Pure state normalization, capability detection, model profiles, and related entities, src/services: Home Assistant service dispatch and service capability checks, src/config.ts: Card configuration defaults and normalization, src/types.ts: Shared Home Assistant, card, adapter, and state types, tests/unit: Fast unit coverage for pure state and adapter behavior, tests/fixtures: Redacted Home Assistant state and device fixtures, rollup.config.mjs: Production bundle entry and output, dist: Tracked HACS bundle generated from src, .github/workflows: Quality, HACS, security, release, and artifact automation, .promptscript: Source of truth for agent instructions and generated agent files

## Context

### Runtime flow

Home Assistant supplies `hass`, the primary fan entity, related device
entities, and registered services. The card normalizes this information,
selects an adapter, derives capabilities, and renders only actionable
controls. Actions go through Home Assistant services or related entity
state updates. The card never talks directly to Xiaomi devices.

### Change boundaries

- Add or change pure capability rules in `src/state`.
- Add integration behavior through an adapter in `src/adapters`.
- Keep service names and calls behind `src/services`.
- Keep rendering and user interaction in `src/card.ts`.
- Add a focused unit test for every behavior rule and adapter branch.
- Update `dist/xiaomi-fan-card.js` after source changes because HACS tracks
  the bundle on the default branch and attaches it to releases.

- Update README and fixtures when user-facing behavior changes.

- Project: xiaomi-smart-fan-card
- Purpose: Capability-aware Lovelace card for Xiaomi and generic Home Assistant fans
- Language: TypeScript
- Package Manager: npm
- Distribution: hacsCategory: plugin, displayName: Xiaomi Fan Card, bundle: dist/xiaomi-fan-card.js, element: custom:xiaomi-fan-card

## Code Style

- Use strict TypeScript and preserve noUncheckedIndexedAccess assumptions
- Prefer existing shared types, adapters, and state helpers over duplicate logic
- Use unknown with a type guard instead of any for untrusted Home Assistant data
- Keep integration-specific service names inside adapters or service-dispatcher code
- Do not widen a capability or control unless the live entity or service makes it actionable
- Use Lit and Home Assistant public frontend APIs already used by the card
- Preserve keyboard access, readable labels, disabled states, and reduced-motion behavior
- Avoid direct device communication, browser storage, telemetry, remote scripts, and tracking
- Keep rendering decisions capability-aware so unsupported fan models do not show dead controls
- Keep pure state and model logic in src/state
- Keep integration behavior in src/adapters
- Keep Home Assistant service dispatch in src/services
- Keep test fixtures redacted, deterministic, and reusable
- Keep generated agent files derived from .promptscript and never edit them directly
- Use Vitest for unit tests and cover new state, adapter, and service behavior
- Prefer focused tests for normalization, capability gating, model profiles, and action dispatch
- Run npm run validate before a broad pull request
- Treat real Home Assistant and device testing as supplemental, never as a reason to skip unit tests
- Use Prettier for TypeScript, Markdown, JSON, YAML, and repository documentation
- Use ESLint for src, tests, and vitest.config.ts
- Use prs validate --strict for PromptScript sources
- Keep all generated text, comments, and user-facing copy in English
- Use hyphens only, never em dashes or en dashes
- Use Release Please for version, changelog, tag, and GitHub release creation
- Do not hand-edit generated release versions or changelog entries
- Validate vMAJOR.MINOR.PATCH tags before manual release workflow dispatch
- Build and verify dist/xiaomi-fan-card.js before publishing
- Keep HACS filename, resource URL, release asset, and README examples synchronized

## Git Commits

- Format: Conventional Commits
- Allowed Types: feat, fix, docs, test, refactor, chore, ci, perf, revert
- Subject Limit: 70
- Rule: Do not commit or push unless the user explicitly requests it

## HACS publisher requirements

Primary references:

- HACS publisher documentation: https://hacs.xyz/docs/publish/
- HACS dashboard plugin requirements: https://hacs.xyz/docs/publish/plugin/
- HACS GitHub Action: https://hacs.xyz/docs/publish/action/
- HACS general requirements and hacs.json: https://hacs.xyz/docs/publish/start/

This repository is a HACS dashboard repository. HACS calls this backend
category `plugin`, while the HACS UI calls it `Dashboard`.

Keep the repository public, maintain a useful GitHub description, add
searchable topics, keep a complete README, and keep hacs.json at the
repository root. A dashboard plugin needs a JavaScript file under
`dist/` or the repository root. HACS searches `dist/` first, then the latest
release, then the default branch. `dist/xiaomi-fan-card.js` is therefore
tracked and must remain present on the default branch. The same file is also
attached to published GitHub releases.

Keep the manifest filename, bundle filename, HACS installation directory,
README resource URL, and release workflow synchronized. HACS versions are
published GitHub releases, not tags alone. Until the first release exists,
the default branch must contain a valid bundle.

Validate HACS changes with the pinned hacs/action workflow. Do not silence
a check simply because a repository is not yet in the default store. Custom
repository installation is the expected pre-approval path.

## Home Assistant frontend and community practice

Primary references:

- Custom card developer documentation: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/
- Home Assistant help and support: https://www.home-assistant.io/help/
- Home Assistant Code of Conduct: https://www.home-assistant.io/code_of_conduct
- Community forum guidelines: https://community.home-assistant.io/guidelines

Use public Home Assistant frontend APIs and the entity/service contract.
Keep the card integration-agnostic and degrade safely when an integration
does not expose an optional capability. Respect local control and privacy:
no telemetry, hidden network access, credential collection, or device
protocol implementation belongs in this card.

Treat accessibility and calm UI behavior as product requirements. Preserve
keyboard operation, labels, disabled states, readable contrast, and
prefers-reduced-motion support. Do not make decorative animation necessary
to understand or operate a fan.

Use GitHub Issues for reproducible card defects and feature proposals.
Use GitHub Discussions or the Home Assistant Community forum for questions,
setup help, and integration diagnosis. Ask for Home Assistant version,
HACS version, browser, integration, entity attributes, card configuration,
console errors, and reproduction steps. Require users to redact tokens,
hostnames, private entity names, location data, and personal dashboards.
Never request a full diagnostics export when a minimal redacted example is
enough.

Be respectful of the Home Assistant Code of Conduct and HACS community
norms. Do not present this custom card as an official Home Assistant
feature or imply that HACS approval guarantees device compatibility.

## Don'ts

- Don't commit passwords, tokens, cookies, personal entity data, private dashboards, or device identifiers
- Don't print, upload, or transmit Home Assistant credentials or saved login material
- Don't add telemetry, analytics, tracking pixels, remote code, or hidden network requests
- Don't make the card communicate directly with Xiaomi devices
- Don't assume a Xiaomi model, attribute, service, or related entity exists without capability checks
- Don't expose a control unless the primary entity, related entity, model profile, or registered service makes it actionable
- Don't bypass tests, lint, typecheck, HACS validation, or security checks to make CI green
- Don't edit AGENTS.md or CLAUDE.md directly; update .promptscript and compile generated instructions
- Don't edit generated dist output by hand; run npm run build and review the generated bundle
- Don't remove or rename the tracked HACS bundle without updating hacs.json, workflows, release assets, and README instructions
- Don't use mutable GitHub Action references when an immutable commit pin is available
- Don't push, publish, create a release, or alter remote repository settings without explicit user approval
