# Outgrower Chart Datasource Binding

Outgrower charts will use `poultry_card_chart_details`, queried with the selected batch ID using the same `batchid` and `batch_id` parameters as Parent and Grandparent. Returned rows will be normalized into dated Birds, Mortality, Feed Consumption, and Body Weight records and aggregated for the selected month/year range.

The current one-point card metrics and `makeRangeValues` synthetic series will be removed. When no chart rows exist, the existing reserved chart placeholder is rendered instead of fabricated values.
