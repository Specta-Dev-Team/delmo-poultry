(function () {


    const CONFIG = {
        key: "broiler",
        title: "Broiler Operations",
        listLabel: "Broiler houses",
        emptyLabel: "No broiler houses found.",
        scheduleCopy: "Medication, feed, and monitoring actions attached to this broiler batch.",
        exposeName: "broilerOps",
        tstructOptions: {
            basePath: "../../aspx/tstruct.aspx",
            openerIV: "",
            passContextInQuery: true,
        },
        cardActions: ["placement", "batchCreation", "mortality", "feedMedication", "bodyWeight", "water", "lighting", "environment"],
        categoryFilters: [
            { key: "all", label: "All" },
            { key: "grower", label: "Grower" },
            { key: "layer", label: "Layer" },
        ],
    };


    const DEBUG_TSTRUCT = true;
    const TSTRUCT_DEBUG_VERSION = "context-safe-dropdowns-2026-06-03";

    function debugTstruct(message, payload) {
        if (!DEBUG_TSTRUCT || !window.console) return;
        if (payload !== undefined) {
            console.log(`[Parent Operations][TStruct] ${message}`, payload);
        } else {
            console.log(`[Parent Operations][TStruct] ${message}`);
        }
    }

    debugTstruct("script loaded", { version: TSTRUCT_DEBUG_VERSION });

    const AXPERT_TSTRUCTS = {
        placement: { title: "Placement", transid: "btplc" },
        eggCollection: { title: "Egg Collection", transid: "eggcl" },
        mortality: { title: "Mortality", transid: "morta" },
        feedMedication: { title: "Feed Consumption / Medication", transid: "fdcon" },
        bodyWeight: { title: "Body Weight Monitoring", transid: "bdwgt" },
        lighting: { title: "Lighting Management", transid: "light" },
        environment: { title: "Environment Monitoring", transid: "envnm" },
        batchCreation: { title: "Batch Creation", transid: "batcr" },
        houseCreation: { title: "House Creation", transid: "house" },
        water: { title: "Water Consumption Monitoring", transid: "water" },
        eggAllotment: { title: "Egg Allotment", transid: "eggal" },
        scheduleMonitoring: { title: "Schedule Monitoring", transid: "schst" },
        candleTest: { title: "Candle Test", transid: "candl" },
        chickPullOut: { title: "Chick Pull Out", transid: "pullo" },
        liveBirdTransferRequest: { title: "Live Bird Transfer Request", transid: "nlbdt" },
    };

    const AXPERT_IVIEWS = {
        materialConsumptionCost: {
            title: "Poultry Material Consumption Cost Details",
            ivname: "feedmedi",
        },
    };

    const QUICK_ENTRY_ACTIONS = [
        { key: "placement", icon: "M8 4h8M6 8h12l-1 12H7L6 8zM9 12h6M10 16h4" },
        { key: "mortality", icon: "M12 3 3 20h18L12 3zM12 9v5M12 17h.01" },
        { key: "feedMedication", icon: "M4 8h16M6 8l1 12h10l1-12M9 4h6M9 12h6M10 16h4" },
        { key: "bodyWeight", icon: "M7 20h10l-1-11H8L7 20zM9 9a3 3 0 0 1 6 0" },
        { key: "lighting", icon: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1.5 2 1.5 3h5c0-1 0.5-2 1.5-3a7 7 0 0 0-4-12z" },
        { key: "environment", icon: "M12 2v20M5 8a7 7 0 0 0 14 0M5 16a7 7 0 0 1 14 0" },
        { key: "water", icon: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" },
    ];

    const QUICK_ENTRY_IVIEW_ACTIONS = [
        { key: "materialConsumptionCost", icon: "M4 7h16M6 7v13h12V7M9 11h6M9 15h3M16 4v4M12 4v4" },
    ];

    const CHART_RANGES = {
        month: { label: "Monthly" },
        year: { label: "Yearly" },
    };

    function chartMonthKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    function addChartMonths(date, offset) {
        return new Date(date.getFullYear(), date.getMonth() + offset, 1);
    }

    function buildMonthOptions() {
        const formatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
        const end = new Date();
        const start = addChartMonths(end, -11);
        return Array.from({ length: 12 }, function (_, index) {
            const date = addChartMonths(start, index);
            return { key: chartMonthKey(date), label: formatter.format(date) };
        });
    }

    function buildYearOptions() {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, function (_, index) {
            const year = currentYear - 4 + index;
            return { key: String(year), label: String(year) };
        });
    }

    const MONTH_OPTIONS = buildMonthOptions();
    const YEAR_OPTIONS = buildYearOptions();

    const houses = [];
    const targetParamIndex = new Map();



    houses.forEach(function (house) {
        house.stage = getHouseStage(house);
    });

    const moduleCommand = document.getElementById("moduleCommand");
    const unitFilterBar = document.getElementById("unitFilterBar");
    const houseGrid = document.getElementById("houseGrid");
    const houseDetail = document.getElementById("houseDetail");
    const tstructPanel = document.getElementById("tstructPanel");
    const tstructFrame = document.getElementById("tstructFrame");
    const closeTstruct = document.getElementById("closeTstruct");
    let selectedHouseId = "";
    let selectedChartRange = "month";
    let selectedUnit = "all";
    let unitOptions = [];
    let unitsLoadedFromDataSource = false;
    let currentSearchValue = "";
    let pendingTstructContext = null;
    let pendingIViewContext = null;
    let selectedMonthFrom = MONTH_OPTIONS[0] ? MONTH_OPTIONS[0].key : "";
    let selectedMonthTo = MONTH_OPTIONS[MONTH_OPTIONS.length - 1] ? MONTH_OPTIONS[MONTH_OPTIONS.length - 1].key : "";
    let selectedYearFrom = YEAR_OPTIONS[0] ? YEAR_OPTIONS[0].key : "";
    let selectedYearTo = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] ? YEAR_OPTIONS[YEAR_OPTIONS.length - 1].key : "";
    let selectedActivityTab = "schedule";
    let selectedScheduleStatusFilter = "all";
    let scheduleStatusEditor = null;
    let dayEndConfirmation = null;
    let readyToHarvestConfirmation = null;

    async function loadUnitOptionsFromDataSource() {
        try {
            if (!window.BroilerAPI || typeof window.BroilerAPI.loadUnitOptions !== "function") {
                debugTstruct("BroilerAPI is not available yet, unit datasource was not called");
                return;
            }

            const mappedUnits = await window.BroilerAPI.loadUnitOptions();

            // if (!mappedUnits.length) {
            //     debugTstruct("unit datasource returned no mapped rows", {
            //         dataSource: window.BroilerAPI.dataSources && window.BroilerAPI.dataSources.units,
            //     });
            //     return;
            // }

            unitOptions = mappedUnits;
            unitsLoadedFromDataSource = true;
            debugTstruct("unit datasource loaded", mappedUnits);
            updateUnitFilters();
        } catch (error) {
            console.warn("[Broiler Operations] Failed to load units from BroilerAPI.", error);
        }
    }

    async function loadHousesFromDataSource() {

        console.log("malintha loadHousesFromDataSource");
        try {
            if (!window.BroilerAPI || typeof window.BroilerAPI.loadHouses !== "function") return;
            const dataSourceHouses = await window.BroilerAPI.loadHouses({
                unit: selectedUnit === "all" ? "" : selectedUnit,
                unitOptions,
            });

            dataSourceHouses.forEach(function (house) {
                house.stage = house.stage || getHouseStage(house);
            });

            houses.splice(0, houses.length, ...dataSourceHouses);

            if (selectedHouseId && !houses.some((house) => house.id === selectedHouseId)) {
                selectedHouseId = "";
            }

            if (selectedHouseId) {
                renderHouseDetail(selectedHouseId, { skipDataLoad: true });
                console.log("malintha first selectedHouseId", selectedHouseId);

            } else {
                renderHouseList();
                renderHouses(currentSearchValue);
            }
        } catch (error) {
            console.warn("[Broiler Operations] Failed to load houses from BroilerAPI.", error);
        }
    }

    function getCurrentChartParameters(house) {
        const rangeType = selectedChartRange === "year" ? "year" : "month";
        const batchId = house.batchId || house.batchCode || "";
        return {
            batchid: batchId,
            batch_id: batchId,
            house_id: house.id,
            range_type: rangeType,
            from_period: rangeType === "month" ? selectedMonthFrom : selectedYearFrom,
            to_period: rangeType === "month" ? selectedMonthTo : selectedYearTo,
        };
    }

    function getCurrentScheduleParameters(house) {
        const batchId = house.batchId || house.batchCode || "";
        return {
            batchid: batchId,
            batch_id: batchId,
            house_id: house.id,
        };
    }

    function hasChartRows(metrics) {
        return metrics && (
            Array.isArray(metrics.records) && metrics.records.length > 0 ||
            Array.isArray(metrics.labels) && metrics.labels.length > 0
        );
    }

    async function loadHouseDetailData(house) {
        if (!window.BroilerAPI) return;

        let shouldRender = false;

        try {
            if (typeof window.BroilerAPI.loadSchedules === "function") {
                house.schedules = await window.BroilerAPI.loadSchedules(getCurrentScheduleParameters(house));
                house.schedulesLoading = false;
                shouldRender = true;
            }
        } catch (error) {
            house.schedulesLoading = false;
            shouldRender = true;
            console.warn("[Broiler Operations] Failed to load schedules from BroilerAPI.", error);
        }

        try {
            if (typeof window.BroilerAPI.loadFarmerActivities === "function") {
                house.farmerActivities = await window.BroilerAPI.loadFarmerActivities(getCurrentScheduleParameters(house));
                house.farmerActivitiesLoading = false;
                shouldRender = true;
            }
        } catch (error) {
            house.farmerActivitiesLoading = false;
            shouldRender = true;
            console.warn("[Broiler Operations] Failed to load farmer activity from BroilerAPI.", error);
        }

        try {
            if (typeof window.BroilerAPI.loadCharts === "function") {
                const chartMetrics = await window.BroilerAPI.loadCharts(getCurrentChartParameters(house));
                if (hasChartRows(chartMetrics)) {
                    house.metrics = chartMetrics;
                    shouldRender = true;
                }
            }
        } catch (error) {
            console.warn("[Broiler Operations] Failed to load charts from BroilerAPI.", error);
        }

        if (shouldRender && selectedHouseId === house.id) {
            renderHouseDetail(house.id, { skipDataLoad: true });
        }
    }

    async function loadScreenDataFromDataSource() {
        await loadUnitOptionsFromDataSource();
        await loadHousesFromDataSource();
        if (selectedHouseId) {
            const house = houses.find((item) => item.id === selectedHouseId);
            if (house) loadHouseDetailData(house);
        }
    }

    // window.addEventListener("BroilerAPIReady", loadScreenDataFromDataSource);

    window.addEventListener("BroilerAPIReady", function (event) {
        debugTstruct("BroilerAPIReady received", event.detail && event.detail.dataSources);
        loadScreenDataFromDataSource();
    });

    function getMockUnitOptions() {
        return Array.from(new Set(houses.map((house) => house.unit).filter(Boolean))).sort().map(function (unit) {
            return { value: unit, label: unit };
        });
    }

    function getActiveUnitOptions() {
        return unitOptions.length ? unitOptions : getMockUnitOptions();
    }

    function normalizeUnitMatchValue(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    function getHouseUnitValue(house) {
        return house.unit || "";
    }


    function getUnitLabelByValue(unitValue) {
        if (!unitValue || unitValue === "all") return "";

        const option = getActiveUnitOptions().find(function (opt) {
            return opt.value === unitValue;
        });

        return option ? option.label : unitValue;
    }

    function getHouseUnitLabel(house) {
        if (house && house.unitName) {
            return house.unitName;
        }
        if (!unitsLoadedFromDataSource) {
            return house.unit || "";
        }
        const option = unitOptions.find(function (opt) {
            return opt.value === house.unit;
        });
        return option ? option.label : house.unit || "";
    }

    function houseMatchesSelectedUnit(house) {
        if (selectedUnit === "all") return true;

        const selectedLabel = getUnitLabelByValue(selectedUnit);
        const selectedMatches = [selectedUnit, selectedLabel].map(normalizeUnitMatchValue).filter(Boolean);
        const houseMatches = [
            getHouseUnitValue(house),
            house && house.unitName,
            getHouseUnitLabel(house),
        ].map(normalizeUnitMatchValue).filter(Boolean);

        return houseMatches.some(function (houseValue) {
            return selectedMatches.includes(houseValue);
        });
    }

    function getCurrentUnitValue() {


        if (selectedUnit && selectedUnit !== "all") return selectedUnit;

        const houseUnitValues = Array.from(new Set(houses.map(getHouseUnitValue).filter(Boolean)));

        if (houseUnitValues.length === 1) return houseUnitValues[0];

        const options = getActiveUnitOptions();
        if (options.length === 1) return options[0].value;

        return "";
    }

    function formatNumber(value, decimals) {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimals || 0,
            maximumFractionDigits: decimals || 0,
        }).format(value);
    }

    function formatDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    }

    function actionText(actionKey) {
        return AXPERT_TSTRUCTS[actionKey] ? AXPERT_TSTRUCTS[actionKey].title : actionKey;
    }

    function svgIcon(path) {
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
    }

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSearchControl() {
        return `
      <div class="search-box module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
        <input id="houseSearch" type="search" value="${escapeAttribute(currentSearchValue)}" placeholder="Search ${CONFIG.key} houses..." aria-label="Search ${CONFIG.key} houses" />
      </div>
    `;
    }

    function currentDateLabel() {
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date()).replace(/ /g, " ");
    }

    function renderNavTools() {
        return `
      <div class="nav-tools">
        <button class="icon-button" type="button" aria-label="Refresh" id="refreshBtn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
          </svg>
        </button>
        <button class="date-button" type="button">${currentDateLabel()}</button>
      </div>
    `;
    }

    function renderListActions() {
        const moreActions = CONFIG.key === "breeder"
            ? ["batchCreation", "eggAllotment"]
            : ["batchCreation", "feedMedication", "environment"];

        return `
      <div class="command-actions">
        <button class="command-button" type="button" data-tstruct-action="houseCreation">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4zM8 6V4h8v2M8 11h8M8 15h5" /></svg>
          <span>Create House</span>
        </button>
        <button class="command-button primary" type="button" data-tstruct-action="batchCreation">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span>Batch Creation</span>
        </button>
        <details class="command-menu">
          <summary class="command-button icon-only" aria-label="More actions">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg>
          </summary>
          <div class="command-popover align-right">
            ${moreActions.map((action) => `<button type="button" data-tstruct-action="${action}">${actionText(action)}</button>`).join("")}
          </div>
        </details>
      </div>
    `;
    }

    function renderListNavbar() {
        moduleCommand.innerHTML = `
      <div class="module-copy">
        <h2>${CONFIG.title}</h2>
        <p><span id="activeHouseCount">${formatNumber(houses.filter((house) => house.status === "Active").length)}</span> active houses / <span id="birdTotal">${formatNumber(houses.reduce((sum, house) => sum + house.birdsHoused, 0))}</span> birds housed</p>
      </div>
      ${renderSearchControl()}
      ${renderListActions()}
      ${renderNavTools()}
    `;
    }

    function renderDetailNavbar(house) {
        moduleCommand.innerHTML = `
      <div class="module-copy detail-copy">
        <button class="back-button" type="button" data-back-to-houses>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6" /></svg>
          ${CONFIG.title}
        </button>
        <h2>${house.name} <span class="house-code-pill">${house.code}</span></h2>
        <p>${house.batchId} / ${house.stage} </p>
        <!-- <p>${house.batchId} / ${house.stage} / Feed indent: ${house.feedIndent}</p> -->
      </div>
      ${renderSearchControl()}
      <div class="command-actions">
        ${renderDayEndButton(house)}
        ${renderQuickEntryMenu(house)}
      </div>
      ${renderNavTools()}
    `;
    }

    function cleanTargetParams(value) {
        return String(value || "").trim().replace(/^\?/, "");
    }

    function normalizeIndexPart(value) {
        return String(value || "").trim().toLowerCase();
    }

    function uniqueValues(values) {
        return Array.from(new Set(values.map(normalizeIndexPart).filter(Boolean)));
    }

    function targetParamKeys(context) {
        if (!context) return [];

        const unitValues = uniqueValues([context.unit, context.unitId, context.unitName]);
        const houseValues = uniqueValues([context.houseCode, context.houseId, context.houseName, context.code, context.id, context.name]);
        const batchValues = uniqueValues([context.batchCode, context.batchId, context.batch]);
        const units = unitValues.length ? unitValues : [""];
        const batches = batchValues.length ? batchValues.concat("") : [""];
        const keys = [];

        houseValues.forEach((houseValue) => {
            units.forEach((unitValue) => {
                batches.forEach((batchValue) => {
                    keys.push(`${unitValue}|${houseValue}|${batchValue}`);
                });
            });
        });

        return keys;
    }

    function rememberTargetParamsForHouse(house, targetParams) {
        const cleanParams = cleanTargetParams(targetParams || house && (house.targetParams || house.targetparams));
        if (!cleanParams) return "";

        if (house && typeof house === "object") house.targetParams = cleanParams;
        targetParamKeys(house).forEach((key) => targetParamIndex.set(key, cleanParams));
        return cleanParams;
    }

    function getCachedTargetParams(context) {
        for (const key of targetParamKeys(context)) {
            const cachedParams = targetParamIndex.get(key);
            if (cachedParams) return cachedParams;
        }

        return "";
    }

    function encodeTstructTargetParams(paramString) {
        return String(paramString || "")
            .split(/&(?=[A-Za-z0-9_]+=)/)
            .map((part) => {
                const equalsIndex = part.indexOf("=");
                return equalsIndex === -1 ? part : part.slice(0, equalsIndex + 1) + encodeURIComponent(part.slice(equalsIndex + 1));
            })
            .filter(Boolean)
            .join("&");
    }

  function buildTstructTargetParams(transid,context) {
        if (!context) return "";

        console.log("malintha transid",transid)

        // const existingTargetParams = cleanTargetParams(context.targetParams || context.targetparams);
        // if (existingTargetParams) return existingTargetParams;
        // console.log("malintha context is",context)

        // const cachedTargetParams = getCachedTargetParams(context);
        // if (cachedTargetParams) return cachedTargetParams;
        //  const newcontext = await getGlobalContext();
        //  const branch=newcontext.branch

        const unitTargetValue = context.unitName || context.unitId;
        const houseTargetValue = context.houseName || context.houseCode || context.houseId;
        const batchTargetValue = context.batchId || context.batchCode;

        if (transid === "btplc") {
            return batchTargetValue ? `batchid=${String(batchTargetValue)}` : "";
        }

        let entries=[];
        if (transid === "morta") {
    entries = [
      ["batch", batchTargetValue],
    ];
  } else if(transid ==="layer"){
     entries = [
      ["currentbatch", batchTargetValue],
    ];
  }
  else if (transid==="fdcon"){
    entries =[["tobatch", batchTargetValue],]
  }
  else if (transid==="bdwgt"){
    entries =[["batch", batchTargetValue],]
  }
  else if (transid==="water"){
    entries =[["batch", batchTargetValue],]
  }
  else if (transid==="eggcl"){
    entries =[["birdbatch", batchTargetValue],]
  }
  else if (transid==="batcr"){
    entries =[["itemgroup", "BROILER CHICKS"],]
  }

  else if (transid==="house"){
    entries =[["category", "BROILER"],]
  }

  else{
        entries = [
            ["module", context.module],
            ["batch", batchTargetValue],
            ["unit", unitTargetValue],
            // ["currentbatch", batchTargetValue],
            ["unit000F1", unitTargetValue],
            ["unitid", context.unitId],
            ["unitname", context.unitName],
            ["house", context.houseName],
            ["house000F1", houseTargetValue],
            ["houseid", context.houseId],
            ["housecode", context.houseCode],
            ["housename", context.houseName],
            ["tobatch", batchTargetValue],
            ["batchid", context.batchId],
            ["batchcode", context.batchCode],
            ["sublocation", context.houseName],
            ["birdbatch", batchTargetValue],
            ["schedule", context.scheduleName],
            ["scheduleid", context.scheduleId],
            ["scheduledate", context.scheduleDate],
            ["scheduleage", context.scheduleAge],
            ["schedulestatus", context.scheduleStatus],
        ];
    }

            console.log("malintha entry is",entries)
            return entries
            .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "")
            .map((entry) => `${entry[0]}=${String(entry[1])}`)
            .join("&");
    }

    // function buildTstructUrl(transid, context) {
    //     const targetParams = buildTstructTargetParams(transid,context);
    //     const encodedParams = encodeTstructTargetParams(targetParams);
    //     const transParam = `transid=${encodeURIComponent(transid)}`;
    //     const openerParam = CONFIG.tstructOptions.openerIV
    //         ? `&openerIV=${encodeURIComponent(CONFIG.tstructOptions.openerIV)}`
    //         : "";

    //     if (CONFIG.tstructOptions.passContextInQuery && encodedParams) {
    //         return `${CONFIG.tstructOptions.basePath}?${transParam}${openerParam}&${encodedParams}&act=open`;
    //     }

    //     return `${CONFIG.tstructOptions.basePath}?${transParam}${openerParam}&act=open`;
    // }

//     function buildTstructUrl(transid, context) {
//     const targetParams = buildTstructTargetParams(transid,context);
//     const encodedParams = encodeTstructTargetParams(targetParams);
//     const transParam = `transid=${encodeURIComponent(transid)}`;
//     const openerParam = CONFIG.tstructOptions.openerIV
//       ? `&openerIV=${encodeURIComponent(CONFIG.tstructOptions.openerIV)}`
//       : "";

//     if (CONFIG.tstructOptions.passContextInQuery && encodedParams) {
//       return `${CONFIG.tstructOptions.basePath}?${transParam}${openerParam}&${encodedParams}&act=open`;
//     }

//     return `${CONFIG.tstructOptions.basePath}?${transParam}${openerParam}&act=open`;
//   }

 function buildTstructUrl(transid, context) {
    const targetParams = buildTstructTargetParams(transid,context);
    const encodedParams = encodeTstructTargetParams(targetParams);
    const transParam = `transid=${encodeURIComponent(transid)}`;
    const openerParam = CONFIG.tstructOptions.openerIV
      ? `&openerIV=${encodeURIComponent(CONFIG.tstructOptions.openerIV)}`
      : "";

    if (CONFIG.tstructOptions.passContextInQuery && encodedParams) {
      return `${CONFIG.tstructOptions.basePath}?${transParam}${openerParam}&${encodedParams}&act=open`;
    }

    return `${CONFIG.tstructOptions.basePath}?${transParam}${openerParam}&act=open`;
  }

    function serializeIViewParameters(parameters) {
        if (!parameters || typeof parameters !== "object") return "";
        return Object.keys(parameters)
            .filter((key) => parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "")
            .map((key) => `${key}~${String(parameters[key])}`)
            .join(",");
    }

    function buildIViewUrl(ivname, context) {
        const batchNo = context && (context.batchNo || context.batchId || context.batchCode);
        const iviewParamString = batchNo ? serializeIViewParameters({ batchno: batchNo }) : "";
        const params = [
            `ivname=${encodeURIComponent(ivname)}`,
            batchNo ? `batchno=${encodeURIComponent(batchNo)}` : "",
            batchNo ? `batchno000F1=${encodeURIComponent(batchNo)}` : "",
            iviewParamString ? `params=${encodeURIComponent(iviewParamString)}` : "",
            iviewParamString ? `param=${encodeURIComponent(iviewParamString)}` : "",
            "act=open",
        ].filter(Boolean).join("&");
        return `${CONFIG.tstructOptions.basePath.replace(/tstruct\.aspx$/i, "iview.aspx")}?${params}`;
    }

    function expandAxpertFieldNames(fieldNames) {
        return Array.from(new Set((fieldNames || [])
            .map((fieldName) => String(fieldName || "").trim())
            .filter(Boolean)
            .flatMap((fieldName) => fieldName.endsWith("000F1") ? [fieldName] : [fieldName, `${fieldName}000F1`])));
    }

    function dispatchInputEvents(element) {
        if (!element) return;
        const EventConstructor = element.ownerDocument && element.ownerDocument.defaultView
            ? element.ownerDocument.defaultView.Event
            : Event;

        ["input", "change", "blur"].forEach((eventName) => {
            element.dispatchEvent(new EventConstructor(eventName, { bubbles: true }));
        });
    }

    function normalizeSelectMatchValue(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    function findSelectOption(element, value, displayText) {
        const targets = [value, displayText].map(normalizeSelectMatchValue).filter(Boolean);
        if (!targets.length || !element || !element.options) return null;

        return Array.from(element.options).find((item) => {
            const optionValues = [
                item.value,
                item.text,
                item.getAttribute && item.getAttribute("data-value"),
                item.getAttribute && item.getAttribute("data-key"),
                item.getAttribute && item.getAttribute("title"),
            ].map(normalizeSelectMatchValue).filter(Boolean);

            return optionValues.some((optionValue) => targets.includes(optionValue));
        });
    }

    function setElementValue(element, value, displayText) {
        if (!element || value === undefined || value === null || value === "") return false;

        const tagName = (element.tagName || "").toLowerCase();
        const elementWindow = element.ownerDocument && element.ownerDocument.defaultView;

        if (tagName === "select") {
            const option = findSelectOption(element, value, displayText);
            if (!option) return false;
            element.value = option.value;
        } else {
            element.value = value;
        }

        dispatchInputEvents(element);

        try {
            if (elementWindow && elementWindow.jQuery) elementWindow.jQuery(element).trigger("change");
        } catch (error) {
            debugTstruct("jQuery change skipped", error);
        }

        return true;
    }

    function cssEscape(value, frameWindow) {
        const cssApi = frameWindow && frameWindow.CSS || window.CSS;
        return cssApi && typeof cssApi.escape === "function"
            ? cssApi.escape(value)
            : String(value).replace(/"/g, '\\"');
    }

    function findFieldByCandidates(frameDocument, candidates) {
        const frameWindow = frameDocument.defaultView;
        const fieldCandidates = expandAxpertFieldNames(candidates);

        for (const candidate of fieldCandidates) {
            const escaped = cssEscape(candidate, frameWindow);
            const field = frameDocument.querySelector([
                `[name="${escaped}"]`,
                `[id="${escaped}"]`,
                `[data-field="${escaped}"]`,
                `[data-axfield="${escaped}"]`,
                `[data-fieldname="${escaped}"]`,
            ].join(","));
            if (field) return field;
        }

        for (const candidate of fieldCandidates) {
            const escaped = cssEscape(candidate, frameWindow);
            const field = frameDocument.querySelector([
                `[name^="${escaped}"]`,
                `[id^="${escaped}"]`,
            ].join(","));
            if (field) return field;
        }

        return null;
    }

    function findFieldByLabel(frameDocument, labelText) {
        const normalizedLabel = String(labelText || "").trim().toLowerCase();
        if (!normalizedLabel) return null;

        const labels = Array.from(frameDocument.querySelectorAll("label, span, div, td, th"))
            .filter((item) => item.textContent && item.textContent.trim().toLowerCase() === normalizedLabel);

        for (const label of labels) {
            if (label.htmlFor) {
                const linkedField = frameDocument.getElementById(label.htmlFor);
                if (linkedField) return linkedField;
            }

            let container = label;
            for (let depth = 0; depth < 5 && container; depth += 1) {
                const field = container.querySelector && container.querySelector("select, input, textarea");
                if (field && field !== label) return field;

                const siblingField = container.nextElementSibling && container.nextElementSibling.querySelector &&
                    container.nextElementSibling.querySelector("select, input, textarea");
                if (siblingField) return siblingField;

                container = container.parentElement;
            }
        }

        return null;
    }

    function setAxpertFrameField(frameWindow, fieldNames, value, displayText) {
        const setterNames = ["SetFieldValue", "AxSetFieldValue", "SetValue", "SetField"];
        let didCallSetter = false;

        setterNames.forEach((setterName) => {
            const setter = frameWindow && frameWindow[setterName];
            if (typeof setter !== "function") return;

            fieldNames.forEach((fieldName) => {
                [[value], [value, displayText], displayText ? [displayText] : null].filter(Boolean).forEach((args) => {
                    try {
                        setter.apply(frameWindow, [fieldName, ...args]);
                        didCallSetter = true;
                    } catch (error) {
                        debugTstruct("Axpert setter skipped", { setterName, fieldName, error });
                    }
                });
            });
        });

        return didCallSetter;
    }

    function getContextFieldCandidates(frameDocument, config) {
        const fields = [];
        const seen = new Set();

        const addField = (field) => {
            if (!field) return;
            const key = field.id || field.getAttribute("name") || field.getAttribute("data-field") || field.getAttribute("data-axfield") || field.getAttribute("placeholder") || "";
            if (!key || seen.has(key)) return;
            seen.add(key);
            fields.push(field);
        };

        (config.labels || []).forEach((label) => addField(findFieldByLabel(frameDocument, label)));
        addField(findFieldByCandidates(frameDocument, config.fieldNames));

        Array.from(frameDocument.querySelectorAll("input, select, textarea"))
            .filter((field) => {
                const text = [
                    field.id,
                    field.getAttribute("name"),
                    field.getAttribute("data-field"),
                    field.getAttribute("data-axfield"),
                    field.getAttribute("data-fieldname"),
                    field.getAttribute("placeholder"),
                    field.getAttribute("aria-label"),
                    field.getAttribute("title"),
                ].join(" ").toLowerCase();

                return (config.keywords || []).some((keyword) => text.includes(String(keyword || "").toLowerCase()));
            })
            .forEach(addField);

        return fields;
    }

    function triggerAxpertDependentReload(frameWindow, frameDocument, config) {
        const fields = getContextFieldCandidates(frameDocument, config);
        const reloadFns = [
            "OnChangeField", "FieldChanged", "onFieldChange", "onchange",
            "LoadDependent", "LoadDependentCombo", "FillDependentCombo",
            "ReloadLOV", "LoadLOV", "FillCombo", "RefreshDependent",
        ];

        fields.forEach((field) => {
            const fieldName = field.getAttribute("name") || field.id || "";

            try {
                if (typeof field.onchange === "function") field.onchange();
            } catch (error) {
                debugTstruct("field onchange skipped", error);
            }

            try {
                dispatchInputEvents(field);
                if (frameWindow && frameWindow.jQuery) {
                    frameWindow.jQuery(field).trigger("change").trigger("change.select2");
                }
            } catch (error) {
                debugTstruct("dependent change skipped", error);
            }

            reloadFns.forEach((fnName) => {
                const fn = frameWindow && frameWindow[fnName];
                if (typeof fn !== "function") return;

                try {
                    fn.call(frameWindow, fieldName);
                } catch (error) {
                    debugTstruct("Axpert dependent reload skipped", { fnName, fieldName, error });
                }
            });
        });
    }

    function applyFieldContextToTstruct(frameWindow, frameDocument, config) {
        if (!config.value) return false;

        const fieldNames = expandAxpertFieldNames(config.fieldNames);
        const setterApplied = setAxpertFrameField(frameWindow, fieldNames, config.value, config.displayText);

        for (const field of getContextFieldCandidates(frameDocument, config)) {
            if (setElementValue(field, config.value, config.displayText)) return true;
            if (config.displayText && setElementValue(field, config.displayText, config.displayText)) return true;
        }

        return setterApplied;
    }

    function schedulePrefillReload(context, stageKey, frameWindow, frameDocument, config) {
        const flagName = `_${stageKey}ReloadTriggered`;
        if (context[flagName]) return;

        context[flagName] = true;
        window.setTimeout(() => {
            triggerAxpertDependentReload(frameWindow, frameDocument, config);
        }, 150);
    }

    function clearPlacementOriginFields(frameWindow, frameDocument) {
        if (!frameDocument) return false;

        const fieldConfigs = [
            {
                fieldNames: ["fromunit", "fromunitid", "fromunitcode", "fromsubunit"],
                labels: ["From Unit", "From Location"],
                keywords: ["fromunit", "fromsubunit"],
            },
            {
                fieldNames: [
                    "fromhouse", "fromhouseid", "fromhousecode", "fromsubunit",
                    "fromsublocation", "fromsublocationid", "fromsublocationcode",
                ],
                labels: ["From House", "From Sub Unit", "From Location"],
                keywords: ["fromhouse", "fromsubunit", "fromsublocation"],
            },
        ];

        let cleared = false;
        fieldConfigs.forEach((config) => {
            getContextFieldCandidates(frameDocument, config).forEach((field) => {
                const tagName = (field.tagName || "").toLowerCase();
                if (tagName === "select") {
                    field.selectedIndex = -1;
                    field.value = "";
                } else {
                    field.value = "";
                }
                try {
                    if (frameWindow && frameWindow.jQuery) frameWindow.jQuery(field).val(null).trigger("change.select2");
                } catch (error) {
                    debugTstruct("placement origin clear skipped", error);
                }
                cleared = true;
            });

            if (setAxpertFrameField(frameWindow, config.fieldNames, "", "")) cleared = true;
        });

        return cleared;
    }

    function schedulePlacementOriginClear(context, frameWindow, frameDocument) {
        if (!context || context._placementOriginClearScheduled) return;
        context._placementOriginClearScheduled = true;

        [250, 700, 1400, 2200].forEach((delay) => {
            window.setTimeout(() => {
                if (pendingTstructContext === context && context.transid === "btplc") {
                    clearPlacementOriginFields(frameWindow, frameDocument);
                }
            }, delay);
        });
    }

    function applyContextToTstruct() {
        const context = pendingTstructContext;
        if (!context) return null;
        if (!context.unitId && !context.unitName && !context.houseId && !context.houseName && !context.batchId && !context.batchCode) {
            return { complete: true };
        }

        let frameWindow;
        let frameDocument;

        try {
            frameWindow = tstructFrame.contentWindow;
            frameDocument = tstructFrame.contentDocument || (frameWindow && frameWindow.document);
        } catch (error) {
            console.warn("[Broiler Operations] Unable to access TStruct iframe for context prefill.", error);
            return null;
        }

        if (!frameWindow || !frameDocument || !frameDocument.body) return null;

        let unitApplied = Boolean(context._unitApplied);
        let houseApplied = Boolean(context._houseApplied);
        let batchApplied = Boolean(context._batchApplied);

        // Placement (btplc) should only receive the batch ID. Its From Unit and
        // From House fields are intentionally left for the operator to choose.
        if (context.transid === "btplc") {
            context._unitApplied = true;
            context._houseApplied = true;
            unitApplied = true;
            houseApplied = true;
        }

        if (!context._unitApplied) {
            const unitConfig = {
                value: context.unitName || context.unitId,
                displayText: context.unitId,
                fieldNames: ["unit", "unitname"],
                labels: context.transid === "house" ? ["Unit Name", "Unit"] : ["Unit", "Unit Name"],
                keywords: ["unit"],
            };

            if (!unitConfig.value || applyFieldContextToTstruct(frameWindow, frameDocument, unitConfig)) {
                context._unitApplied = true;
                unitApplied = true;
                if (unitConfig.value) schedulePrefillReload(context, "unit", frameWindow, frameDocument, unitConfig);
                return { complete: false, unitApplied, houseApplied, batchApplied, stage: "unit" };
            }
        }

        const houseNeeded = Boolean(context.houseName || context.houseCode || context.houseId);
        if (houseNeeded && !context._houseApplied) {
            const houseConfig = {
                value: context.houseName || context.houseCode || context.houseId,
                displayText: context.houseCode || context.houseId,
                fieldNames: ["house", "houseid", "housename", "housecode"],
                labels: ["House", "House Name"],
                keywords: ["house"],
            };

            if (applyFieldContextToTstruct(frameWindow, frameDocument, houseConfig)) {
                context._houseApplied = true;
                houseApplied = true;
                schedulePrefillReload(context, "house", frameWindow, frameDocument, houseConfig);
                return { complete: false, unitApplied, houseApplied, batchApplied, stage: "house" };
            }
        } else if (!houseNeeded) {
            context._houseApplied = true;
            houseApplied = true;
        }

        if (!context._batchApplied) {
            const batchValue = context.batchId || context.batchCode || "";
            if (!batchValue) {
                context._batchApplied = true;
                batchApplied = true;
            } else if (applyFieldContextToTstruct(frameWindow, frameDocument, {
                value: batchValue,
                displayText: context.batchCode || context.batchId,
                fieldNames: context.transid === "btplc"
                    ? ["batchid", "batchid000F1"]
                    : ["batch", "batchid", "batchno", "batchnumber"],
                labels: context.transid === "btplc" ? ["Batch ID", "Batch"] : ["Batch", "Batch No"],
                keywords: context.transid === "btplc" ? ["batchid"] : ["batch"],
            })) {
                context._batchApplied = true;
                batchApplied = true;
                schedulePlacementOriginClear(context, frameWindow, frameDocument);
            }
        }

        const complete = context._unitApplied && context._houseApplied && context._batchApplied;
        return { complete, unitApplied, houseApplied, batchApplied };
    }

    function prefillTstructUnitContext() {
        const startedAt = Date.now();
        const maxWaitMs = 6000;
        const pollDelayMs = 400;

        const poll = () => {
            if (!pendingTstructContext) return;
            const status = applyContextToTstruct();
            if (status && status.complete) return;
            if (Date.now() - startedAt < maxWaitMs) window.setTimeout(poll, pollDelayMs);
        };

        poll();
    }

    function setIViewElementValue(element, value, displayText) {
        if (!element || !value) return false;

        const tagName = (element.tagName || "").toLowerCase();
        const elementWindow = element.ownerDocument && element.ownerDocument.defaultView;

        if (tagName === "select") {
            let option = findSelectOption(element, value, displayText);
            if (!option) {
                const OptionConstructor = elementWindow && elementWindow.Option ? elementWindow.Option : Option;
                option = new OptionConstructor(displayText || value, value, true, true);
                element.add(option);
            }
            element.value = option.value;
        } else {
            element.value = value;
        }

        dispatchInputEvents(element);

        try {
            if (elementWindow && elementWindow.jQuery) {
                elementWindow.jQuery(element).val(element.value).trigger("change").trigger("change.select2");
            }
        } catch (error) {
            debugTstruct("iView jQuery change skipped", error);
        }

        return true;
    }

    function clickIViewSearchButton(context, frameDocument) {
        if (!context || context._searchClicked || !frameDocument) return;
        context._searchClicked = true;

        window.setTimeout(() => {
            const buttons = Array.from(frameDocument.querySelectorAll("button, input[type='button'], input[type='submit'], a"));
            const searchButton = buttons.find((button) => {
                const text = [
                    button.textContent,
                    button.value,
                    button.getAttribute && button.getAttribute("title"),
                    button.getAttribute && button.getAttribute("aria-label"),
                ].join(" ").trim().toLowerCase();
                return text === "search" || text.includes(" search");
            });

            if (searchButton && typeof searchButton.click === "function") searchButton.click();
        }, 300);
    }

    function applyContextToIView() {
        const context = pendingIViewContext;
        if (!context) return null;

        const batchNo = context.batchNo || context.batchId || context.batchCode || "";
        if (!batchNo) return { complete: true };

        let frameWindow;
        let frameDocument;

        try {
            frameWindow = tstructFrame.contentWindow;
            frameDocument = tstructFrame.contentDocument || (frameWindow && frameWindow.document);
        } catch (error) {
            console.warn("[Broiler Operations] Unable to access iView iframe for context prefill.", error);
            return null;
        }

        if (!frameWindow || !frameDocument || !frameDocument.body) return null;

        const config = {
            value: batchNo,
            displayText: batchNo,
            fieldNames: ["batchno", "batch", "batchid", "batchnumber"],
            labels: ["Batch No", "Batch No.", "Batch No. *", "Batch"],
            keywords: ["batch"],
        };

        let applied = applyFieldContextToTstruct(frameWindow, frameDocument, config);
        if (!applied) {
            applied = getContextFieldCandidates(frameDocument, config)
                .some((field) => setIViewElementValue(field, batchNo, batchNo));
        }

        if (applied) {
            context._batchApplied = true;
            triggerAxpertDependentReload(frameWindow, frameDocument, config);
            clickIViewSearchButton(context, frameDocument);
        }

        return { complete: Boolean(context._batchApplied), batchApplied: Boolean(context._batchApplied) };
    }

    function prefillIViewContext() {
        const startedAt = Date.now();
        const maxWaitMs = 7000;
        const pollDelayMs = 400;

        const poll = () => {
            if (!pendingIViewContext) return;
            const status = applyContextToIView();
            if (status && status.complete) return;
            if (Date.now() - startedAt < maxWaitMs) window.setTimeout(poll, pollDelayMs);
        };

        poll();
    }

    async function loadTargetParamsForTstruct(context) {
        if (!context || context.targetParams || context.targetparams || !context.houseName) return context;
        if (!window.BroilerAPI || typeof window.BroilerAPI.loadTargetParamsForHouse !== "function") return context;

        try {
            const targetParams = await window.BroilerAPI.loadTargetParamsForHouse({
                id: context.houseId,
                code: context.houseCode,
                name: context.houseName,
                unit: context.unitId,
                unitName: context.unitName,
            });

            if (targetParams) {
                context.targetParams = targetParams;
                const house = houses.find((item) => item.id === context.houseId);
                rememberTargetParamsForHouse(house || context, targetParams);
            }
        } catch (error) {
            console.warn("[Broiler Operations] Failed to load TStruct target params.", error);
        }

        return context;
    }

    async function openTstruct(actionKey, context) {
        if (actionKey === "placement" && context && context.placementDone) return;

        const action = AXPERT_TSTRUCTS[actionKey];
        if (!action || !tstructFrame || !tstructPanel) return;

        pendingIViewContext = null;
        pendingTstructContext = Object.assign({ module: CONFIG.key }, context || {}, {
            actionKey,
            transid: action.transid,
            title: action.title,
        });

        const currentContext = pendingTstructContext;
        await loadTargetParamsForTstruct(pendingTstructContext);
        if (pendingTstructContext !== currentContext) return;

        tstructFrame.src = buildTstructUrl(action.transid, pendingTstructContext);
        console.log("malintha url ",tstructFrame.src)
        tstructPanel.classList.add("is-open");
        tstructPanel.setAttribute("aria-hidden", "false");
    }

    function openIView(actionKey, context) {
        const action = AXPERT_IVIEWS[actionKey];3
        if (!action || !tstructFrame || !tstructPanel) return;

        pendingTstructContext = null;
        pendingIViewContext = Object.assign({ module: CONFIG.key }, context || {}, {
            actionKey,
            ivname: action.ivname,
            title: action.title,
        });
        tstructFrame.src = buildIViewUrl(action.ivname, pendingIViewContext);
        tstructPanel.classList.add("is-open");
        tstructPanel.setAttribute("aria-hidden", "false");
    }

    function closeTstructPanel() {
        tstructPanel.classList.remove("is-open");
        tstructPanel.setAttribute("aria-hidden", "true");
        pendingTstructContext = null;
        pendingIViewContext = null;
        tstructFrame.src = "about:blank";
    }

    function closeOpenMenus(exceptMenu) {
        document.querySelectorAll("details[open]").forEach(function (menu) {
            if (menu !== exceptMenu) {
                menu.removeAttribute("open");
            }
        });
    }

    function reloadCurrentFrame() {
        if (window.location && typeof window.location.reload === "function") {
            window.location.reload();
            return;
        }

        if (selectedHouseId) {
            renderHouseDetail(selectedHouseId);
        } else {
            renderHouses(currentSearchValue);
        }
    }

    function actionContext(house) {
        return {
            module: CONFIG.key,
            unitId: house ? house.unit : selectedUnit === "all" ? "" : selectedUnit,
            unitName: house ? getHouseUnitLabel(house) : getUnitLabelByValue(selectedUnit),
            houseId: house ? house.id : "",
            houseCode: house ? house.code : "",
            houseName: house ? house.name : "",
            batchId: house ? house.batchId : "",
            batchCode: house ? house.batchCode || house.batchId : "",
            placementDone: house ? hasPlacementDone(house) : false,
            targetParams: house ? house.targetParams || getCachedTargetParams(house) : "",
        };
    }

    function getScheduleRowFromButton(house, button) {
        const schedules = house && Array.isArray(house.schedules) ? house.schedules : [];
        const rowIndex = Number(button && button.dataset.scheduleRowIndex);
        return Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < schedules.length
            ? schedules[rowIndex]
            : null;
    }

    function scheduleActionContext(house, button) {
        const schedule = getScheduleRowFromButton(house, button);
        return Object.assign(actionContext(house), {
            scheduleId: schedule ? schedule.id || "" : "",
            scheduleName: schedule ? schedule.name || "" : "",
            scheduleDate: schedule ? schedule.date || "" : "",
            scheduleAge: schedule ? schedule.age || "" : "",
            scheduleStatus: schedule ? normalizeActivityStatus(schedule.status) : "",
        });
    }

    function metric(label, value) {
        return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
    }

    function birdCountLabel(house) {
        return formatNumber(house.totalBirds);
    }

    function percentLabel(value) {
        return `${formatNumber(value, 1)}%`;
    }

    function eggProductionPercent(house) {
        return house.liveHens ? (house.totalEggsProduced / house.liveHens) * 100 : 0;
    }

    function feedPerBird(house) {
        if (house.feedPerBird) return house.feedPerBird;
        return house.birdsHoused ? house.totalFeedGivenKg / house.birdsHoused : 0;
    }

    function mortalityRate(house) {
        if (house.mortalityRate) return house.mortalityRate;
        return house.totalBirds ? (house.deadBirds / house.totalBirds) * 100 : 0;
    }

    function bodyWeightUniformity(house) {
        return house.sampledBirds ? (house.birdsWithinTargetWeight / house.sampledBirds) * 100 : 0;
    }

    function getHousePlacementDate(house) {
        if (house.placementDate) return house.placementDate;
        const hash = house.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const day = (hash % 28) + 1;
        const month = (hash % 12) + 1;
        const year = new Date().getFullYear();
        return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }

    function getHouseStage(house) {
        const placementDateStr = getHousePlacementDate(house);
        const parts = placementDateStr.split("/");
        const placementDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const today = new Date();
        placementDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return today < placementDate ? "Grower" : "Layer";
    }

    function isGrowerStage(house) {
        return String(house && house.stage || "").trim().toUpperCase() === "GROWER";
    }

    function hasPlacementDone(house) {
        return Boolean(house && house.placementDone);
    }

    function isDayEnded(house) {
        return Boolean(house && house.dayEnd);
    }

    function isReadyToHarvest(house) {
        return Boolean(house && house.readyToHarvest);
    }

    function getHouseActionKeys(actions, house) {
        return actions.filter((action) => {
            if (isGrowerStage(house) && action === "eggCollection") return false;
            if (hasPlacementDone(house) && action === "placement") return false;
            return true;
        });
    }

    function getQuickEntryActions(house) {
        return QUICK_ENTRY_ACTIONS.filter((action) => {
            if (isGrowerStage(house) && action.key === "eggCollection") return false;
            if (hasPlacementDone(house) && action.key === "placement") return false;
            return true;
        });
    }

    function getHouseHarvestDate(house) {
        return house.harvestDate || house.harvest_date || "";
    }

    function renderHouseCard(house) {
        const readyToHarvest = isReadyToHarvest(house);
        const stageClass = readyToHarvest ? " live-transfer-card is-ready-to-transfer" : " ready-harvest-card";
        return `
      <article class="house-card${stageClass}" data-house-id="${escapeAttribute(house.id || "")}" role="button" tabindex="0">
        <div class="house-card-header">
          <div class="house-card-copy">
            <h3>
              <span>${escapeHtml(house.name || "")}</span>
              <span class="house-code-pill">${escapeHtml(house.code || "")}</span>
            </h3>
            <div class="house-subline">
              <small>${escapeHtml(house.stage || "-")} house</small>
              <span class="flock-age-badge">Flock age: ${escapeHtml(house.flockAge || "-")}</span>
              ${readyToHarvest ? '<span class="transfer-state-badge status-badge">Ready for transfer</span>' : ""}
            </div>
          </div>
          <div class="house-tools">
            <details class="card-menu">
              <summary aria-label="House actions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg></summary>
              <div class="command-popover align-right">
                ${getHouseActionKeys(CONFIG.cardActions, house).filter((action) => action !== "batchCreation").map((action) => `<button type="button" data-tstruct-action="${escapeAttribute(action)}" data-house-id="${escapeAttribute(house.id || "")}">${escapeHtml(actionText(action))}</button>`).join("")}
              </div>
            </details>
          </div>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", escapeHtml(house.batchId || "-"))}
          ${metric("Bird count", birdCountLabel(house))}
          ${metric("Placement Date", escapeHtml(formatDate(getHousePlacementDate(house))))}
          ${metric("Expected Production Date", escapeHtml(formatDate(getHouseHarvestDate(house) || "-")))}
          ${metric("Feed / Bird", `${formatNumber(feedPerBird(house), 3)} kg`)}
          ${metric("Mortality Rate", percentLabel(mortalityRate(house)))}
        </div>
        ${renderTransferAction(house)}
      </article>
    `;
    }

    function renderTransferAction(house) {
        const houseId = escapeAttribute(house && house.id || "");
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!hasPlacementDone(house)) return "";
        if (isReadyToHarvest(house)) {
            return `
      <button class="command-button primary live-bird-transfer-button" type="button" data-tstruct-action="liveBirdTransferRequest" data-house-id="${houseId}" ${batchId ? "" : "disabled"}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l-2-2m2 2-2 2M17 17H7l2 2m-2-2 2-2" /></svg>
        <span>Live Bird Transfer Request</span>
      </button>`;
        }
        return `
      <button class="command-button primary ready-to-harvest-button" type="button" data-ready-to-harvest data-house-id="${houseId}" ${batchId ? "" : "disabled"}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        <span>Ready To Harvest Update</span>
      </button>`;
    }

    function renderDayEndButton(house) {
        const houseId = escapeAttribute(house && house.id || "");
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        const completed = isDayEnded(house);
        const label = completed ? "Day End Completed" : "Day End";
        const icon = completed
            ? "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5V10zm7 4v2"
            : "M12 3v9M8 8l4 4 4-4M5 16v4h14v-4";
        return `
      <button class="command-button primary day-end-button ${completed ? "is-completed" : ""}" type="button" data-day-end data-house-id="${houseId}" ${batchId && !completed ? "" : "disabled"} aria-label="${label}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icon}" /></svg>
        <span>${label}</span>
      </button>
    `;
    }

    function renderDayEndConfirmation(house) {
        if (!dayEndConfirmation || dayEndConfirmation.houseId !== house.id) return "";

        const processing = Boolean(dayEndConfirmation.processing);
        const disabled = processing ? "disabled" : "";
        const error = dayEndConfirmation.error
            ? `<p class="day-end-confirmation-error" role="alert">${escapeHtml(dayEndConfirmation.error)}</p>`
            : "";

        return `
      <div class="activity-modal-backdrop" role="presentation">
        <section class="activity-modal day-end-confirmation" role="dialog" aria-modal="true" aria-labelledby="dayEndConfirmationTitle">
          <div class="activity-modal-header">
            <div>
              <h3 id="dayEndConfirmationTitle">Confirm Day End</h3>
              <p>Mark batch ${escapeHtml(house.batchId || house.batchCode || "")} as Day End?</p>
            </div>
          </div>
          ${error}
          <div class="activity-modal-footer">
            <button class="activity-modal-cancel-button" type="button" data-day-end-cancel ${disabled}>No</button>
            <button class="activity-modal-save-button" type="button" data-day-end-confirm ${disabled}>${processing ? "Processing..." : "Yes"}</button>
          </div>
        </section>
      </div>
    `;
    }

    function renderReadyToHarvestConfirmation(house) {
        if (!readyToHarvestConfirmation || !house || readyToHarvestConfirmation.houseId !== house.id) return "";

        const processing = Boolean(readyToHarvestConfirmation.processing);
        const disabled = processing ? "disabled" : "";
        const error = readyToHarvestConfirmation.error
            ? `<p class="ready-to-harvest-confirmation-error" role="alert">${escapeHtml(readyToHarvestConfirmation.error)}</p>`
            : "";

        return `
      <div class="activity-modal-backdrop" role="presentation">
        <section class="activity-modal ready-to-harvest-confirmation" role="dialog" aria-modal="true" aria-labelledby="readyToHarvestConfirmationTitle">
          <div class="activity-modal-header">
            <div>
              <h3 id="readyToHarvestConfirmationTitle">Confirm Ready To Harvest</h3>
              <p>Mark batch ${escapeHtml(house.batchId || house.batchCode || "")} as ready to harvest?</p>
            </div>
          </div>
          ${error}
          <div class="activity-modal-footer">
            <button class="activity-modal-cancel-button" type="button" data-ready-to-harvest-cancel ${disabled}>No</button>
            <button class="activity-modal-save-button" type="button" data-ready-to-harvest-confirm ${disabled}>${processing ? "Processing..." : "Yes"}</button>
          </div>
        </section>
      </div>
    `;
    }

    function getReadyToHarvestConfirmationHouse() {
        return houses.find((item) => item.id === (readyToHarvestConfirmation && readyToHarvestConfirmation.houseId));
    }

    function openReadyToHarvestConfirmation(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!house || !batchId || isReadyToHarvest(house)) return;
        readyToHarvestConfirmation = { houseId: house.id, processing: false, error: "" };
        if (selectedHouseId === house.id) renderHouseDetail(house.id, { skipDataLoad: true });
        else renderHouses(currentSearchValue);
    }

    function closeReadyToHarvestConfirmation(house) {
        readyToHarvestConfirmation = null;
        if (house && selectedHouseId === house.id) renderHouseDetail(house.id, { skipDataLoad: true });
        else renderHouses(currentSearchValue);
    }

    function openDayEndConfirmation(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!house || !batchId || isDayEnded(house)) return;
        dayEndConfirmation = { houseId: house.id, processing: false, error: "" };
        renderHouseDetail(house.id, { skipDataLoad: true });
    }

    function closeDayEndConfirmation(house) {
        dayEndConfirmation = null;
        if (house) renderHouseDetail(house.id, { skipDataLoad: true });
    }

    function renderQuickEntryMenu(house) {
        const houseId = escapeAttribute(house.id || "");
        const batchId = escapeAttribute(house.batchId || house.batchCode || "");
        return `
      <details class="command-menu entry-menu">
        <summary class="command-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8l1 3H7l1-3zM6 7h12v13H6z" /></svg>
          <span>Entry</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div class="entry-grid-popover align-right">
          ${getQuickEntryActions(house).map((action) => `
            <button class="entry-grid-option" type="button" data-tstruct-action="${escapeAttribute(action.key)}" data-house-id="${houseId}" data-batch-id="${batchId}">
              <span class="entry-grid-icon">${svgIcon(action.icon)}</span>
              <span>${escapeHtml(actionText(action.key))}</span>
            </button>
          `).join("")}
          ${QUICK_ENTRY_IVIEW_ACTIONS.map((action) => `
            <button class="entry-grid-option" type="button" data-iview-action="${escapeAttribute(action.key)}" data-house-id="${houseId}" data-batch-id="${batchId}">
              <span class="entry-grid-icon">${svgIcon(action.icon)}</span>
              <span>${escapeHtml(AXPERT_IVIEWS[action.key] ? AXPERT_IVIEWS[action.key].title : action.key)}</span>
            </button>
          `).join("")}
        </div>
      </details>
    `;
    }

    function contextItem(label, value, iconPath) {
        return `
      <div class="context-item">
        <span class="context-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${iconPath}" /></svg></span>
        <div><span>${label}</span><strong>${value}</strong></div>
      </div>
    `;
    }

    function renderChartPeriodInput(periodKey, value, options) {
        const minValue = options[0] ? options[0].key : "";
        const maxValue = options[options.length - 1] ? options[options.length - 1].key : "";

        if (selectedChartRange === "month") {
            return `<input type="month" data-chart-period="${escapeAttribute(periodKey)}" value="${escapeAttribute(value)}" min="${escapeAttribute(minValue)}" max="${escapeAttribute(maxValue)}">`;
        }

        return `<input type="number" data-chart-period="${escapeAttribute(periodKey)}" value="${escapeAttribute(value)}" min="${escapeAttribute(minValue)}" max="${escapeAttribute(maxValue)}" step="1" inputmode="numeric" pattern="[0-9]*">`;
    }

    function renderChartPeriodControls() {
        const options = selectedChartRange === "month" ? MONTH_OPTIONS : YEAR_OPTIONS;
        const fromValue = selectedChartRange === "month" ? selectedMonthFrom : selectedYearFrom;
        const toValue = selectedChartRange === "month" ? selectedMonthTo : selectedYearTo;
        const label = selectedChartRange === "month" ? "Month range" : "Year range";
        const startLabel = selectedChartRange === "month" ? "Start month" : "Start year";
        const endLabel = selectedChartRange === "month" ? "End month" : "End year";

        return `
      <div class="chart-period-controls" aria-label="${label}">
        <span class="control-group-label">Period</span>
        <label class="period-field">
          <span>${startLabel}</span>
          ${renderChartPeriodInput("from", fromValue, options)}
        </label>
        <span class="period-separator">to</span>
        <label class="period-field">
          <span>${endLabel}</span>
          ${renderChartPeriodInput("to", toValue, options)}
        </label>
      </div>
    `;
    }

    function renderChartToolbar() {
        return `
      <section class="chart-report-toolbar">
        <div>
          <h2>Chart Statistics</h2>
          <p>Review house performance by selected month or year range.</p>
        </div>
        <div class="chart-toolbar-controls">
          <div class="period-mode-group">
            <span class="control-group-label">View</span>
            <div class="chart-range-tabs" aria-label="Chart range">
              ${Object.entries(CHART_RANGES).map(([range, item]) => `
                <button class="chart-range-button ${selectedChartRange === range ? "is-active" : ""}" type="button" data-chart-range="${range}">${item.label}</button>
              `).join("")}
            </div>
          </div>
          ${renderChartPeriodControls()}
        </div>
      </section>
    `;
    }

    function chartCard(key, title, axis) {
        return `
      <article class="chart-card" data-chart-key="${key}">
        <div class="chart-card-header">
          <div><h3>${title}</h3><p>${axis}</p></div>
        </div>
        <div class="chart-scroll">
          <canvas class="chart-canvas" data-chart="${key}"></canvas>
        </div>
      </article>
    `;
    }

    function renderActivityTabs() {
        const tabs = [
            { key: "schedule", label: "Schedule" },
            { key: "farmerActivity", label: "Farmer Activity" },
        ];

        return `
      <div class="activity-tabs" role="tablist" aria-label="Activity views">
        ${tabs.map((tab) => {
            const isActive = selectedActivityTab === tab.key;
            return `<button class="activity-tab${isActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${isActive ? "true" : "false"}" data-activity-tab="${escapeAttribute(tab.key)}">${escapeHtml(tab.label)}</button>`;
        }).join("")}
      </div>
    `;
    }

    function scheduleStatusClass(status) {
        return String(status || "").trim().toLowerCase() === "completed" ? "is-completed" : "is-pending";
    }

    function normalizeActivityStatus(status) {
        return String(status || "").trim().toLowerCase() === "completed" ? "Completed" : "Pending";
    }

    function normalizeScheduleStatusFilter(status) {
        const normalizedStatus = String(status || "").trim().toLowerCase();
        return normalizedStatus === "pending" || normalizedStatus === "completed" ? normalizedStatus : "all";
    }

    function scheduleMatchesStatusFilter(item) {
        if (selectedScheduleStatusFilter === "all") return true;
        return normalizeActivityStatus(item && item.status).toLowerCase() === selectedScheduleStatusFilter;
    }

    function updateActivityStatusSelectClass(select) {
        if (!select) return;
        const statusClass = scheduleStatusClass(select.value);
        select.classList.toggle("is-completed", statusClass === "is-completed");
        select.classList.toggle("is-pending", statusClass === "is-pending");
    }

    function renderActivityStatusPill(status) {
        const normalizedStatus = normalizeActivityStatus(status);
        return `<span class="activity-status-pill ${scheduleStatusClass(normalizedStatus)}">${escapeHtml(normalizedStatus)}</span>`;
    }

    function renderScheduleStatusEditButton(rowIndex, rowId) {
        return `<button class="activity-row-edit-button" type="button" data-schedule-status-edit="true" data-schedule-row-index="${escapeAttribute(rowIndex)}" data-activity-row-id="${escapeAttribute(rowId || "")}">Edit</button>`;
    }

    function renderScheduleStatusFilter() {
        const filters = [
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Completed" },
        ];

        return `
      <div class="schedule-status-filter" role="group" aria-label="Schedule status filter">
        <span>Status</span>
        <div class="schedule-status-filter-buttons">
          ${filters.map((filter) => {
            const isActive = selectedScheduleStatusFilter === filter.key;
            return `<button class="schedule-status-filter-button${isActive ? " is-active" : ""}" type="button" data-schedule-status-filter="${escapeAttribute(filter.key)}" aria-pressed="${isActive ? "true" : "false"}">${escapeHtml(filter.label)}</button>`;
          }).join("")}
        </div>
      </div>
    `;
    }

    function getScheduleStatusEditorItem(house) {
        if (!house || !scheduleStatusEditor || scheduleStatusEditor.houseId !== house.id) return null;
        const schedules = Array.isArray(house.schedules) ? house.schedules : [];
        const rowIndex = Number(scheduleStatusEditor.rowIndex);
        if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= schedules.length) return null;
        return { item: schedules[rowIndex], rowIndex };
    }

    function closeScheduleStatusEditor() {
        scheduleStatusEditor = null;
    }

    function renderScheduleStatusEditor(house) {
        const editor = getScheduleStatusEditorItem(house);
        if (!editor) return "";

        const item = editor.item;
        const rowId = item.id || editor.rowIndex + 1;
        const status = normalizeActivityStatus(item.status);

        return `
      <div class="activity-modal-backdrop" role="presentation">
        <div class="activity-modal" role="dialog" aria-modal="true" aria-label="Edit schedule status">
          <div class="activity-modal-header">
            <div>
              <h3>Edit Schedule Status</h3>
              <p>Only status can be changed here.</p>
            </div>
            <button class="activity-modal-close" type="button" data-schedule-status-cancel="true" aria-label="Cancel status edit">x</button>
          </div>
          <div class="activity-modal-table-wrap">
            <table>
              <thead><tr><th>#</th><th>Age</th><th>Sch. Date</th><th>Name</th><th>Dose</th><th>Method</th><th>Description</th><th>Current Status</th></tr></thead>
              <tbody>
                <tr>
                  <td>${escapeHtml(rowId)}</td>
                  <td>${escapeHtml(item.age || "-")}</td>
                  <td>${escapeHtml(formatDate(item.date))}</td>
                  <td>${escapeHtml(item.name || "-")}</td>
                  <td>${escapeHtml(item.dose || "-")}</td>
                  <td>${escapeHtml(item.method || "-")}</td>
                  <td>${escapeHtml(item.description || "-")}</td>
                  <td>${renderActivityStatusPill(status)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <label class="activity-modal-field">
            <span>Status</span>
            <select class="activity-status-select activity-modal-status-select ${scheduleStatusClass(status)}" data-schedule-status-editor-select="true">
              <option value="Pending"${status === "Pending" ? " selected" : ""}>Pending</option>
              <option value="Completed"${status === "Completed" ? " selected" : ""}>Completed</option>
            </select>
          </label>
          <div class="activity-modal-footer">
            <button class="activity-modal-cancel-button" type="button" data-schedule-status-cancel="true">Cancel</button>
            <button class="activity-modal-save-button" type="button" data-schedule-status-save="true">Save</button>
          </div>
        </div>
      </div>
    `;
    }

    function renderScheduleRows(house) {
        if (house.schedulesLoading) {
            return '<tr><td colspan="9" class="activity-empty-row">Loading schedules...</td></tr>';
        }

        const schedules = Array.isArray(house.schedules) ? house.schedules : [];
        if (!schedules.length) {
            return '<tr><td colspan="9" class="activity-empty-row">No schedules assigned to this batch.</td></tr>';
        }

        const filteredSchedules = schedules
            .map((item, index) => ({ item, index }))
            .filter((row) => scheduleMatchesStatusFilter(row.item));

        if (!filteredSchedules.length) {
            return '<tr><td colspan="9" class="activity-empty-row">No schedules match this status filter.</td></tr>';
        }

        return filteredSchedules.map(({ item, index }) => {
            const status = item.status || "Pending";
            const rowId = item.id || index + 1;
            return `
            <tr>
              <td>${escapeHtml(rowId)}</td>
              <td>${escapeHtml(item.age || "-")}</td>
              <td>${escapeHtml(formatDate(item.date))}</td>
              <td>${escapeHtml(item.name || "-")}</td>
              <td>${escapeHtml(item.dose || "-")}</td>
              <td>${escapeHtml(item.method || "-")}</td>
              <td>${escapeHtml(item.description || "-")}</td>
              <td>${renderActivityStatusPill(status)}</td>
              <td>${renderScheduleStatusEditButton(index, rowId)}</td>
            </tr>
        `;
        }).join("");
    }

    function refreshScheduleActivityPanel(house) {
        if (!house || selectedActivityTab !== "schedule" || selectedHouseId !== house.id) return;
        const activityPanels = houseDetail.querySelector(".activity-panels");
        if (activityPanels) activityPanels.innerHTML = renderScheduleActivityPanel(house);
    }

    function renderFarmerActivityRows(house) {
        if (house.farmerActivitiesLoading) {
            return '<tr><td colspan="7" class="activity-empty-row">Loading farmer activity...</td></tr>';
        }

        const activities = Array.isArray(house.farmerActivities) ? house.farmerActivities : [];
        if (!activities.length) {
            return '<tr><td colspan="7" class="activity-empty-row">No farmer activity assigned to this batch.</td></tr>';
        }

        return activities.map((item, index) => {
            const status = item.status || "Pending";
            const rowId = item.id || index + 1;
            return `
            <tr>
              <td>${escapeHtml(rowId)}</td>
              <td>${escapeHtml(item.task || "-")}</td>
              <td>${escapeHtml(item.instructions || "-")}</td>
              <td>${escapeHtml(item.finding || "-")}</td>
              <td>${renderActivityStatusPill(status)}</td>
              <td>${escapeHtml(item.priority || "-")}</td>
              <td>${escapeHtml(item.remark || "-")}</td>
            </tr>
        `;
        }).join("");
    }

    function renderScheduleActivityPanel(house) {
        return `
      <div class="activity-panel-body" role="tabpanel" aria-label="Schedule">
        <div class="table-panel-header activity-table-header">
          <div>
            <h3>Schedules</h3>
            <p>Medication, monitoring, and review actions attached to this broiler batch.</p>
          </div>
          <div class="activity-header-actions">
            ${renderScheduleStatusFilter()}
            <button class="command-button" type="button" data-tstruct-action="feedMedication" data-house-id="${escapeAttribute(house.id)}">Add Schedule</button>
          </div>
        </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Age</th><th>Sch. Date</th><th>Name</th><th>Dose</th><th>Method</th><th>Description</th><th>Status</th><th>Edit</th></tr></thead>
          <tbody>${renderScheduleRows(house)}</tbody>
        </table>
      </div>
      ${renderScheduleStatusEditor(house)}
      </div>
    `;
    }

    function renderFarmerActivityPanel(house) {
        return `
      <div class="activity-panel-body" role="tabpanel" aria-label="Farmer Activity">
        <div class="table-panel-header activity-table-header">
          <div>
            <h3>Farmer Activity</h3>
            <p>Tasks, findings, and remarks attached to this broiler batch.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Task</th><th>Instructions</th><th>Finding</th><th>Status</th><th>Priority</th><th>Remark</th></tr></thead>
            <tbody>${renderFarmerActivityRows(house)}</tbody>
          </table>
        </div>
      </div>
    `;
    }

    function renderActivitySection(house) {
        return `
      <section class="table-panel activity-panel">
        <div class="table-panel-header activity-section-header">
          <div>
            <h2>Activity</h2>
            <p>Track schedules and farmer activity for this broiler batch.</p>
          </div>
        </div>
        ${renderActivityTabs()}
        <div class="activity-panels">
          ${selectedActivityTab === "farmerActivity" ? renderFarmerActivityPanel(house) : renderScheduleActivityPanel(house)}
        </div>
      </section>
    `;
    }

    function renderHouseDetail(houseId, options) {
        const house = houses.find((item) => item.id === houseId);
        if (!house) return;

        const previousHouseId = selectedHouseId;
        selectedHouseId = house.id;
        if (previousHouseId && previousHouseId !== house.id) {
            selectedActivityTab = "schedule";
            selectedScheduleStatusFilter = "all";
            closeScheduleStatusEditor();
            dayEndConfirmation = null;
            readyToHarvestConfirmation = null;
        }
        renderDetailNavbar(house);
        moduleCommand.hidden = false;
        unitFilterBar.hidden = true;
        houseGrid.hidden = true;
        houseDetail.hidden = false;
        if (!options || !options.skipDataLoad) {
            house.schedulesLoading = Boolean(house.batchId || house.batchCode);
            house.farmerActivitiesLoading = Boolean(house.batchId || house.batchCode);
        }

        houseDetail.innerHTML = `
      <section class="context-strip">
        ${contextItem("Batch birds", formatNumber(house.birdsHoused), "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Live birds", formatNumber(house.liveHens), "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Mortality", `${formatNumber(house.deadBirds)} / ${percentLabel(mortalityRate(house))}`, "M12 3 3 20h18L12 3zM12 9v5M12 17h.01")}
      </section>

      ${renderChartToolbar()}

      <section class="chart-grid">
        ${chartCard("birds", "Birds Housed", "Count (Nos)")}
        ${chartCard("mortality", "Mortality", "Count (Nos)")}
        ${chartCard("feedKg", "Feed Consumption", "Feed Consumption (kg)")}
        ${chartCard("bodyWeight", "Body Weight", "Average grams")}
      </section>
        ${renderActivitySection(house)}
        ${renderDayEndConfirmation(house)}
        ${renderReadyToHarvestConfirmation(house)}
    `;

        requestAnimationFrame(function () {
            drawHouseCharts(house);
        });

        if (!options || !options.skipDataLoad) {
            loadHouseDetailData(house);
        }
    }

    function renderHouseList() {
        selectedHouseId = "";
        selectedActivityTab = "schedule";
        selectedScheduleStatusFilter = "all";
        closeScheduleStatusEditor();
        dayEndConfirmation = null;
        readyToHarvestConfirmation = null;
        renderListNavbar();
        moduleCommand.hidden = false;
        unitFilterBar.hidden = false;
        houseGrid.hidden = false;
        houseDetail.hidden = true;
        houseDetail.innerHTML = "";
    }

    function updateUnitFilters() {
        const unitSelect = document.getElementById("unitSelect");
        if (!unitSelect) return;

        const options = getActiveUnitOptions();

        const unitCounts = {};
        houses.forEach(function (house) {
            const key = getHouseUnitValue(house);
            if (key) unitCounts[key] = (unitCounts[key] || 0) + 1;
        });

        if (selectedUnit !== "all" && !options.some(function (opt) { return opt.value === selectedUnit; })) {
            selectedUnit = "all";
        }

        unitSelect.innerHTML = '<option value="all">All Units (' + houses.length + ')</option>' +
            options
                .map(function (unit) {
                    var count = unitCounts[unit.value] || 0;
                    var countLabel = count ? ' (' + count + ')' : '';
                    return '<option value="' + escapeAttribute(unit.value) + '">' + escapeHtml(unit.label) + countLabel + '</option>';
                })
                .join('');

        unitSelect.value = selectedUnit;
    }

    function renderHouses(query) {
        const search = (query || "").trim().toLowerCase();
        const visibleHouses = houses.filter((house) => {
            const matchesUnit = houseMatchesSelectedUnit(house);
            const matchesSearch = !search || [house.name, house.code, house.stage, house.batchId, house.status, getHouseUnitLabel(house)].join(" ").toLowerCase().includes(search);
            return matchesUnit && matchesSearch;
        });

        document.getElementById("activeHouseCount").textContent = formatNumber(houses.filter((house) => house.status === "Active").length);
        document.getElementById("birdTotal").textContent = formatNumber(houses.reduce((sum, house) => sum + house.birdsHoused, 0));
        updateUnitFilters();

        if (!visibleHouses.length) {
            houseGrid.innerHTML = `<div class="empty-state">${CONFIG.emptyLabel}</div>`;
            return;
        }

        if (selectedUnit === "all") {
            const grouped = visibleHouses.reduce((acc, house) => {
                const unitLabel = getHouseUnitLabel(house);
                if (!acc[unitLabel]) acc[unitLabel] = [];
                acc[unitLabel].push(house);
                return acc;
            }, {});

            const units = Object.keys(grouped).sort();
            let html = "";
            for (const unit of units) {
                html += `<div class="unit-separator"><h3>${unit}</h3><hr/></div>`;
                html += grouped[unit].map(renderHouseCard).join("");
            }
            houseGrid.innerHTML = html + renderReadyToHarvestConfirmation(getReadyToHarvestConfirmationHouse());
        } else {
            houseGrid.innerHTML = visibleHouses.map(renderHouseCard).join("") + renderReadyToHarvestConfirmation(getReadyToHarvestConfirmationHouse());
        }
    }

    async function completeDayEnd(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!batchId || !dayEndConfirmation || dayEndConfirmation.houseId !== house.id || dayEndConfirmation.processing) return;

        dayEndConfirmation = { houseId: house.id, processing: true, error: "" };
        renderHouseDetail(house.id, { skipDataLoad: true });

        try {
            if (!window.BroilerAPI || typeof window.BroilerAPI.executeDayEnd !== "function") {
                throw new Error("Broiler Day End datasource is unavailable.");
            }
            await window.BroilerAPI.executeDayEnd({ batchid: batchId });
            house.dayEnd = true;
            dayEndConfirmation = null;
            renderHouseDetail(house.id, { skipDataLoad: true });
        } catch (error) {
            console.error("[Broiler Operations] Day End failed.", error);
            dayEndConfirmation = { houseId: house.id, processing: false, error: "Unable to complete Day End. Please try again." };
            renderHouseDetail(house.id, { skipDataLoad: true });
        }
    }

    async function completeReadyToHarvest(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!batchId || !readyToHarvestConfirmation || readyToHarvestConfirmation.houseId !== house.id || readyToHarvestConfirmation.processing) return;

        readyToHarvestConfirmation = { houseId: house.id, processing: true, error: "" };
        if (selectedHouseId === house.id) renderHouseDetail(house.id, { skipDataLoad: true });
        else renderHouses(currentSearchValue);

        try {
            if (!window.BroilerAPI || typeof window.BroilerAPI.executeReadyToHarvestUpdate !== "function") {
                throw new Error("Broiler Ready To Harvest datasource is unavailable.");
            }
            await window.BroilerAPI.executeReadyToHarvestUpdate({ batchid: batchId });
            house.readyToHarvest = true;
            readyToHarvestConfirmation = null;
            if (selectedHouseId === house.id) renderHouseDetail(house.id, { skipDataLoad: true });
            else renderHouses(currentSearchValue);
        } catch (error) {
            console.error("[Broiler Operations] Ready To Harvest update failed.", error);
            readyToHarvestConfirmation = { houseId: house.id, processing: false, error: "Unable to update Ready To Harvest. Please try again." };
            if (selectedHouseId === house.id) renderHouseDetail(house.id, { skipDataLoad: true });
            else renderHouses(currentSearchValue);
        }
    }

    document.addEventListener("click", function (event) {
        const activeMenu = event.target.closest("details");
        closeOpenMenus(activeMenu);



        const refreshButton = event.target.closest("#refreshBtn");
        if (refreshButton) {
            reloadCurrentFrame();
            return;
        }

        const readyToHarvestCancelButton = event.target.closest("[data-ready-to-harvest-cancel]");
        if (readyToHarvestCancelButton) {
            event.preventDefault();
            event.stopPropagation();
            closeReadyToHarvestConfirmation(getReadyToHarvestConfirmationHouse());
            return;
        }

        const readyToHarvestConfirmButton = event.target.closest("[data-ready-to-harvest-confirm]");
        if (readyToHarvestConfirmButton) {
            event.preventDefault();
            event.stopPropagation();
            completeReadyToHarvest(getReadyToHarvestConfirmationHouse());
            return;
        }

        const readyToHarvestButton = event.target.closest("[data-ready-to-harvest]");
        if (readyToHarvestButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === (readyToHarvestButton.dataset.houseId || ""));
            openReadyToHarvestConfirmation(house);
            closeOpenMenus();
            return;
        }

        const dayEndCancelButton = event.target.closest("[data-day-end-cancel]");
        if (dayEndCancelButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === (dayEndConfirmation && dayEndConfirmation.houseId));
            closeDayEndConfirmation(house);
            return;
        }

        const dayEndConfirmButton = event.target.closest("[data-day-end-confirm]");
        if (dayEndConfirmButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === (dayEndConfirmation && dayEndConfirmation.houseId));
            completeDayEnd(house);
            return;
        }

        const dayEndButton = event.target.closest("[data-day-end]");
        if (dayEndButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === (dayEndButton.dataset.houseId || ""));
            openDayEndConfirmation(house);
            closeOpenMenus();
            return;
        }

        const rangeButton = event.target.closest("[data-chart-range]");
        if (rangeButton) {
            selectedChartRange = rangeButton.dataset.chartRange;
            if (selectedHouseId) {
                renderHouseDetail(selectedHouseId);
            }
            return;
        }

        const activityTab = event.target.closest("[data-activity-tab]");
        if (activityTab) {
            if (selectedActivityTab !== (activityTab.dataset.activityTab || "schedule")) closeScheduleStatusEditor();
            selectedActivityTab = activityTab.dataset.activityTab || "schedule";
            if (selectedHouseId) renderHouseDetail(selectedHouseId, { skipDataLoad: true });
            return;
        }

        const scheduleStatusFilterButton = event.target.closest("[data-schedule-status-filter]");
        if (scheduleStatusFilterButton) {
            const house = houses.find((item) => item.id === selectedHouseId);
            selectedScheduleStatusFilter = normalizeScheduleStatusFilter(scheduleStatusFilterButton.dataset.scheduleStatusFilter);
            closeScheduleStatusEditor();
            if (house) refreshScheduleActivityPanel(house);
            return;
        }

        const scheduleEditButton = event.target.closest("[data-schedule-status-edit]");
        if (scheduleEditButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === selectedHouseId);
            closeScheduleStatusEditor();
            openTstruct("scheduleMonitoring", scheduleActionContext(house, scheduleEditButton));
            closeOpenMenus();
            return;
        }

        const scheduleCancelButton = event.target.closest("[data-schedule-status-cancel]");
        if (scheduleCancelButton) {
            const house = houses.find((item) => item.id === selectedHouseId);
            closeScheduleStatusEditor();
            if (house) refreshScheduleActivityPanel(house);
            return;
        }

        const scheduleSaveButton = event.target.closest("[data-schedule-status-save]");
        if (scheduleSaveButton) {
            const house = houses.find((item) => item.id === selectedHouseId);
            const editor = getScheduleStatusEditorItem(house);
            const statusSelect = houseDetail.querySelector("[data-schedule-status-editor-select]");
            if (editor && statusSelect) editor.item.status = normalizeActivityStatus(statusSelect.value);
            closeScheduleStatusEditor();
            if (house) refreshScheduleActivityPanel(house);
            return;
        }

        const iviewButton = event.target.closest("[data-iview-action]");
        if (iviewButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === (iviewButton.dataset.houseId || ""));
            openIView(iviewButton.dataset.iviewAction, Object.assign(actionContext(house), {
                batchNo: house ? house.batchId || house.batchCode : "",
            }));
            closeOpenMenus();
            return;
        }

        const actionButton = event.target.closest("[data-tstruct-action]");
        if (actionButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = houses.find((item) => item.id === (actionButton.dataset.houseId || ""));
            openTstruct(actionButton.dataset.tstructAction, actionContext(house));
            closeOpenMenus();
            return;
        }

        if (event.target.closest("[data-back-to-houses]")) {
            renderHouseList();
            renderHouses(currentSearchValue);
            return;
        }

        if (event.target.closest(".card-menu")) return;

        const houseCard = event.target.closest("[data-house-id]");
        if (houseCard) {
            renderHouseDetail(houseCard.dataset.houseId);
            return;
        }

        if (event.target === tstructPanel) closeTstructPanel();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && readyToHarvestConfirmation) {
            closeReadyToHarvestConfirmation(getReadyToHarvestConfirmationHouse());
            return;
        }

        if (event.key === "Escape" && dayEndConfirmation) {
            const house = houses.find((item) => item.id === dayEndConfirmation.houseId);
            closeDayEndConfirmation(house);
            return;
        }

        if (event.key === "Escape" && scheduleStatusEditor) {
            const house = houses.find((item) => item.id === selectedHouseId);
            closeScheduleStatusEditor();
            if (house) refreshScheduleActivityPanel(house);
            return;
        }

        if (event.key === "Escape" && tstructPanel.classList.contains("is-open")) {
            closeTstructPanel();
            return;
        }
        if ((event.key === "Enter" || event.key === " ") && event.target.closest(".house-card")) {
            event.preventDefault();
            renderHouseDetail(event.target.closest(".house-card").dataset.houseId);
        }
    });

    document.addEventListener("change", function (event) {
        const activityStatusSelect = event.target.closest(".activity-status-select");
        if (activityStatusSelect) {
            updateActivityStatusSelectClass(activityStatusSelect);
            return;
        }

        const unitSelect = event.target.closest("#unitSelect");
        if (unitSelect) {
            selectedUnit = unitSelect.value;
            debugTstruct("unit filter changed", {
                selectedUnit,
                selectedUnitLabel: getUnitLabelByValue(selectedUnit),
            });
            renderHouses(currentSearchValue);
            return;
        }
        const periodSelect = event.target.closest("[data-chart-period]");
        if (!periodSelect) return;

        if (selectedChartRange === "month") {
            if (periodSelect.dataset.chartPeriod === "from") {
                selectedMonthFrom = periodSelect.value;
            } else {
                selectedMonthTo = periodSelect.value;
            }
        } else {
            if (periodSelect.dataset.chartPeriod === "from") {
                selectedYearFrom = periodSelect.value;
            } else {
                selectedYearTo = periodSelect.value;
            }
        }

        if (selectedHouseId) {
            renderHouseDetail(selectedHouseId);
        }
    });

    document.addEventListener("input", function (event) {
        if (event.target && event.target.id === "houseSearch") {
            currentSearchValue = event.target.value;
            if (!selectedHouseId) {
                renderHouses(currentSearchValue);
            }
        }
    });

    closeTstruct.addEventListener("click", closeTstructPanel);
    tstructFrame.addEventListener("load", prefillTstructUnitContext);
    tstructFrame.addEventListener("load", prefillIViewContext);

    window[CONFIG.exposeName] = {
        openTstruct,
        openIView,
        openHouse: renderHouseDetail,
        reloadUnits: loadUnitOptionsFromDataSource,
        reloadData: loadScreenDataFromDataSource,
        backToHouses: function () {
            renderHouseList();
            renderHouses(currentSearchValue);
        },
        tstructs: AXPERT_TSTRUCTS,
        houses,
    };
    console.log("application started")

    renderHouseList();
    renderHouses(currentSearchValue);
    // loadScreenDataFromDataSource();

    function drawHouseCharts(house) {
        const chartOptions = {
            birds: { color: "#2569e8", decimals: 0 },
            mortality: { color: "#df4d5f", decimals: 0 },
            feedKg: { color: "#00a896", decimals: 2 },
            bodyWeight: { color: "#d59220", decimals: 0 },
        };

        Object.keys(chartOptions).forEach(function (key) {
            const canvas = houseDetail.querySelector(`[data-chart="${key}"]`);
            if (!canvas) return;
            const series = getChartSeries(house, key, selectedChartRange);
            canvas.style.minWidth = `${Math.max(660, series.labels.length * 76)}px`;
            drawLineChart(canvas, series.labels, series.values, chartOptions[key]);
        });
    }

    function getChartSeries(house, key, range) {
        const metrics = house.metrics || {};
        const baseValues = metrics[key] || [];

        if (range === "month") {
            const months = getSelectedPeriodItems(MONTH_OPTIONS, selectedMonthFrom, selectedMonthTo);
            if (metrics.fromDataSource && Array.isArray(metrics.records) && metrics.records.length) {
                return aggregateChartRecords(metrics.records, key, "month", months);
            }
            if (metrics.fromDataSource && metrics.labels && baseValues.length === metrics.labels.length) {
                return { labels: metrics.labels, values: baseValues };
            }
            return {
                labels: months.map((item) => item.label),
                values: makeRangeValues(baseValues, key, range, months.length),
            };
        }

        if (range === "year") {
            const years = getSelectedPeriodItems(YEAR_OPTIONS, selectedYearFrom, selectedYearTo);
            if (metrics.fromDataSource && Array.isArray(metrics.records) && metrics.records.length) {
                return aggregateChartRecords(metrics.records, key, "year", years);
            }
            if (metrics.fromDataSource && metrics.labels && baseValues.length === metrics.labels.length) {
                return { labels: metrics.labels, values: baseValues };
            }
            return {
                labels: years.map((item) => item.label),
                values: makeRangeValues(baseValues, key, range, years.length),
            };
        }

        const months = getSelectedPeriodItems(MONTH_OPTIONS, selectedMonthFrom, selectedMonthTo);
        return {
            labels: months.map((item) => item.label),
            values: makeRangeValues(baseValues, key, "month", months.length),
        };
    }

    function aggregateChartRecords(records, key, range, periodItems) {
        const grouped = records.reduce(function (result, record) {
            const periodKey = range === "year" ? record.year : record.month;
            if (!periodKey) return result;
            result[periodKey] = result[periodKey] || [];
            result[periodKey].push(record);
            return result;
        }, {});

        return {
            labels: periodItems.map((item) => item.label),
            values: periodItems.map(function (item) {
                const periodRows = (grouped[item.key] || []).slice().sort(function (a, b) {
                    return (a.dateValue || 0) - (b.dateValue || 0);
                });
                if (!periodRows.length) return 0;

                if (key === "birds") {
                    return periodRows[periodRows.length - 1].birds || 0;
                }

                if (key === "bodyWeight") {
                    const readings = periodRows.map((row) => row.bodyWeight || 0).filter(function (value) {
                        return value > 0;
                    });
                    if (!readings.length) return 0;
                    return Math.round(readings.reduce((sum, value) => sum + value, 0) / readings.length);
                }

                const total = periodRows.reduce(function (sum, row) {
                    return sum + (row[key] || 0);
                }, 0);
                return key === "feedKg" ? Number(total.toFixed(2)) : Math.round(total);
            }),
        };
    }

    function getSelectedPeriodItems(options, fromValue, toValue) {
        const fromIndex = Math.max(0, options.findIndex((item) => item.key === fromValue));
        const toIndex = Math.max(0, options.findIndex((item) => item.key === toValue));
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        return options.slice(start, end + 1);
    }

    function makeRangeValues(seedValues, key, range, pointCount) {
        const count = Math.max(pointCount || 1, 1);
        if (!seedValues || !seedValues.length) {
            return Array.from({ length: count }, function () { return 0; });
        }

        const last = seedValues[seedValues.length - 1] || 0;
        const multipliers = Array.from({ length: count }, function (_, index) {
            const progress = count === 1 ? 1 : index / (count - 1);
            const seasonal = Math.sin(index * 1.7) * (range === "month" ? 0.016 : 0.025);
            const start = range === "year" ? 0.72 : 0.9;
            const lift = range === "year" ? 0.36 : 0.13;
            return start + progress * lift + seasonal;
        });

        if (key === "mortality") {
            return Array.from({ length: count }, function (_, index) {
                const wave = index % 3 === 0 ? 1 : 0;
                const value = Math.max(0, Math.round(last + wave + (range === "year" ? index % 2 : 0)));
                return value;
            });
        }

        return multipliers.map(function (multiplier) {
            const value = last * multiplier;
            if (key === "feedKg") return Number(value.toFixed(2));
            return Math.round(value);
        });
    }

    function shouldDrawChartMarker(index, total) {
        return total <= 7 || index === 0 || index === total - 1 || index % 2 === 0;
    }

    function drawLineChart(canvas, labels, values, options) {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(rect.width, 320);
        const height = Math.max(rect.height, 220);
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        const ctx = canvas.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const padding = { top: 24, right: 20, bottom: 38, left: 52 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const minValue = Math.min.apply(null, values);
        const maxValue = Math.max.apply(null, values);
        const range = maxValue - minValue || 1;
        const yMin = Math.max(0, minValue - range * 0.15);
        const yMax = maxValue + range * 0.18;
        const yRange = yMax - yMin || 1;
        const points = values.map(function (value, index) {
            return {
                x: padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index,
                y: padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight,
                label: labels[index],
                value,
            };
        });

        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i += 1) {
            const y = padding.top + (chartHeight / 4) * i;
            const value = yMax - (yRange / 4) * i;
            ctx.strokeStyle = "rgba(216, 226, 238, 0.78)";
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillStyle = "#536982";
            ctx.textAlign = "right";
            ctx.fillText(value.toFixed(options.decimals), padding.left - 12, y + 4);
        }

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, `${options.color}33`);
        gradient.addColorStop(1, `${options.color}05`);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.lineTo(points[0].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.strokeStyle = options.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        points.forEach(function (point, index) {
            if (shouldDrawChartMarker(index, points.length)) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.strokeStyle = options.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = "#536982";
                ctx.textAlign = "center";
                ctx.fillText(point.label, point.x, height - 12);
            }
        });
    }
})();

// ---- Merged Axpert datasource API from broilerapi.js ----
(function () {

    const DEBUG_PARENT_API = true;
    function debugAPI(message, payload) {

        if (!DEBUG_PARENT_API || !window.console) return;
        if (payload !== undefined) {
            console.log(`[Parent API] ${message}`, payload);
        } else {
            console.log(`[Parent API] ${message}`);
        }
    }

    const AXPERT_DATASOURCES = {
        units: {
            name: "poultry_broiler_unit",
            valueField: "locationcode",
            labelField: "locationname",
        },
        houses: { name: "poultry_broiler_house" },
        broilerBatchDetails: { name: "poultry_broiler_batch_details" },
        targetParams: { name: "poultry_targetparams" },
        dayEnd: { name: "poultry_dayend_update" },
        readyToHarvestUpdate: { name: "poultry_cull_harvest_update" },
        charts: { name: "poultry_card_chart_details" },
        schedules: { name: "poultry_schedule_details" },
        activities: { name: "poultry_activities_details" },
    };

    const TARGET_PARAM_FIELDS = [
        "targetParams", "targetparams", "target_params", "targetparam", "target_param",
        "tstructParams", "tstruct_params", "params", "param", "openerIV", "openeriv", "iv",
    ];

    function getAxpertWindows() {
        const windows = [window];

        try {
            if (window.parent && window.parent !== window) windows.push(window.parent);
        } catch (error) {
            // Cross-frame access can be blocked outside Axpert preview.
        }

        try {
            if (window.top && !windows.includes(window.top)) windows.push(window.top);
        } catch (error) {
            // Cross-frame access can be blocked outside Axpert preview.
        }

        try {
            if (window.opener && !windows.includes(window.opener)) windows.push(window.opener);
        } catch (error) {
            // Cross-frame access can be blocked outside Axpert preview.
        }

        return windows;
    }

    function extractAxpertGlobalVarValue(source, targetKeys, visited) {
        if (source === undefined || source === null) return "";

        const normalizedTargets = targetKeys.map(normalizeKey).filter(Boolean);
        const seen = visited || new WeakSet();

        if (typeof source === "string") {
            const trimmed = source.trim();
            if (!trimmed) return "";

            if (trimmed[0] === "{" || trimmed[0] === "[") {
                try {
                    return extractAxpertGlobalVarValue(JSON.parse(trimmed), targetKeys, seen);
                } catch (error) {
                    return trimmed;
                }
            }

            return trimmed;
        }

        if (typeof source !== "object" || seen.has(source)) return "";
        seen.add(source);

        if (Array.isArray(source)) {
            for (const item of source) {
                const value = extractAxpertGlobalVarValue(item, targetKeys, seen);
                if (value) return value;
            }
            return "";
        }

        for (const key of Object.keys(source)) {
            if (normalizedTargets.includes(normalizeKey(key))) {
                const value = source[key];
                if (value !== undefined && value !== null && value !== "") return String(value);
            }
        }

        const keyLabel = source.key || source.name || source.variable || source.var || source.field;
        const valueLabel = source.value !== undefined ? source.value : source.val !== undefined ? source.val : source.text;
        if (keyLabel && normalizedTargets.includes(normalizeKey(keyLabel))) {
            if (valueLabel !== undefined && valueLabel !== null && valueLabel !== "") return String(valueLabel);
        }

        for (const nestedKey of ["globalVars", "globalvars", "globals", "data", "rows", "result", "Result", "records", "Table", "table", "d"]) {
            if (Object.prototype.hasOwnProperty.call(source, nestedKey)) {
                const value = extractAxpertGlobalVarValue(source[nestedKey], targetKeys, seen);
                if (value) return value;
            }
        }

        return "";
    }


    function getGlobalVariableValue(key) {
        if (typeof parent !== 'undefined' && typeof parent.AxGetGlobalVar === 'function') {
            var GlobalData = parent.AxGetGlobalVar();
            console.log("malintha GlobalData ", GlobalData);
            if (GlobalData && GlobalData.globalVars && Array.isArray(GlobalData.globalVars)) {
                for (var i = 0; i < GlobalData.globalVars.length; i++) {
                    var obj = GlobalData.globalVars[i];
                    if (obj.hasOwnProperty(key)) {
                        return obj[key];
                    }
                }
            }
        }
        return "";
    }


    function readAxpertGlobalVar(possibleKeys) {
        const keys = Array.isArray(possibleKeys) ? possibleKeys : [possibleKeys];

        for (const frameWindow of getAxpertWindows()) {
            try {
                const stores = [
                    frameWindow.AxGlobalVars,
                    frameWindow.axGlobalVars,
                    frameWindow.globalVars,
                ];

                for (const store of stores) {
                    const storeValue = extractAxpertGlobalVarValue(store, keys);
                    if (storeValue) return storeValue;
                }

                if (typeof frameWindow.AxGetGlobalVar === "function") {
                    for (const key of keys) {
                        const raw = frameWindow.AxGetGlobalVar(key);
                        // Some Axpert builds return the value as a plain string directly.
                        if (raw && typeof raw === "string") {
                            const trimmed = raw.trim();
                            if (trimmed && trimmed[0] !== "{" && trimmed[0] !== "[") return trimmed;
                        }
                        // Other builds return the full globalVars JSON — extract from it.
                        const keyValue = extractAxpertGlobalVarValue(raw, [key]);
                        console.log("malintha keyValue ", keyValue);
                        if (keyValue) return keyValue;
                    }

                    const dumpValue = frameWindow.AxGetGlobalVar("");
                    const dumpMatch = extractAxpertGlobalVarValue(dumpValue, keys);
                    if (dumpMatch) return dumpMatch;
                }
            } catch (error) {
                // Ignore inaccessible frames and keep searching.
            }
        }

        return "";
    }

    function normalizeKey(value) {
        return String(value || "").replace(/[\s_]/g, "").toLowerCase();
    }

    function getMatchingFieldValue(object, fieldNames) {
        if (!object || typeof object !== "object") return "";
        const normalizedFields = fieldNames.map(normalizeKey).filter(Boolean);
        const sourceKey = Object.keys(object).find((key) => normalizedFields.includes(normalizeKey(key)));
        return sourceKey === undefined ? "" : object[sourceKey];
    }

    function normalizeTargetParamValue(value, requireQueryString, visited) {
        if (value === undefined || value === null) return "";

        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) return "";

            if (trimmed[0] === "{" || trimmed[0] === "[") {
                const nested = extractTargetParams(parseMaybeJson(trimmed), visited);
                if (nested) return nested;
            }

            if (!requireQueryString || trimmed.includes("=")) return trimmed.replace(/^\?/, "");
            return "";
        }

        if (typeof value === "number" || typeof value === "boolean") {
            return requireQueryString ? "" : String(value);
        }

        return extractTargetParams(value, visited);
    }

    function extractTargetParams(source, visited) {
        if (source === undefined || source === null) return "";

        const seen = visited || new WeakSet();
        const parsed = parseMaybeJson(source);

        if (typeof parsed !== "object" || parsed === null) {
            return normalizeTargetParamValue(parsed, true, seen);
        }

        if (seen.has(parsed)) return "";
        seen.add(parsed);

        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                const value = extractTargetParams(item, seen);
                if (value) return value;
            }
            return "";
        }

        const directValue = getMatchingFieldValue(parsed, TARGET_PARAM_FIELDS);
        const directParams = normalizeTargetParamValue(directValue, false, seen);
        if (directParams) return directParams;

        for (const nestedKey of ["result", "Result", "row", "data", "rows", "records", "Table", "table", "value", "values", "d"]) {
            if (Object.prototype.hasOwnProperty.call(parsed, nestedKey)) {
                const nestedParams = extractTargetParams(parsed[nestedKey], seen);
                if (nestedParams) return nestedParams;
            }
        }

        for (const value of Object.values(parsed)) {
            const fallbackParams = normalizeTargetParamValue(value, true, seen);
            if (fallbackParams) return fallbackParams;
        }

        return "";
    }

    function parseMaybeJson(value) {
        if (typeof value !== "string") return value;

        const trimmed = value.trim();
        if (!trimmed) return [];

        if (trimmed[0] === "{" || trimmed[0] === "[") {
            try {
                return JSON.parse(trimmed);
            } catch (error) {
                return value;
            }
        }

        return value;
    }

    function normalizeDataSourceRows(payload, dataSourceName) {
        const parsed = parseMaybeJson(payload);

        if (!parsed) return [];

        if (parsed && typeof parsed === "object" && typeof parsed.d === "string") {
            return normalizeDataSourceRows(parsed.d, dataSourceName);
        }

        if (Array.isArray(parsed)) {
            return parsed.reduce(function (rows, item) {
                const nestedRows = normalizeDataSourceRows(item, dataSourceName);
                if (nestedRows.length) return rows.concat(nestedRows);
                if (item && typeof item === "object" && !Array.isArray(item) && !isAxListEnvelope(item)) {
                    return rows.concat(item);
                }
                return rows;
            }, []);
        }

        if (typeof parsed !== "object") return [];

        const namedRows = getObjectValueByNormalizedKey(parsed, dataSourceName);
        if (namedRows !== undefined && namedRows !== parsed) {
            const rows = normalizeDataSourceRows(namedRows, dataSourceName);
            if (rows.length) return rows;
        }

        const nestedKeys = ["row", "rows", "data", "records", "Table", "table", "value", "values", "result", "Result", "d"];
        for (const key of nestedKeys) {
            if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                const rows = normalizeDataSourceRows(parsed[key], dataSourceName);
                if (rows.length) return rows;
            }
        }

        return isAxListEnvelope(parsed) ? [] : [parsed];
    }

    function getRowValue(row, possibleFieldNames) {
        if (!row || typeof row !== "object") return "";

        const normalizedFields = Object.keys(row).reduce((result, key) => {
            result[normalizeKey(key)] = row[key];
            return result;
        }, {});

        for (const fieldName of possibleFieldNames) {
            const value = normalizedFields[normalizeKey(fieldName)];
            if (value !== undefined && value !== null && value !== "") return String(value);
        }

        return "";
    }

    function readInjectedDataSource(dataSourceName) {
        for (const frameWindow of getAxpertWindows()) {
            const stores = [
                frameWindow[dataSourceName],
                frameWindow.AxDataSources && frameWindow.AxDataSources[dataSourceName],
                frameWindow.axDataSources && frameWindow.axDataSources[dataSourceName],
                frameWindow.dataSources && frameWindow.dataSources[dataSourceName],
            ];

            if (typeof frameWindow.AxGetGlobalVar === "function") {
                stores.push(frameWindow.AxGetGlobalVar(dataSourceName));
            }

            for (const storeValue of stores) {
                const rows = normalizeDataSourceRows(storeValue, dataSourceName);
                if (rows.length) return rows;
            }
        }

        return [];
    }

    function serializeDataSourceParameters(parameters) {
        if (!parameters || typeof parameters !== "object") return "";
        return Object.keys(parameters)
            .filter((key) => parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "")
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
            .join("&");
    }

    function serializeIViewParameters(parameters) {
        if (!parameters || typeof parameters !== "object") return "";
        return Object.keys(parameters)
            .filter((key) => parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "")
            .map((key) => `${key}~${String(parameters[key])}`)
            .join(",");
    }

    function callAxpertDataSourceFunction(dataSourceName, parameters) {
        for (const frameWindow of getAxpertWindows()) {
            const axListFunction = frameWindow.GetDataFromAxList;
            if (typeof axListFunction !== "function") continue;

            const sqlParams = parameters && typeof parameters === "object" ? parameters : {};
            const request = {
                adsNames: [dataSourceName],
                refreshCache: false,
                sqlParams,
                props: { ADS: true, pageno: 1, pagesize: 0 },
            };

            debugAPI("calling Axpert GetDataFromAxList", {
                dataSourceName,
                request,
                serializedParameters: serializeDataSourceParameters(sqlParams),
            });

            return new Promise(function (resolve, reject) {
                let settled = false;
                const finish = function (payload) {
                    if (settled) return;
                    settled = true;
                    const rows = normalizeAxListRows(payload, dataSourceName);
                    debugAPI("Axpert GetDataFromAxList returned", {
                        dataSourceName,
                        rowCount: rows.length,
                        firstRow: rows[0],
                        payloadPreview: typeof payload === "string" ? payload.slice(0, 500) : payload,
                    });
                    resolve(rows);
                };

                const fail = function (error) {
                    if (settled) return;
                    settled = true;
                    reject(error);
                };

                try {
                    const result = axListFunction.call(frameWindow, request, finish, fail);
                    if (result && typeof result.then === "function") {
                        result.then(finish).catch(fail);
                    } else if (result !== undefined) {
                        finish(result);
                    } else {
                        window.setTimeout(function () {
                            if (!settled) fail(new Error(`GetDataFromAxList did not return data for ${dataSourceName}`));
                        }, 6000);
                    }
                } catch (error) {
                    fail(error);
                }
            });
        }

        for (const frameWindow of getAxpertWindows()) {
            const sqlFunction = frameWindow.AxGetSqlData;
            if (typeof sqlFunction !== "function") continue;

            debugAPI("calling Axpert AxGetSqlData", {
                dataSourceName,
                parameters,
            });

            try {
                const result = sqlFunction.call(frameWindow, dataSourceName, parameters || {});
                return result && typeof result.then === "function" ? result : Promise.resolve(result);
            } catch (error) {
                return Promise.reject(error);
            }
        }

        for (const frameWindow of getAxpertWindows()) {
            const iViewFunction = frameWindow.GetIViewData;
            if (typeof iViewFunction !== "function") continue;

            const iViewParameters = parameters && typeof parameters === "object" ? parameters : {};
            const paramString = serializeIViewParameters(iViewParameters);

            debugAPI("calling Axpert GetIViewData", {
                dataSourceName,
                parameters: iViewParameters,
                paramString,
            });

            return new Promise(function (resolve, reject) {
                let settled = false;
                const done = function (payload) {
                    if (settled) return;
                    settled = true;
                    debugAPI("Axpert GetIViewData returned", {
                        dataSourceName,
                        payloadType: typeof payload,
                        payloadPreview: typeof payload === "string" ? payload.slice(0, 500) : payload,
                    });
                    resolve(payload);
                };

                try {
                    const result = iViewFunction.call(frameWindow, dataSourceName, paramString, 1, 500, done);
                    if (result && typeof result.then === "function") {
                        result.then(done).catch(reject);
                    } else if (result !== undefined) {
                        done(result);
                    } else {
                        window.setTimeout(function () {
                            if (!settled) reject(new Error(`GetIViewData did not return data for ${dataSourceName}`));
                        }, 6000);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }

        const functionNames = [
            "AxGetDataSourceData",
            "GetDataSourceData",
            "GetDataFromDataSource",
            "AxGetDataSource",
            "GetAxpertDataSource",
            "CallDataSource",
            "callDataSource",
        ];

        for (const frameWindow of getAxpertWindows()) {
            for (const functionName of functionNames) {
                const dataSourceFunction = frameWindow[functionName];
                if (typeof dataSourceFunction !== "function") continue;

                debugAPI("calling Axpert datasource function", {
                    functionName,
                    dataSourceName,
                    parameters,
                    serializedParameters: serializeDataSourceParameters(parameters),
                });

                return new Promise(function (resolve, reject) {
                    let settled = false;
                    const done = function (payload) {
                        if (settled) return;
                        settled = true;
                        debugAPI("Axpert datasource function returned", {
                            functionName,
                            dataSourceName,
                            payloadType: typeof payload,
                            payloadPreview: typeof payload === "string" ? payload.slice(0, 500) : payload,
                        });
                        resolve(payload);
                    };

                    try {
                        const result = dataSourceFunction.call(frameWindow, dataSourceName, serializeDataSourceParameters(parameters), done);
                        if (result && typeof result.then === "function") {
                            result.then(done).catch(reject);
                        } else if (result !== undefined) {
                            done(result);
                        } else {
                            window.setTimeout(function () {
                                if (!settled) reject(new Error(`${functionName} did not return data for ${dataSourceName}`));
                            }, 6000);
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        }

        debugAPI("no Axpert datasource function found", {
            dataSourceName,
            checkedFunctions: functionNames,
            availableWindowKeys: getAxpertWindows().map(function (frameWindow) {
                try {
                    return Object.keys(frameWindow).filter(function (key) {
                        return key.toLowerCase().includes("datasource") || key.toLowerCase().includes("data");
                    }).slice(0, 80);
                } catch (error) {
                    return ["Unable to inspect frame window keys"];
                }
            }),
        });
        return Promise.resolve([]);
    }


    function normalizeAxListRows(payload, dataSourceName) {
        let parsed = parseMaybeJson(payload);
        if (parsed && parsed.d && typeof parsed.d === "string") {
            parsed = parseMaybeJson(parsed.d);
        }

        const rows = collectAxListRows(parsed, dataSourceName, 0);
        if (rows.length) return rows;

        return normalizeDataSourceRows(parsed, dataSourceName).filter(function (row) {
            return !isAxListEnvelope(row);
        });
    }


    function collectAxListRows(value, dataSourceName, depth) {
        if (depth > 8) return [];

        const parsed = parseMaybeJson(value);
        if (!parsed) return [];

        if (parsed && parsed.d && typeof parsed.d === "string") {
            return collectAxListRows(parsed.d, dataSourceName, depth + 1);
        }

        if (Array.isArray(parsed)) {
            return parsed.reduce(function (rows, item) {
                const nestedRows = collectAxListRows(item, dataSourceName, depth + 1);
                if (nestedRows.length) return rows.concat(nestedRows);
                if (item && typeof item === "object" && !Array.isArray(item) && !isAxListEnvelope(item)) {
                    return rows.concat(item);
                }
                return rows;
            }, []);
        }

        if (typeof parsed !== "object") return [];

        const directSourceRows = collectAxListRows(getObjectValueByNormalizedKey(parsed, dataSourceName), dataSourceName, depth + 1);
        if (directSourceRows.length) return directSourceRows;

        const result = parsed.result || parsed.Result;
        if (result && typeof result === "object") {
            const resultSourceRows = collectAxListRows(getObjectValueByNormalizedKey(result, dataSourceName), dataSourceName, depth + 1);
            if (resultSourceRows.length) return resultSourceRows;

            const resultRows = collectAxListRows(result.data, dataSourceName, depth + 1);
            if (resultRows.length) return resultRows;
        }
        const nestedKeys = ["rows", "data", "records", "Table", "table", "value", "values"];
        for (const key of nestedKeys) {
            if (Object.prototype.hasOwnProperty.call(parsed, key)) {
                const nestedRows = collectAxListRows(parsed[key], dataSourceName, depth + 1);
                if (nestedRows.length) return nestedRows;
            }
        }

        return isAxListEnvelope(parsed) ? [] : [parsed];
    }

    function getObjectValueByNormalizedKey(object, fieldName) {
        if (!object || typeof object !== "object" || !fieldName) return undefined;
        const targetKey = normalizeKey(fieldName);
        const matchingKey = Object.keys(object).find(function (key) {
            return normalizeKey(key) === targetKey;
        });

        return matchingKey === undefined ? undefined : object[matchingKey];
    }

    function isAxListEnvelope(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) return false;
        return ["result", "Result", "success", "message", "partialsuccess", "error", "adsname"].some(function (key) {
            return Object.prototype.hasOwnProperty.call(value, key);
        });
    }


    async function loadRows(dataSourceName, parameters) {
        console.log("malintha dataSourceName", dataSourceName);
        console.log("malintha parameters", parameters);
        const hasParameters = parameters && Object.keys(parameters).some(function (key) {
            return parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "";
        });

        debugAPI("loadRows invoked", {
            dataSourceName,
            parameters,
            hasParameters,
            serializedParameters: serializeDataSourceParameters(parameters),
        });

        let rows = hasParameters ? [] : readInjectedDataSource(dataSourceName);



        if (!rows.length) {
            try {
                const result = await callAxpertDataSourceFunction(dataSourceName, parameters);
                console.log("malintha result", result);
                rows = normalizeDataSourceRows(result, dataSourceName);

            } catch (error) {
                console.warn(`[Parent API] Unable to call Axpert data source '${dataSourceName}'.`, error);
            }
        }

        if (!rows.length && hasParameters) {
            rows = readInjectedDataSource(dataSourceName);
        }

        debugAPI("loadRows complete", {
            dataSourceName,
            rowCount: rows.length,
            firstRow: rows[0],
        });

        console.log("malintha rows", rows)
        return rows;
    }

    function toNumber(value, fallback) {
        if (value === undefined || value === null || value === "") return fallback || 0;
        const parsed = Number(String(value).replace(/,/g, ""));
        return Number.isFinite(parsed) ? parsed : fallback || 0;
    }

    function isInactiveFlag(value) {
        return ["F", "FALSE", "N", "NO", "0", "INACTIVE", "CLOSED", "CLOSE"].includes(String(value || "").trim().toUpperCase());
    }

    function isPlacementDoneFlag(value) {
        return ["T", "TRUE", "Y", "YES", "1", "DONE", "COMPLETED", "COMPLETE"].includes(String(value || "").trim().toUpperCase());
    }

    function isDayEndFlag(value) {
        return isPlacementDoneFlag(value);
    }

    function hasPlacementDone(house) {
        return Boolean(house && house.placementDone);
    }

    function isActiveBatchRow(row) {
        const activeFlag = getRowValue(row, ["batchactive", "batch_active", "active", "status"]);
        return !isInactiveFlag(activeFlag);
    }

    function isActiveHouse(house) {
        if (!house || !house.id) return false;
        if (isInactiveFlag(house.batchActive)) return false;
        if (isInactiveFlag(house.status)) return false;
        return true;
    }

    function mapHouseRow(row, context) {
        const options = context || {};
        const unitOption = options.unitOption || {};
        const batchRow = options.batchRow;
        const sources = [batchRow, row].filter(Boolean);
        const readValue = function (fieldNames) {
            for (const source of sources) {
                const value = getRowValue(source, fieldNames);
                if (value) return value;
            }
            return "";
        };
        const readHouseValue = function (fieldNames) {
            return getRowValue(row, fieldNames) || readValue(fieldNames);
        };

        const batchId = readValue(["batchId", "batch_id", "batch", "batchNo", "batch_no", "batchcode", "batchCode"]);
        const id = readHouseValue(["id", "houseId", "house_id", "sublocationcode", "sub_location_code", "houseCode", "house_code", "code"]) || batchId;
        const code = readHouseValue(["code", "houseCode", "house_code", "sublocationcode", "sub_location_code", "sublocation", "subLocation"]) || id;
        const femaleBirds = toNumber(readValue(["femaleBirds", "female_birds", "femalebirds"]));
        const maleBirds = toNumber(readValue(["maleBirds", "male_birds", "malebirds"]));
        const birdsHoused = toNumber(readValue(["birdsHoused", "birds_housed", "birdshoused"]), femaleBirds + maleBirds);
        const totalBirdsValue = readValue(["totalBirds", "total_birds", "totalbirds"]);
        const hasTotalBirds = totalBirdsValue !== "";
        const totalBirds = toNumber(totalBirdsValue, birdsHoused);
        const batchActive = readValue(["batchactive", "batch_active", "active"]);
        const status = readValue(["status"]) || (isInactiveFlag(batchActive) ? "Inactive" : "Active");
        const flockAgeDays = readValue(["flockAgeDays", "flock_age_days", "flockagedays"]);
        const rowUnitCode = readValue(["unitcode", "unit_code", "locationcode", "locationCode"]);
        const rowUnitLabel = readValue(["unitName", "unit_name", "unitname", "locationname", "locationName", "unit"]);
        const unit = unitOption.value || rowUnitCode || readValue(["unit"]) || "";
        const unitName = unitOption.label || rowUnitLabel || unit;

        return {
            unit,
            unitName,
            id,
            code,
            name: readHouseValue(["houseName", "house_name", "housename", "name"]) || code || id,
            stage: readValue(["stage", "category", "itemtype", "itemType"]),
            status,
            batchActive,
            batchId,
            batchCode: readValue(["batchCode", "batch_code", "batchcode"]) || batchId,
            flockAge: readValue(["flockAge", "flock_age", "flockage", "age"]) || (flockAgeDays ? `${flockAgeDays} days` : "0 days"),
            birdsHoused,
            femaleBirds,
            maleBirds,
            liveHens: hasTotalBirds ? totalBirds : toNumber(readValue(["liveHens", "live_hens", "livehens"]), femaleBirds || birdsHoused),
            totalEggsProduced: toNumber(readValue(["totalEggsProduced", "total_eggs_produced", "totaleggsproduced"])),
            totalFeedGivenKg: toNumber(readValue(["totalFeedGivenKg", "total_feed_given_kg", "totalfeedgivenkg"])),
            deadBirds: toNumber(readValue(["deadBirds", "dead_birds", "deadbirds"])),
            totalBirds,
            sampledBirds: toNumber(readValue(["sampledBirds", "sampled_birds", "sampledbirds"])),
            birdsWithinTargetWeight: toNumber(readValue(["birdsWithinTargetWeight", "birds_within_target_weight", "birdswithintargetweight"])),
            mortalityToday: toNumber(readValue(["deadBirds", "dead_birds", "deadbirds", "mortalityToday", "mortality_today"])),
            trays: { standard: 0, reject: 0 },
            weightKg: toNumber(readValue(["weightKg", "weight_kg", "weightkg"])),
            feedIndent: readValue(["feedIndent", "feed_indent", "feedindent"]),
            healthTasks: toNumber(readValue(["healthTasks", "health_tasks", "healthtasks"])),
            placementDate: readValue(["placementDate", "placement_date", "placementdate", "birthdate"]),
            placementDone: isPlacementDoneFlag(readValue(["placementDone", "placement_done", "placementdone"])),
            dayEnd: isDayEndFlag(readValue(["dayEnd", "day_end", "dayend"])),
            readyToHarvest: isPlacementDoneFlag(readValue(["readytoharvest", "readyToHarvest", "harvestready"])),
            harvestDate: readValue(["harvestDate", "harvest_date", "harvestdate"]),
            houseCost: toNumber(readValue(["houseCost", "house_cost", "housecost"])),
            mortalityRate: toNumber(readValue(["mortalityRate", "mortality_rate", "mortalityrate"])),
            feedPerBird: toNumber(readValue(["feedPerBird", "feed_per_bird", "feedperbird"])),
            targetParams: readValue(TARGET_PARAM_FIELDS),
            metrics: { labels: [], birds: [], mortality: [], feedKg: [], bodyWeight: [] },
            schedules: [],
        };
    }

    function normalizeHouseLookupValue(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    function addHouseLookup(lookup, key, house) {
        const normalizedKey = normalizeHouseLookupValue(key);
        if (normalizedKey && !lookup.has(normalizedKey)) lookup.set(normalizedKey, house);
    }

    function buildHouseLookup(housesForUnit) {
        const lookup = new Map();
        housesForUnit.forEach(function (house) {
            addHouseLookup(lookup, house.id, house);
            addHouseLookup(lookup, house.code, house);
            addHouseLookup(lookup, house.name, house);
        });
        return lookup;
    }

    function findHouseForBatchRow(row, houseLookup) {
        const candidates = [
            getRowValue(row, ["id", "houseid", "house_id", "sublocationid"]),
            getRowValue(row, ["code", "slocationcode", "sublocationcode", "housecode", "house_code"]),
            getRowValue(row, ["housename", "house_name", "name", "slocationname", "sublocationname"]),
        ];

        for (const candidate of candidates) {
            const house = houseLookup.get(normalizeHouseLookupValue(candidate));
            if (house) return house;
        }

        return null;
    }

    function mapBatchRow(row, baseHouse, unitOption) {
        const house = baseHouse || {};
        const mapped = mapHouseRow(row, { unitOption, batchRow: row });
        const rowHouseId = getRowValue(row, ["id", "houseid", "house_id", "sublocationid"]);
        const rowHouseCode = getRowValue(row, ["code", "slocationcode", "sublocationcode", "housecode", "house_code"]);
        const rowHouseName = getRowValue(row, ["housename", "house_name", "name", "slocationname", "sublocationname"]);

        return {
            ...house,
            ...mapped,
            unit: mapped.unit || house.unit || "",
            unitName: mapped.unitName || house.unitName || mapped.unit || "",
            id: rowHouseId || house.id || rowHouseCode || mapped.id,
            code: rowHouseCode || house.code || rowHouseId || mapped.code,
            name: rowHouseName || house.name || rowHouseCode || rowHouseId || mapped.name,
            stage: mapped.stage || house.stage || "",
            itemType: mapped.itemType || house.itemType || "",
            groupName: mapped.groupName || house.groupName || "",
            status: mapped.status || house.status || "Active",
            batchActive: mapped.batchActive || house.batchActive || "",
            targetParams: mapped.targetParams || house.targetParams || "",
            metrics: mapped.metrics || house.metrics || { labels: [], birds: [], mortality: [], feedKg: [], bodyWeight: [] },
            schedules: mapped.schedules || house.schedules || [],
        };
    }

    async function loadRowsFromAttempts(dataSourceName, attempts, options) {
        for (const parameters of attempts) {
            const rows = await loadRows(dataSourceName, parameters, options);
            if (rows.length) return rows;
        }
        return [];
    }

    function parseChartDate(value) {
        if (!value) return null;

        const directDate = new Date(value);
        if (!Number.isNaN(directDate.getTime())) return directDate;

        const match = String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match) {
            const parsedDate = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
            if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
        }

        return null;
    }

    function chartMonthKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    function formatChartDateLabel(date, fallback) {
        if (!date) return fallback || "";
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    }

    function mapChartRows(rows) {
        const records = rows
            .map(function (row) {
                const rawDate = getRowValue(row, ["docdate", "doc_date", "date"]);
                const date = parseChartDate(rawDate);
                const label = getRowValue(row, ["periodLabel", "period_label", "label"]) || formatChartDateLabel(date, rawDate);

                return {
                    batchId: getRowValue(row, ["batchid", "batch_id", "batchId", "batch"]),
                    docdate: rawDate,
                    dateValue: date ? date.getTime() : 0,
                    month: date ? chartMonthKey(date) : "",
                    year: date ? String(date.getFullYear()) : "",
                    label,
                    birds: toNumber(getRowValue(row, ["birds"])),
                    mortality: toNumber(getRowValue(row, ["mortality"])),
                    feedKg: toNumber(getRowValue(row, ["feedkg", "feedKg", "feed_kg"])),
                    bodyWeight: toNumber(getRowValue(row, ["bodyweight", "bodyWeight", "body_weight"])),
                };
            })
            .filter(function (record) {
                return record.dateValue || record.label;
            })
            .sort(function (a, b) {
                return (a.dateValue || 0) - (b.dateValue || 0);
            });

        return {
            fromDataSource: true,
            records,
            labels: records.map((record) => record.label),
            birds: records.map((record) => record.birds),
            mortality: records.map((record) => record.mortality),
            feedKg: records.map((record) => record.feedKg),
            bodyWeight: records.map((record) => record.bodyWeight),
        };
    }

    function mapScheduleRow(row) {
        return {
            id: getRowValue(row, ["id"]) || "",
            age: getRowValue(row, ["age", "bage", "batch_age"]) || "",
            date: getRowValue(row, ["scheduledate", "scheduleDate", "schedule_date", "date", "docdate"]) || "",
            name: getRowValue(row, ["name", "bname", "schedule", "schedule_name"]) || "",
            dose: getRowValue(row, ["dose"]) || "",
            method: getRowValue(row, ["method"]) || "",
            description: getRowValue(row, ["description"]) || "",
            employeeName: getRowValue(row, ["employee_name", "employeeName", "employee"]) || "",
            batchId: getRowValue(row, ["batchid", "batch_id", "batch"]) || "",
            status: getRowValue(row, ["completed", "status", "schedule_status"]) || "Pending",
        };
    }

    function mapFarmerActivityRow(row) {
        return {
            id: getRowValue(row, ["id"]) || "",
            batchId: getRowValue(row, ["batchid", "batch_id", "batch"]) || "",
            task: getRowValue(row, ["task"]) || "",
            instructions: getRowValue(row, ["instructions", "instruction"]) || "",
            finding: getRowValue(row, ["finding", "findings"]) || "",
            status: getRowValue(row, ["status"]) || "Pending",
            priority: getRowValue(row, ["priority"]) || "",
            remark: getRowValue(row, ["remark", "remarks"]) || "",
        };
    }

    async function loadUnitOptions() {
        console.log("malintha loadUnitOptions");
        const dataSourceName = AXPERT_DATASOURCES.units.name;
        const context = await getGlobalContext();
        const parameters = {};
        if (context.branch) parameters.branch = context.branch;
        if (context.company) parameters.company = context.company;
        const rows = await loadRows(dataSourceName, parameters);
        console.log("malintha rows ", rows);


        debugAPI("unit filter load started", {
            dataSourceName,
            context,
        });
        debugAPI("unit datasource parameters prepared", {
            dataSourceName,
            context,
            parameters,
            serializedParameters: serializeDataSourceParameters(parameters),
        });

        return rows
            .map(function (row) {
                const value = getRowValue(row, [AXPERT_DATASOURCES.units.valueField, "code", "value", "id"]);
                const label = getRowValue(row, [AXPERT_DATASOURCES.units.labelField, "name", "text", "label"]);
                if (!value && !label) return null;

                return {
                    value: value || label,
                    label: label || value,
                };
            })
            .filter(Boolean);
    }



    async function getGlobalContext() {
        const hasLocalAxGetGlobalVar = typeof window.AxGetGlobalVar === "function";
        const hasParentAxGetGlobalVar = Boolean(
            window.parent &&
            window.parent !== window &&
            typeof window.parent.AxGetGlobalVar === "function",
        );

        const branch = readAxpertGlobalVar(["M_BRANCH", "M_BRANCHNAME", "branch", "branchname"]);
        const company = readAxpertGlobalVar(["M_COMPANY", "M_COMPANYNAME", "company", "companyname"]);

        debugAPI("global context resolved", {
            hasLocalAxGetGlobalVar,
            hasParentAxGetGlobalVar,
            branch,
            company,
        });

        if (!branch || !company) {
            debugAPI("global context incomplete", {
                localGlobalVarKeys: window.AxGlobalVars ? Object.keys(window.AxGlobalVars) : [],
                localaxGlobalVarKeys: window.axGlobalVars ? Object.keys(window.axGlobalVars) : [],
                localGlobalVarsKeys: window.globalVars ? Object.keys(window.globalVars) : [],
            });
        }
        console.log("malintha branch ", branch);
        console.log("malintha company ", company);

        return { branch, company };
    }
    async function loadHouses(options) {
        const selected = options && options.unit && options.unit !== "all" ? String(options.unit) : "";
        let unitOptions = options && Array.isArray(options.unitOptions) ? options.unitOptions : [];
        if (!unitOptions.length) {
            unitOptions = await loadUnitOptions();
        }
        const loadOptions = { forceReload: options && options.forceReload };
        if (selected) {
            unitOptions = unitOptions.filter(function (unitOption) {
                return String(unitOption.value || "") === selected;
            });
            if (!unitOptions.length) {
                unitOptions = [{ value: selected, label: selected, locationcode: selected }];
            }
        }
        if (!unitOptions.length) {
            const currentUnit = options && options.unit ? options.unit : "";
            if (currentUnit) {
                unitOptions = [{ value: currentUnit, label: currentUnit, locationcode: currentUnit }];
            } else {
                unitOptions = [{ value: "", label: "" }];
            }
        }
        console.log("malintha options", unitOptions);
        debugAPI("house load started", {
            houseDataSourceName: AXPERT_DATASOURCES.houses.name,
            batchDataSourceName: AXPERT_DATASOURCES.broilerBatchDetails.name,
            selectedUnit: options && options.unit ? options.unit : "",
            unitCount: unitOptions.length,
        });
        const mappedHouses = [];

        for (const unitOption of unitOptions) {
            const locationname = String(unitOption.label || unitOption.value || "").trim();
            const houseAttempts = [];
            if (locationname) houseAttempts.push({ locationname });
            if (unitOption.value) houseAttempts.push({ unit: unitOption.value });

            const houseRows = await loadRowsFromAttempts(AXPERT_DATASOURCES.houses.name, houseAttempts, loadOptions);
            const unitHouses = houseRows.map(function (row) {
                return mapHouseRow(row, { unitOption });
            }).filter(function (house) {
                return house.id;
            });
            const houseLookup = buildHouseLookup(unitHouses);

            const batchAttempts = [];
            if (unitOption.value) batchAttempts.push({ unit: unitOption.value, house: "" });
            if (unitOption.label && unitOption.label !== unitOption.value) batchAttempts.push({ unit: unitOption.label, house: "" });
            const unitBatchRows = await loadRowsFromAttempts(AXPERT_DATASOURCES.broilerBatchDetails.name, batchAttempts, loadOptions);

            if (unitBatchRows.length) {
                unitBatchRows.forEach(function (row) {
                    mappedHouses.push(mapBatchRow(row, findHouseForBatchRow(row, houseLookup), unitOption));
                });
                continue;
            }

            for (const house of unitHouses) {
                const houseValue = house.code || house.id;
                const perHouseAttempts = [];
                if (unitOption.value && houseValue) perHouseAttempts.push({ unit: unitOption.value, house: houseValue });
                if (house.unit && house.unit !== unitOption.value && houseValue) perHouseAttempts.push({ unit: house.unit, house: houseValue });
                if (unitOption.label && unitOption.label !== unitOption.value && houseValue) perHouseAttempts.push({ unit: unitOption.label, house: houseValue });
                const batchRows = await loadRowsFromAttempts(AXPERT_DATASOURCES.broilerBatchDetails.name, perHouseAttempts, loadOptions);

                if (batchRows.length) {
                    batchRows.forEach(function (row) {
                        mappedHouses.push(mapBatchRow(row, house, unitOption));
                    });
                } else {
                    mappedHouses.push(house);
                }
            }
        }

        debugAPI("house datasource mapped houses", {
            houseDataSourceName: AXPERT_DATASOURCES.houses.name,
            batchDataSourceName: AXPERT_DATASOURCES.broilerBatchDetails.name,
            houseCount: mappedHouses.length,
            firstHouse: mappedHouses[0],
        });

        debugAPI("house load complete", {
            houseDataSourceName: AXPERT_DATASOURCES.houses.name,
            batchDataSourceName: AXPERT_DATASOURCES.broilerBatchDetails.name,
            houseCount: mappedHouses.length,
        });

        const byKey = new Map();
        mappedHouses.filter(isActiveHouse).forEach(function (house) {
            const key = `${house.unit}|${house.id}|${house.batchId || house.batchCode || ""}`;
            byKey.set(key, house);
        });

        return Array.from(byKey.values()).sort(function (a, b) {
            return `${a.unitName || a.unit} ${a.name} ${a.batchId}`.localeCompare(`${b.unitName || b.unit} ${b.name} ${b.batchId}`);
        });
    }


    async function loadHouseSourceRows(unitOptions) {
        const units = unitOptions && unitOptions.length ? unitOptions : [{ value: "", label: "" }];
        console.log("malintha units", units);
        const items = [];

        for (const unitOption of units) {
            const locationname = String(unitOption && (unitOption.label || unitOption.value) || "").trim();
            if (!locationname) {
                console.warn("[Parent API] skipped poultry_house_details lookup because locationname was missing", {
                    unitOption,
                });
                continue;
            }
            const parameters = { locationname };
            debugAPI("house datasource parameters prepared", {
                dataSourceName: AXPERT_DATASOURCES.houses.name,
                unitOption,
                parameters,
                serializedParameters: serializeDataSourceParameters(parameters),
            });
            const rows = await loadRows(AXPERT_DATASOURCES.houses.name, parameters);
            rows.forEach(function (row) {
                items.push({ row, unitOption });
            });
        }

        debugAPI("house datasource mapped to source rows", {
            dataSource: AXPERT_DATASOURCES.houses.name,
            unitCount: units.length,
            rowCount: items.length,
            firstItem: items[0],
        });

        return items;

    }

    async function loadParentBatchRowsForHouse(house, houseRow, unitOption) {
        const unitCandidates = getBatchUnitCandidates(house, houseRow, unitOption);
        const houseCandidates = getBatchSubLocationCandidates(house, houseRow);
        const attempts = [];

        console.log("[Parent API][poultry_parent_batch_details] preparing house lookup", {
            house: { id: house.id, code: house.code, name: house.name },
            unitCandidates,
            houseCandidates,
        });

        unitCandidates.slice(0, 3).forEach(function (unit) {
            houseCandidates.slice(0, 3).forEach(function (houseCode) {
                attempts.push({ unit, house: houseCode });
            });
        });

        for (const parameters of attempts) {
            const rows = await loadRows(AXPERT_DATASOURCES.broilerBatchDetails.name, parameters);
            console.log("[ malintha Parent API][poultry_parent_batch_details] returned rows ", {
                parameters,
                rowCount: rows.length,
                rows,
            });
            if (rows.length) {
                const activeRows = rows.filter(isActiveBatchRow);
                debugAPI("parent batch details matched house", {
                    dataSource: AXPERT_DATASOURCES.broilerBatchDetails.name,
                    house: { id: house.id, code: house.code, name: house.name },
                    parameters,
                    rowCount: rows.length,
                    activeRowCount: activeRows.length,
                    firstRow: rows[0],
                });
                if (activeRows.length) return activeRows;
                return rows;
            }
        }

        debugAPI("parent batch details returned no rows for house", {
            dataSource: AXPERT_DATASOURCES.broilerBatchDetails.name,
            house: { id: house.id, code: house.code, name: house.name },
            attemptedParameters: attempts,
        });

        return [];
    }


    function getBatchSubLocationCandidates(house, houseRow) {
        return uniqueNonEmpty([
            house.code,
            getRowValue(houseRow, ["sublocationcode", "sub_location_code"]),
            getRowValue(houseRow, ["houseCode", "house_code", "housecode"]),
            getRowValue(houseRow, ["sublocation", "subLocation", "sublocationcode", "sub_location_code"]),
            house.id,
        ]);
    }


    function getBatchUnitCandidates(house, houseRow, unitOption) {
        return uniqueNonEmpty([
            getRowValue(houseRow, ["unit", "unitcode", "unit_code", "locationcode", "location_code"]),
            house.unit,
            unitOption && unitOption.value,
            unitOption && unitOption.label,
        ]);
    }


    function uniqueNonEmpty(values) {
        return Array.from(new Set(values.map(function (value) {
            return String(value || "").trim();
        }).filter(Boolean)));
    }

    async function loadTargetParamsForHouse(house) {
        if (!house) return "";

        const directParams = extractTargetParams(house);
        if (directParams) return directParams;

        const context = await getGlobalContext();
        const parameters = {};
        if (context.branch) parameters.branch = context.branch;
        if (house.unit) parameters.unit = house.unit;
        if (house.code || house.id) parameters.sublocation = house.code || house.id;
        if (house.name) parameters.housename = house.name;

        const rows = await loadRows(AXPERT_DATASOURCES.targetParams.name, parameters);
        return extractTargetParams(rows);
    }

    async function loadCharts(parameters) {
        return mapChartRows(await loadRows(AXPERT_DATASOURCES.charts.name, parameters));
    }

    async function loadSchedules(parameters) {
        const batchId = parameters && (parameters.batchid || parameters.batch_id || parameters.batchId || parameters.batch);
        if (!batchId) return [];
        return (await loadRows(AXPERT_DATASOURCES.schedules.name, { batchid: batchId, batch_id: batchId })).map((row, index) => {
            const schedule = mapScheduleRow(row);
            if (!schedule.id) schedule.id = index + 1;
            return schedule;
        });
    }

    async function loadFarmerActivities(parameters) {
        const batchId = parameters && (parameters.batchid || parameters.batch_id || parameters.batchId || parameters.batch);
        if (!batchId) return [];
        return (await loadRows(AXPERT_DATASOURCES.activities.name, { batchid: batchId, batch_id: batchId })).map((row, index) => {
            const activity = mapFarmerActivityRow(row);
            if (!activity.id) activity.id = index + 1;
            return activity;
        });
    }

    async function executeDayEnd(parameters) {
        const batchId = String(parameters && parameters.batchid || "").trim();
        if (!batchId) throw new Error("A batch ID is required to run Day End.");
        return callAxpertDataSourceFunction(AXPERT_DATASOURCES.dayEnd.name, { batchid: batchId });
    }

    async function executeReadyToHarvestUpdate(parameters) {
        const batchId = String(parameters && parameters.batchid || "").trim();
        if (!batchId) throw new Error("A batch ID is required to update Ready To Harvest.");
        return callAxpertDataSourceFunction(AXPERT_DATASOURCES.readyToHarvestUpdate.name, { batchid: batchId });
    }

    window.BroilerAPI = {
        loadUnitOptions: loadUnitOptions,
        loadHouses: loadHouses,
        loadTargetParamsForHouse: loadTargetParamsForHouse,
        loadCharts: loadCharts,
        loadSchedules: loadSchedules,
        loadFarmerActivities: loadFarmerActivities,
        executeDayEnd: executeDayEnd,
        executeReadyToHarvestUpdate: executeReadyToHarvestUpdate,
        dataSources: AXPERT_DATASOURCES,
        helpers: {
            getAxpertWindows,
            normalizeKey,
            parseMaybeJson,
            normalizeDataSourceRows,
            getRowValue,
            readInjectedDataSource,
            callAxpertDataSourceFunction,
            loadRows,
        },
    };

    debugAPI("initialized", AXPERT_DATASOURCES);
    window.dispatchEvent(new CustomEvent("BroilerAPIReady", { detail: window.BroilerAPI }));
})();
