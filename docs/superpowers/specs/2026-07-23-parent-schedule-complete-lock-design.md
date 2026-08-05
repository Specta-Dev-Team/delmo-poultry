# Parent Schedule Completed Status Lock

## Goal

Prevent users from editing a completed schedule item in the Parent card Activity section, while preserving the existing edit flow for pending items.

## Design

The schedule table will render the Edit button only for rows whose normalized status is `Pending`. A completed row keeps its status pill and an empty Edit cell, so it remains readable but has no editable control.

The schedule-editor entry path will also check the current schedule row status before opening. This prevents a completed item from being edited through a stale UI element or direct event dispatch.

## Error Handling

If the selected row is missing, invalid, or completed, the editor remains closed. No datasource calls or status mutation occur.

## Testing

A source-level regression test will assert that completed schedules do not render an Edit button, pending schedules still do, and the click handler refuses to open an editor for a completed schedule.
