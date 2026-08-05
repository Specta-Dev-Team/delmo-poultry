# Broiler Day End Action Design

## Scope

Add a `Day End` action only to the selected Broiler house detail header. The button appears immediately before the existing `Entry` control and is not added to house cards or other poultry screens.

## Data Flow

1. Resolve the currently selected Broiler house and its batch ID.
2. Call the Axpert datasource `poultry_dayend_update` with `{ batchid: selectedBatchId }`.
3. The datasource runs its update against the active, non-cancelled batch.
4. On success, mark the selected batch as Day End in the current screen and rerender its header as locked.

The action calls the existing Axpert datasource bridge directly. It does not use the row-loading helper because an update query may return no rows and update errors must remain visible to the action handler.

## Interaction States

- The button is disabled when the selected house has no batch ID or its batch details return `dayend = 'T'`.
- An in-page confirmation dialog with `No` and `Yes` actions is shown before the update runs.
- While the update is running, the button is disabled and shows a processing state to prevent duplicate execution.
- A successful update replaces the action with a locked `Day End Completed` button.
- A failed update restores the button and shows an error without refreshing.

## Verification

- A focused test verifies the button is rendered before `Entry`.
- A focused test verifies the datasource name and `{ batchid }` parameter.
- A focused test verifies loading, success, failure, and refresh behavior.
- Existing Broiler loading and placement-action tests remain passing.
