# Parent transfer card stage design

## Goal

Make Parent cards communicate the same two-stage transfer workflow as Out Grower and protect the ready-to-transfer update with an explicit confirmation.

## Behavior

- A Parent card whose `harvestready`/`readytoharvest` flag is not true is the pending stage.
- Pending cards use the blue ready-to-harvest visual treatment and show `Ready To Transfer Update`.
- A Parent card with a true harvest-ready flag uses the muted darker-green live-transfer treatment and shows `Live Bird Transfer Request`.
- Clicking `Ready To Transfer Update` opens a Yes/No confirmation dialog.
- `No` closes the dialog without a datasource call.
- `Yes` calls `poultry_cull_harvest_update` with the card batch ID. On success, the card immediately switches to the live-transfer stage.
- `Live Bird Transfer Request` remains a direct opener for the `nlbdt` tstruct.

## Implementation boundaries

- Reuse Parent's existing card structure, metrics, spacing, and action routing.
- Add only Parent-specific stage classes and confirmation markup/handlers; do not alter unrelated card metrics or entry-menu actions.
- Keep the existing Out Grower muted darker-green palette so both screens remain visually consistent.
- Preserve the existing harvest-ready aliases, including `harvestready`.

## Validation

- Add regression assertions for Parent stage classes and status labels.
- Add tests proving the ready-to-transfer confirmation exposes Yes/No controls and that the Yes path calls the update datasource while the No path does not.
- Run focused Parent tests, syntax checks, diff checks, and refresh the Graphify index.
