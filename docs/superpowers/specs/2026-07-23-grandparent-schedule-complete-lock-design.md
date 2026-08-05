# Grandparent Schedule Completed Status Lock

Completed schedule items in the Grandparent Activity section must not be editable. The schedule row renders an Edit control only when its normalized status is `Pending`, and the delegated edit handler independently refuses a completed or missing row.

The change is limited to `grandparent.js` and a focused Node.js assertion test. Pending schedules keep the existing Schedule Monitoring flow.
