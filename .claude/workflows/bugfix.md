# bugfix

<!-- PromptScript 2026-08-14T08:44:22.828Z | source: .promptscript/project.prs | target: claude - do not edit -->

> Reproduce and fix a card regression

1. Reproduce with a minimal redacted Home Assistant state or service fixture.
2. Find the first incorrect normalization, capability decision, adapter
   selection, dispatch, or render condition.

3. Write a failing focused test before changing behavior.
4. Fix the root cause without adding model-specific assumptions to generic code.
5. Run focused tests, npm run validate, and rebuild the HACS bundle.
6. Document required Home Assistant integration behavior and migration
   notes if the fix changes visible configuration.
