# Parent environment and lighting entry actions

## Goal

Add the Grandparent-equivalent Lighting Management and Environment Monitoring actions to the Parent Operations screen.

## Scope

Update `parent.js` to register these TStructs and expose them in both house-level action surfaces:

- Lighting Management: action key `lighting`, transaction ID `light`.
- Environment Monitoring: action key `environment`, transaction ID `envnm`.
- House-card overflow dropdown (`CARD_ACTIONS`).
- House-detail Entry menu (`DETAIL_ACTIONS`).

Use the matching Grandparent icons and preserve Grandparent action order: after Body Weight Monitoring and before Water Consumption Monitoring.

## Behavior

Both actions use Parent's existing generic TStruct-opening path. Selecting either action opens the configured transaction in the current entry panel and passes the same selected house context used by the other Parent entry actions. No new context-prefill logic is required.

## Verification

Add a focused Parent regression test that asserts both action definitions, transaction IDs, and their inclusion in the dropdown and Entry action lists. Run the relevant test file and the full test suite.

## Boundaries

This change is limited to the Parent screen and its tests. It does not alter Grandparent, other operation screens, styles, data sources, or transaction behavior.
