# Contributing

Thank you for contributing to Xiaomi Fan Card.

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- Git

## Setup

```bash
git clone https://github.com/mrwogu/xiaomi-smart-fan-card.git
cd xiaomi-smart-fan-card
npm ci
```

## Development workflow

1. Create a branch from `main`.
2. Make focused changes.
3. Add or update tests.
4. Update README, media placeholders, or compatibility documentation when needed.
5. Regenerate the tracked HACS bundle after source changes.
6. Run the complete local validation:

```bash
npm run validate
```

Individual checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
prs validate --strict
```

Use `npm test` for fast feedback. `npm run validate` is the pull request
check and includes coverage plus the production bundle build.

Real Home Assistant and device testing is valuable, but never include access
tokens, credentials, private entity data, or personal dashboards in issues or
pull requests.

## Project organization

- `src/state` contains pure normalization, model profiles, capability checks,
  and related entity discovery.
- `src/adapters` contains integration-specific behavior.
- `src/services` contains Home Assistant service dispatch.
- `src/card.ts` contains Lit rendering and user interaction.
- `tests/fixtures` contains redacted deterministic Home Assistant fixtures.
- `dist/xiaomi-fan-card.js` is the tracked HACS bundle generated from `src`.
- `.promptscript/` is the source of truth for agent instructions. `AGENTS.md`,
  `CLAUDE.md`, and generated agent files must be regenerated, not edited
  directly.
- `package.json` remains private intentionally. The distributable is a
  GitHub release asset managed by HACS, not an npm package.

When a change crosses a boundary, explain why in the pull request and add
tests at the narrowest boundary that proves the behavior.

## PromptScript maintenance

Edit `.promptscript/project.prs` or its imported fragments:

```bash
prs validate --strict
prs compile
npm run format:check
```

Inspect generated `AGENTS.md`, `CLAUDE.md`, Factory droids, and Claude agents
after compilation. Keep architecture, coding standards, restrictions, HACS
rules, Home Assistant community guidance, workflows, and agent roles in their
dedicated PromptScript fragments.

## HACS and Home Assistant community requirements

This is a HACS dashboard repository. The HACS backend calls this category
`plugin`. Keep these values synchronized:

- `hacs.json` filename: `xiaomi-fan-card.js`
- tracked bundle: `dist/xiaomi-fan-card.js`
- HACS resource: `/hacsfiles/xiaomi-smart-fan-card/xiaomi-fan-card.js`
- card element: `custom:xiaomi-fan-card`

Follow the [HACS publisher requirements](https://hacs.xyz/docs/publish/),
[dashboard plugin requirements](https://hacs.xyz/docs/publish/plugin/), and
[HACS validation action](https://hacs.xyz/docs/publish/action/). The default
branch must contain a valid bundle before the first release. Published
releases must attach the same generated bundle.

Follow Home Assistant's [custom card developer
documentation](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
and [Code of Conduct](https://www.home-assistant.io/code_of_conduct). Keep
the card local, privacy-preserving, capability-aware, accessible, and
integration-agnostic. Use GitHub Issues for reproducible card defects and
Discussions or the [Home Assistant Community
forum](https://community.home-assistant.io/) for setup questions and broader
integration diagnosis. Ask for minimal redacted examples only.

## Commit messages

Use Conventional Commits:

- `feat:` new functionality
- `fix:` bug fix
- `docs:` documentation
- `test:` tests
- `refactor:` code restructuring
- `chore:` maintenance
- `ci:` automation

Examples:

```text
feat(adapter): support native xiaomi_miio entities
fix(card): hide unavailable timer control
```

## Pull requests

- Explain user-visible behavior.
- Include tests for behavior changes.
- Keep unrelated refactors out of the pull request.
- Confirm CI passes.
- Add screenshots or recordings for visual changes when useful.

Maintainers use Release Please. Do not edit generated release versions or
changelog sections manually.
