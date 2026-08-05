# Graph Report - .  (2026-08-04)

## Corpus Check
- 63 files · ~66,965 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1245 nodes · 2460 edges · 99 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: calls: 1269 · contains: 1179 · MODIFIES: 9 · ON_BRANCH: 2 · PARENT_OF: 1


## Input Scope
- Requested: all
- Resolved: all (source: cli)
- Included files: 63 · Candidates: recursive
- Excluded: 0 untracked · 0 ignored · 0 sensitive · 0 missing committed

## Graph Freshness
- Built from Git commit: `4579b0c`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `renderHouseDetail()` - 27 edges
2. `handleClick()` - 27 edges
3. `renderHouseDetail()` - 26 edges
4. `renderHouseDetail()` - 25 edges
5. `handleClick()` - 24 edges
6. `getHouseRecordId()` - 23 edges
7. `renderHouseDetail()` - 22 edges
8. `getHouseRecordId()` - 22 edges
9. `escapeHtml()` - 19 edges
10. `escapeHtml()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `actionContext()` --calls--> `getCachedTargetParams()`  [EXTRACTED]
  broiler.js → broiler.js  _Bridges community 44 → community 38_
- `actionContext()` --calls--> `hasPlacementDone()`  [EXTRACTED]
  broiler.js → broiler.js  _Bridges community 44 → community 19_
- `applyContextToTstruct()` --calls--> `applyFieldContextToTstruct()`  [EXTRACTED]
  broiler.js → broiler.js  _Bridges community 0 → community 45_
- `applyFieldContextToTstruct()` --calls--> `setElementValue()`  [EXTRACTED]
  broiler.js → broiler.js  _Bridges community 45 → community 60_
- `callAxpertDataSourceFunction()` --calls--> `normalizeAxListRows()`  [EXTRACTED]
  broiler.js → broiler.js  _Bridges community 16 → community 46_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (34): addChartMonths(), aggregateChartRecords(), applyContextToTstruct(), buildIViewUrl(), buildMonthOptions(), chartMonthKey(), drawHouseCharts(), drawLineChart() (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (39): addChartMonths(), aggregateChartRecords(), buildHouseLookup(), buildIViewUrl(), buildMonthOptions(), chartMonthKey(), closeOpenMenus(), drawLineChart() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (25): addChartMonths(), aggregateChartRecords(), applyFieldContextToTstruct(), buildMonthOptions(), chartMonthKey(), cssEscape(), dispatchInputEvents(), drawHouseCharts() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (29): addChartMonths(), aggregateChartRecords(), buildMonthOptions(), buildTstructTargetParams(), buildTstructUrl(), chartMonthKey(), cleanTargetParams(), drawHouseCharts() (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (26): addChartMonths(), aggregateChartRecords(), buildIViewUrl(), buildMonthOptions(), chartMonthKey(), drawHouseCharts(), drawLineChart(), drawReservedChartPlaceholders() (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (27): main, 4579b0c Add poultry dashboard UI, assets and tests, 6aa7f9f Initial commit, actionContext(), buildTstructTargetParams(), buildTstructUrl(), cleanTargetParams(), currentDateLabel() (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (33): birdCountLabel(), chartCard(), closeDayEndConfirmation(), closeReadyToHarvestConfirmation(), closeScheduleStatusEditor(), completeDayEnd(), completeReadyToHarvest(), contextItem() (+25 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (28): actionContext, appendMissingTstructTargetParams, applyContextToTstruct, buildParams, buildTstructTargetParams, buildTstructUrl, cleanTargetParams, encodeTstructTargetParams (+20 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (29): buildHouseRecordId(), closeDayEndConfirmation(), closeReadyToTransferConfirmation(), closeScheduleStatusEditor(), closeTstructPanel(), completeDayEnd(), completeReadyToTransfer(), findHouseByElement() (+21 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (28): addGlobalContextParams(), formatChartDateLabel(), getBatchHouseCandidates(), getBatchUnitCandidates(), getCurrentChartParameters(), getCurrentScheduleParameters(), getGlobalContext(), getRowValue() (+20 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (27): actionText(), birdCountLabel(), chartCard(), contextItem(), currentDateLabel(), ensureMaterialCostEntryButton(), escapeHtml(), formatNumber() (+19 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (27): buildHouseRecordId(), chartCard(), closeDayEndConfirmation(), closeReadyToTransferConfirmation(), completeDayEnd(), completeReadyToTransfer(), contextItem(), eggProductionPercent() (+19 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (27): actionContext(), closeDayEndConfirmation(), closeOpenMenus(), closeReadyToTransferConfirmation(), closeScheduleStatusEditor(), closeTstructPanel(), completeDayEnd(), completeReadyToTransfer() (+19 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (26): birdCountLabel(), chartCard(), contextItem(), currentDateLabel(), escapeHtml(), formatNumber(), getHouseActions(), hasPlacementDone() (+18 more)

### Community 14 - "Community 14"
Cohesion: 0.10
Nodes (24): applyContextToTstruct(), chartCard(), contextItem(), loadBaseHouseCardsForSelectedFarmers(), loadCharts(), loadFarmerActivities(), loadRows(), loadSchedules() (+16 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (23): appendMissingTstructTargetParams(), applyContextToTstruct(), buildTstructTargetParams(), buildTstructUrl(), cleanTargetParams(), encodeTstructTargetParams(), forceReplaceTstructTargetParams(), getCachedTargetParams() (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (20): addHouseLookup(), buildHouseLookup(), callAxpertDataSourceFunction(), debugAPI(), extractAxpertGlobalVarValue(), findHouseForBatchRow(), getAxpertWindows(), getGlobalContext() (+12 more)

### Community 17 - "Community 17"
Cohesion: 0.10
Nodes (18): axpertWrappedPayload, callAxpertDataSourceFunction, cleanTargetParams, getMatchingFieldValue, getOptionalNumber, helpers, isCompletedFlag, mapBatchRow (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (19): birdCountLabel(), closeScheduleStatusEditor(), currentDateLabel(), displayNumber(), feedPerBird(), formatNumber(), getHouseActionKeys(), getHouseHarvestDate() (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (18): currentDateLabel(), escapeAttribute(), getQuickEntryActions(), hasPlacementDone(), isDayEnded(), openDayEndConfirmation(), renderChartPeriodControls(), renderChartPeriodInput() (+10 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (18): actionContext(), buildIViewUrl(), buildTstructTargetParams(), buildTstructUrl(), cleanTargetParams(), encodeTargetParams(), encodeTstructTargetParams(), extractTargetParams() (+10 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (18): closeHarvestReadyConfirmation(), completeHarvestReady(), dedupeByValue(), escapeHtml(), initializeOutgrowerData(), loadBatchDetailCards(), loadFarmerOptions(), loadHouseCardsForSelectedFarmer() (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (17): applyBatchDetailRow(), createBatchHouseFromRow(), defaultMetrics(), extractAxpertGlobalVarValue(), feedPerBird(), finalizeBatchHouse(), getRowValue(), isBatchDetailRowForHouse() (+9 more)

### Community 23 - "Community 23"
Cohesion: 0.15
Nodes (17): extractTargetParams(), getGlobalContext(), loadCharts(), loadFarmerActivities(), loadHouses(), loadRows(), loadSchedules(), loadTargetParamsForHouse() (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (16): applyContextToIView(), applyContextToTstruct(), applyFieldContextToTstruct(), applyPlacementBatchHeaderToTstruct(), clickIViewSearchButton(), cssEscape(), expandAxpertFieldNames(), findFieldByCandidates() (+8 more)

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (13): actionContext, appendMissingTstructTargetParams, applyContextToTstruct, buildParams, buildTstructTargetParams, cleanTargetParams, getMortalityTargetParamEntries, isMortalityTstruct (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.19
Nodes (14): getBatchSubLocationCandidates(), getBatchUnitCandidates(), getRowValue(), isActiveBatchRow(), isActiveHouse(), isDayEndFlag(), isInactiveFlag(), isPlacementDoneFlag() (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (14): buildTstructTargetParams(), buildTstructUrl(), cleanTargetParams(), encodeTstructTargetParams(), getCachedTargetParams(), getGlobalContext(), loadTargetParamsForHouse(), loadTargetParamsForTstruct() (+6 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (12): actionContext, completeDayEnd, css, executeDayEnd, getHouseActionKeys, getQuickEntryActions, mapHouseRow, openTstruct (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (13): drawHouseCharts(), drawReservedChartPlaceholders(), formatDate(), handleChange(), hasChartRows(), loadScreenData(), normalizeActivityStatus(), renderActivityStatusPill() (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.21
Nodes (13): birdCountLabel(), formatDate(), formatNumber(), getHouseHarvestDate(), getHousePlacementDate(), hasPlacementDone(), isReadyToHarvest(), metric() (+5 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (11): actionContext, completeDayEnd, css, executeDayEnd, getHouseActions, mapBatchRow, openTstruct, renderDayEndButton (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (11): actionContext, completeDayEnd, css, executeDayEnd, getHouseActions, mapBatchRow, openTstruct, renderDayEndButton (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.21
Nodes (12): addHouseLookup(), findHouseForBatchRow(), getMatchingFieldValue(), isActiveHouse(), isCompletedFlag(), isInactiveFlag(), mapBatchRow(), mapHouseRow() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.24
Nodes (12): callAxpertDataSourceFunction(), debugParent(), dispatchInputEvents(), executeDayEnd(), executeReadyToTransferUpdate(), extractAxpertGlobalVarValue(), findSelectOption(), getAxpertWindows() (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.17
Nodes (10): completeDayEnd, css, executeDayEnd, handleDayEnd, mapHouseRow, openDayEndConfirmation, renderDayEndButton, renderDayEndConfirmation (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (11): currentDateLabel(), escapeAttribute(), getQuickEntryActions(), renderDetailNavbar(), renderFarmerFilter(), renderHouseList(), renderListActions(), renderListNavbar() (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.18
Nodes (9): applyBatchDetailRow, completeHarvestReady, createBatchHouseFromRow, css, executeHarvestReady, renderHarvestAction, renderHarvestReadyConfirmation, renderHouseCard (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (10): buildTstructTargetParams(), buildTstructUrl(), cleanTargetParams(), encodeTstructTargetParams(), getCachedTargetParams(), loadTargetParamsForTstruct(), openTstruct(), rememberTargetParamsForHouse() (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.24
Nodes (10): formatDate(), getScheduleRowFromButton(), getScheduleStatusEditorItem(), normalizeActivityStatus(), renderActivityStatusPill(), renderScheduleStatusEditor(), scheduleActionContext(), scheduleMatchesStatusFilter() (+2 more)

### Community 40 - "Community 40"
Cohesion: 0.31
Nodes (10): callAxpertDataSourceFunction(), debugGrandparent(), dispatchInputEvents(), executeDayEnd(), executeReadyToTransferUpdate(), findSelectOption(), getAxpertWindows(), readAxpertGlobalVar() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.24
Nodes (10): callAxpertDataSourceFunction(), extractAxpertGlobalVarValue(), getAxpertWindows(), normalizeDataSourceRows(), normalizeKey(), parseMaybeJson(), readAxpertGlobalVar(), readInjectedDataSource() (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (8): applyContextToTstruct, buildTstructUrl, loadHouses, loadTargetParamsForHouse, loadUnitOptions, mapBatchRow, mapHouseRow, source

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (8): callAxpertDataSourceFunction, handleClick, loadHouses, loadRows, loadScreenData, loadUnitOptions, parentSource, reloadCurrentFrame

### Community 44 - "Community 44"
Cohesion: 0.28
Nodes (9): actionContext(), getActiveUnitOptions(), getCurrentUnitValue(), getHouseUnitLabel(), getHouseUnitValue(), getMockUnitOptions(), getUnitLabelByValue(), houseMatchesSelectedUnit() (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (9): applyContextToIView(), applyFieldContextToTstruct(), clickIViewSearchButton(), cssEscape(), expandAxpertFieldNames(), findFieldByCandidates(), getContextFieldCandidates(), setAxpertFrameField() (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.39
Nodes (9): collectAxListRows(), extractTargetParams(), getMatchingFieldValue(), getObjectValueByNormalizedKey(), isAxListEnvelope(), normalizeAxListRows(), normalizeDataSourceRows(), normalizeTargetParamValue() (+1 more)

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (9): escapeAttribute(), getActiveUnitOptions(), getHouseUnitValue(), houseMatchesSelectedUnit(), renderChartPeriodControls(), renderChartPeriodInput(), renderChartToolbar(), renderScheduleStatusEditButton() (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.28
Nodes (9): formatDate(), getScheduleStatusEditorItem(), normalizeActivityStatus(), renderActivityStatusPill(), renderScheduleStatusEditor(), renderScheduleTable(), scheduleMatchesStatusFilter(), scheduleStatusClass() (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.31
Nodes (9): applyContextToIView(), applyFieldContextToTstruct(), clickIViewSearchButton(), cssEscape(), expandAxpertFieldNames(), findFieldByCandidates(), getContextFieldCandidates(), setAxpertFrameField() (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.28
Nodes (9): formatDate(), getScheduleStatusEditorItem(), normalizeActivityStatus(), renderActivityStatusPill(), renderScheduleStatusEditButton(), renderScheduleStatusEditor(), scheduleMatchesStatusFilter(), scheduleStatusClass() (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (7): completeReadyToHarvest, executeReadyToHarvestUpdate, mapHouseRow, renderHouseCard, renderTransferAction, source, styles

### Community 52 - "Community 52"
Cohesion: 0.22
Nodes (7): completeReadyToTransfer, executeReadyToTransferUpdate, mapBatchRow, renderHouseCard, renderTransferAction, source, styles

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (7): completeReadyToTransfer, executeReadyToTransferUpdate, mapHouseRow, renderHouseCard, renderTransferAction, source, styles

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (7): renderHarvestAction, renderHouseCard, source, styles, transferEnd, transferStart, transferStyles

### Community 55 - "Community 55"
Cohesion: 0.25
Nodes (8): actionContext(), getHouseUnitLabel(), getScheduleRowFromButton(), getUnitLabelByValue(), hasPlacementDone(), renderTransferAction(), scheduleActionContext(), svgIcon()

### Community 56 - "Community 56"
Cohesion: 0.25
Nodes (6): actionContext, getHouseActionKeys, getQuickEntryActions, mapHouseRow, openTstruct, source

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (6): applyContextToTstruct, applyPlacementBatchHeaderToTstruct, buildTstructTargetParams, clearPlacementOriginFields, getPlacementOriginFieldCandidates, source

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (6): buildTstructUrl, renderHarvestAction, renderHouseCard, renderListActions, renderQuickEntryMenu, source

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (6): completeReadyToTransfer, executeReadyToTransferUpdate, mapBatchRow, renderHouseCard, renderTransferAction, source

### Community 60 - "Community 60"
Cohesion: 0.38
Nodes (7): debugTstruct(), dispatchInputEvents(), findSelectOption(), loadScreenDataFromDataSource(), loadUnitOptionsFromDataSource(), setElementValue(), setIViewElementValue()

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (5): buildTstructTargetParams, buildTstructUrl, html, renderBatchCard, source

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (5): loadingStyles, renderHouseLoadingState, renderHouses, source, styles

### Community 63 - "Community 63"
Cohesion: 0.40
Nodes (6): actionContext(), getHouseUnitLabel(), getScheduleRowFromButton(), getUnitLabelByValue(), houseMatchesSelectedUnit(), scheduleActionContext()

### Community 64 - "Community 64"
Cohesion: 0.33
Nodes (6): findHouseByElement(), findHouseByRecordId(), getReadyToTransferConfirmationHouse(), loadScreenDataFromDataSource(), loadUnitOptionsFromDataSource(), normalizeLookupValue()

### Community 65 - "Community 65"
Cohesion: 0.47
Nodes (6): callAxpertDataSourceFunction(), debugOutgrower(), executeHarvestReady(), getAxpertWindows(), readAxpertGlobalVar(), serializeIViewParameters()

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (4): applyContextToTstruct, buildTstructTargetParams, clearPlacementOriginFields, source

### Community 67 - "Community 67"
Cohesion: 0.33
Nodes (5): contextMarkup, end, source, start, styles

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (4): buildTstructTargetParams, clearPlacementOriginFields, schedulePlacementOriginClear, source

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (4): loadBaseHouseCardsForSelectedFarmers, loadBatchDetailCards, loadHouseCardsForSelectedFarmer, source

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (4): buildTstructTargetParams, renderHarvestAction, renderHouseCard, source

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (5): contextMarkup, end, parentSource, parentStyles, start

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (4): extractAxpertGlobalVarValue, extractValue, normalizeGlobalVarKey, parentSource

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (4): applyContextToTstruct, buildTstructTargetParams, clearPlacementOriginFields, source

### Community 74 - "Community 74"
Cohesion: 0.40
Nodes (5): normalizeActivityStatus(), renderActivityStatusPill(), scheduleActionContext(), scheduleMatchesStatusFilter(), scheduleStatusClass()

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (3): birdCountLabel, renderHouseCard, source

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (4): cardEnd, cardMarkup, cardStart, source

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (3): renderScheduleRows, renderScheduleStatusEditButton, source

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (3): setterCss, setterHtml, setterJs

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (3): html, renderListActions, source

### Community 80 - "Community 80"
Cohesion: 0.40
Nodes (3): birdCountLabel, renderHouseCard, source

### Community 81 - "Community 81"
Cohesion: 0.40
Nodes (3): outgrowerCss, outgrowerSource, renderHouseDetail

### Community 82 - "Community 82"
Cohesion: 0.40
Nodes (4): fallbackBirdCount, match, source, styles

### Community 83 - "Community 83"
Cohesion: 0.40
Nodes (4): cardEnd, cardMarkup, cardStart, source

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (3): outgrowerCss, outgrowerSource, renderHouses

### Community 85 - "Community 85"
Cohesion: 0.40
Nodes (3): renderScheduleRows, renderScheduleStatusEditButton, source

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (2): loadHouses, source

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (1): sources

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (2): loadCharts, source

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (1): screenFiles

### Community 92 - "Community 92"
Cohesion: 1.00
Nodes (1): source

### Community 93 - "Community 93"
Cohesion: 1.00
Nodes (1): cssFiles

### Community 94 - "Community 94"
Cohesion: 1.00
Nodes (1): layersSource

### Community 95 - "Community 95"
Cohesion: 1.00
Nodes (1): html

### Community 96 - "Community 96"
Cohesion: 1.00
Nodes (1): source

### Community 97 - "Community 97"
Cohesion: 1.00
Nodes (1): parentSource

### Community 98 - "Community 98"
Cohesion: 1.00
Nodes (1): parentSource

### Community 99 - "Community 99"
Cohesion: 1.00
Nodes (1): parentHtml

### Community 100 - "Community 100"
Cohesion: 1.00
Nodes (1): parentSource

## Knowledge Gaps
- **277 isolated node(s):** `source`, `birdCountLabel`, `renderHouseCard`, `source`, `cardStart` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 86`** (2 nodes): `loadHouses`, `source`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `sources`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `loadCharts`, `source`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `screenFiles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (1 nodes): `source`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (1 nodes): `cssFiles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (1 nodes): `layersSource`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (1 nodes): `html`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (1 nodes): `source`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (1 nodes): `parentSource`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (1 nodes): `parentSource`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (1 nodes): `parentHtml`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (1 nodes): `parentSource`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderHouseDetail()` connect `Community 12` to `Community 4`, `Community 13`, `Community 23`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `handleClick()` connect `Community 8` to `Community 1`, `Community 63`, `Community 29`, `Community 27`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `renderHouseDetail()` connect `Community 8` to `Community 1`, `Community 10`, `Community 29`, `Community 24`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **What connects `source`, `birdCountLabel`, `renderHouseCard` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06826241134751773 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07198228128460686 - nodes in this community are weakly interconnected._