# Poultry Dashboard Research And Enterprise Design Prompt

## Screenshot Research

The supplied screens show a three-level poultry operations module:

1. Parent/farm context: breadcrumb, action buttons, and farm-wide totals.
2. Farm screen: house cards with batch, birds, tray inventory, and weight.
3. House screen: active batch header, feed indent, time range filters, charts, and schedules.

The original UI is functionally useful but visually flat: low hierarchy, sparse context, repeated rows, and chart cards that do not communicate operational priority. The remake keeps the same data language but turns it into an enterprise dashboard with drill-down navigation, clear KPI cards, house status cards, responsive chart panels, and a schedule table.

## Domain Findings

Poultry operations dashboards commonly center on daily flock records, mortality, trays or egg production, feed consumption, bird counts, feed-per-bird or feed-per-egg ratios, and flock comparison. EasePoultry lists daily mortality, trays produced, feed consumed, opening and closing birds, cumulative mortality, production percentage, feed per bird, and feed per egg as report variables. PoultryPlan highlights bird weight, feed intake, egg production, mortality rates, task scheduling, and KPI reporting. Tulasi's breeder management page emphasizes feed intake, body weight, mortality, production forecasts, batch performance, hatching eggs, inventory, vaccination schedules, house details, flock details, and feed cost. The Poultry Site notes that controlling breeder body weights through feed allocation and weekly weight measurement is a critical breeder-house management practice.

## Information Architecture

- Parent module: portfolio health, farm list, active houses, total birds, trays, weight, health tasks, and operations queue.
- Farm screen: selected farm context, action bar, summary strip, house cards, house actions, production mix chart, and farm notices.
- House view: batch context, feed indent, range filter, birds housed, mortality, feed consumption, body weight, tray inventory, and schedules.

## Enterprise Design Prompt

Design a modern enterprise poultry parent-operations dashboard in HTML, CSS, and JavaScript. The product should feel like a serious farm management control room rather than a marketing page. Preserve the user's original hierarchy: parent module, selected farm, and selected house detail. Use a professional left navigation rail, compact top bar, clear breadcrumbs, high-density KPI cards, house status cards, responsive chart panels, and a schedule table.

Visual direction: clean white and pale-blue workspace, dark professional navigation rail, blue and teal operational accents, restrained green/amber/red status colors, subtle borders, 8px radii, compact shadows, and typography tuned for scanning. Avoid decorative blobs, oversized hero marketing, nested cards, and visual clutter. The design should support repeated daily use by farm managers.

Data requirements: mock data must include farms, houses, batches, birds housed, male/female counts, tray standard/reject counts, total kilograms, house cost, users, mortality, feed consumption, body weight, feed indent IDs, medication/vaccination schedules, and open health tasks.

Interaction requirements: clicking the parent, farm, and house navigation should switch screens; clicking a farm should open its farms screen; clicking a house should open the house chart view; range controls should redraw the charts for 1w, 1m, 3m, 6m, and 1y views. Charts should be rendered with local JavaScript canvas code and must not require external CDN libraries.

Responsive requirements: desktop should use a sidebar and multi-column chart grid. Tablet should collapse content grids. Mobile should stack navigation, KPI cards, charts, and tables without text overlap.

Accessibility requirements: buttons must be real buttons, charts must be paired with readable headings and captions, tables must use semantic table markup, and the visual hierarchy must remain readable at common laptop and mobile widths.

## Research Sources

- EasePoultry: https://www.easepoultry.com/
- PoultryPlan OptiRearing: https://www.poultryplan.com/solutions/optirearing
- Tulasi Breeder Management System: https://www.tulassi.com/breeder-management-system
- The Poultry Site breeder flock manual excerpt: https://www.thepoultrysite.com/articles/fad-broilers-breeding-flocks
