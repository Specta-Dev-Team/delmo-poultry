(function () {
  const CONFIG = {
    key: "layers",
    title: "Layers Operations",
    listLabel: "Layers houses",
    emptyLabel: "No layers houses found.",
    scheduleCopy: "Medication, monitoring, and review actions attached to this layers batch.",
    exposeName: "layersOps",
    tstructOptions: {
      basePath: "../../aspx/tstruct.aspx",
      openerIV: "",
      passContextInQuery: true,
    },
    cardActions: ["placement", "batchCreation", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water"],
    categoryFilters: [
      { key: "all", label: "All" },
      { key: "grower", label: "Grower" },
      { key: "layer", label: "Layer" },
    ],
  };

  const AXPERT_TSTRUCTS = {
    placement: { title: "Placement", transid: "btplc" },
    eggCollection: { title: "Egg Collection", transid: "eggcl" },
    mortality: { title: "Mortality", transid: "morta" },
    feedMedication: { title: "Feed Consumption / Medication", transid: "fdcon" },
    bodyWeight: { title: "Body Weight Monitoring", transid: "bdwgt" },
    lighting: { title: "Lighting Management", transid: "light" },
    environment: { title: "Environment Monitoring", transid: "envnm" },
    liveBirdTransferRequest: { title: "Live Bird Transfer Request", transid: "nlbdt" },
    batchCreation: { title: "Batch Creation", transid: "batcr" },
    houseCreation: { title: "House Creation", transid: "house" },
    water: { title: "Water Consumption Monitoring", transid: "water" },
    hatcherTransfer: { title: "Grower To Layer", transid: "layer" },
    scheduleMonitoring: { title: "Schedule Monitoring", transid: "schst" },
    candleTest: { title: "Candle Test", transid: "candl" },
    chickPullOut: { title: "Chick Pull Out", transid: "pullo" },
  };

  const QUICK_ENTRY_ACTIONS = [
    { key: "placement", icon: "M8 4h8M6 8h12l-1 12H7L6 8zM9 12h6M10 16h4" },
    { key: "eggCollection", icon: "M4 9h16M5 9l2 10h10l2-10M8 6h8M9 13h.01M12 13h.01M15 13h.01" },
    { key: "mortality", icon: "M12 3 3 20h18L12 3zM12 9v5M12 17h.01" },
    { key: "feedMedication", icon: "M4 8h16M6 8l1 12h10l1-12M9 4h6M9 12h6M10 16h4" },
    { key: "bodyWeight", icon: "M7 20h10l-1-11H8L7 20zM9 9a3 3 0 0 1 6 0" },
    { key: "lighting", icon: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1.5 2 1.5 3h5c0-1 0.5-2 1.5-3a7 7 0 0 0-4-12z" },
    { key: "environment", icon: "M12 2v20M5 8a7 7 0 0 0 14 0M5 16a7 7 0 0 1 14 0" },
    { key: "water", icon: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" },
    { key: "hatcherTransfer", icon: "M5 12h14M13 6l6 6-6 6M5 5v14" },
    // { key: "candleTest", icon: "M12 3v5M8 8h8l-1 13h-6L8 8zM9 3h6" },
    // { key: "chickPullOut", icon: "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z" },
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
  let currentSearchValue = "";
  let unitOptions = [];
  let unitsLoadedFromDataSource = false;
  let selectedMonthFrom = MONTH_OPTIONS[0] ? MONTH_OPTIONS[0].key : "";
  let selectedMonthTo = MONTH_OPTIONS[MONTH_OPTIONS.length - 1] ? MONTH_OPTIONS[MONTH_OPTIONS.length - 1].key : "";
  let selectedYearFrom = YEAR_OPTIONS[0] ? YEAR_OPTIONS[0].key : "";
  let selectedYearTo = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] ? YEAR_OPTIONS[YEAR_OPTIONS.length - 1].key : "";
  let selectedActivityTab = "schedule";
  let selectedScheduleStatusFilter = "all";
  let scheduleStatusEditor = null;
  let dayEndConfirmation = null;
  let readyToTransferConfirmation = null;
  let pendingTstructContext = null;

  async function loadUnitOptionsFromDataSource() {
    try {
      if (!window.LayersAPI || typeof window.LayersAPI.loadUnitOptions !== "function") return;
      const mappedUnits = await window.LayersAPI.loadUnitOptions();
      if (!mappedUnits.length) return;

      unitOptions = mappedUnits;
      unitsLoadedFromDataSource = true;
      updateUnitFilters();
    } catch (error) {
      console.warn("[Layers Operations] Failed to load units from LayersAPI.", error);
    }
  }

  async function loadHousesFromDataSource() {
    try {
      if (!window.LayersAPI || typeof window.LayersAPI.loadHouses !== "function") return;
      const dataSourceHouses = await window.LayersAPI.loadHouses({ unit: selectedUnit, unitOptions });
      if (!dataSourceHouses.length) {
        houses.splice(0, houses.length);
        renderHouseList();
        renderHouses(currentSearchValue);
        console.warn("[Layers Operations] LayersAPI returned no datasource houses.");
        return;
      }

      dataSourceHouses.forEach(function (house) {
        house.stage = house.stage || getHouseStage(house);
      });

      houses.splice(0, houses.length, ...dataSourceHouses);

      if (selectedHouseId && !houses.some((house) => getHouseRecordId(house) === selectedHouseId)) {
        selectedHouseId = "";
      }

      if (selectedHouseId) {
        renderHouseDetail(selectedHouseId, { skipDataLoad: true });
      } else {
        renderHouseList();
        renderHouses(currentSearchValue);
      }
    } catch (error) {
      console.warn("[Layers Operations] Failed to load houses from LayersAPI.", error);
    }
  }

  function getCurrentChartParameters(house) {
    const batchId = house.batchId || house.batchCode || "";
    return {
      batchid: batchId,
      batch_id: batchId,
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
    return metrics && Array.isArray(metrics.labels) && metrics.labels.length > 0;
  }

  async function loadHouseDetailData(house) {
    if (!window.LayersAPI) return;

    let shouldRender = false;

    try {
      if (typeof window.LayersAPI.loadSchedules === "function") {
        house.schedules = await window.LayersAPI.loadSchedules(getCurrentScheduleParameters(house));
        house.schedulesLoading = false;
        shouldRender = true;
      }
    } catch (error) {
      house.schedulesLoading = false;
      shouldRender = true;
      console.warn("[Layers Operations] Failed to load schedules from LayersAPI.", error);
    }

    try {
      if (typeof window.LayersAPI.loadFarmerActivities === "function") {
        house.farmerActivities = await window.LayersAPI.loadFarmerActivities(getCurrentScheduleParameters(house));
        house.farmerActivitiesLoading = false;
        shouldRender = true;
      }
    } catch (error) {
      house.farmerActivitiesLoading = false;
      shouldRender = true;
      console.warn("[Layers Operations] Failed to load farmer activity from LayersAPI.", error);
    }

    try {
      if (typeof window.LayersAPI.loadCharts === "function") {
        const chartMetrics = await window.LayersAPI.loadCharts(getCurrentChartParameters(house));
        if (hasChartRows(chartMetrics)) {
          house.metrics = chartMetrics;
          shouldRender = true;
        }
      }
    } catch (error) {
      console.warn("[Layers Operations] Failed to load charts from LayersAPI.", error);
    }

    if (shouldRender && selectedHouseId === getHouseRecordId(house)) {
      renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
    }
  }

  async function loadScreenDataFromDataSource() {
    await loadUnitOptionsFromDataSource();
    await loadHousesFromDataSource();
    if (selectedHouseId) {
      const house = findHouseByRecordId(selectedHouseId);
      if (house) loadHouseDetailData(house);
    }
  }

  window.addEventListener("LayersAPIReady", loadScreenDataFromDataSource);

  function getActiveUnitOptions() {
    return unitOptions;
  }

  function getHouseUnitValue(house) {
    return house.unit || "";
  }

  function getHouseUnitLabel(house) {
    if (house.unitName) return house.unitName;
    const option = unitOptions.find(function (opt) {
      return opt.value === house.unit;
    });
    return option ? option.label : house.unit || "";
  }

  function getUnitLabelByValue(value) {
    if (!value || value === "all") return "";
    const option = unitOptions.find(function (opt) {
      return opt.value === value;
    });
    return option ? option.label : value;
  }

  function buildHouseRecordId(house) {
    if (!house) return "";
    const parts = [
      house.unit,
      house.id || house.code || house.name,
      house.batchId || house.batchCode,
    ].map(function (part) {
      return String(part || "").trim();
    });

    return parts.some(Boolean)
      ? parts.join("|")
      : String(house.id || house.code || house.batchId || house.batchCode || "").trim();
  }

  function getHouseRecordId(house) {
    if (!house) return "";
    if (!house.recordId) house.recordId = buildHouseRecordId(house);
    return house.recordId;
  }

  function normalizeLookupValue(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function findHouseByRecordId(recordId, batchId) {
    const target = String(recordId || "").trim();
    const targetBatch = normalizeLookupValue(batchId);
    if (!target && !targetBatch) return null;

    if (target) {
      const exactRecord = houses.find(function (house) {
        return getHouseRecordId(house) === target;
      });
      if (exactRecord && (!targetBatch || normalizeLookupValue(exactRecord.batchId || exactRecord.batchCode) === targetBatch)) return exactRecord;
    }

    let candidates = target
      ? houses.filter(function (house) {
          return [house.id, house.code, house.name].some(function (value) {
            return normalizeLookupValue(value) === normalizeLookupValue(target);
          });
        })
      : houses.slice();

    if (targetBatch) {
      candidates = candidates.filter(function (house) {
        return [house.batchId, house.batchCode].some(function (value) {
          return normalizeLookupValue(value) === targetBatch;
        });
      });
    }

    return candidates.length === 1 ? candidates[0] : null;
  }

  function findHouseByElement(element) {
    if (!element) return null;
    return findHouseByRecordId(element.dataset.houseId || "", element.dataset.batchId || "");
  }

  function houseMatchesSelectedUnit(house) {
    if (selectedUnit === "all") return true;
    return getHouseUnitValue(house) === selectedUnit;
  }

  function displayNumber(value) {
    if (value === undefined || value === null || value === "") return 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    }).format(displayNumber(value));
  }

  function actionText(actionKey) {
    return AXPERT_TSTRUCTS[actionKey] ? AXPERT_TSTRUCTS[actionKey].title : actionKey;
  }

  function svgIcon(path) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
  }

  function categoryKey(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, "-");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
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

  function formatDate(value) {
    if (!value) return "-";
    const directDate = new Date(value);
    if (!Number.isNaN(directDate.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(directDate);
    }
    return String(value);
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
    const moreActions = CONFIG.key === "parent"
      ? ["batchCreation", "hatcherTransfer"]
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
    const houseRecordId = getHouseRecordId(house);
    const batchId = house.batchId || house.batchCode || "";
    moduleCommand.innerHTML = `
      <div class="module-copy detail-copy">
        <button class="back-button" type="button" data-back-to-houses>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6" /></svg>
          ${CONFIG.title}
        </button>
        <h2>${escapeHtml(house.name || "")} <span class="house-code-pill">${escapeHtml(house.code || "")}</span></h2>
        <p>${escapeHtml(house.batchId || "-")} / ${escapeHtml(house.stage || "-")}</p>
        <!-- <p>${escapeHtml(house.batchId || "-")} / ${escapeHtml(house.stage || "-")} / Feed indent: ${escapeHtml(house.feedIndent || "-")}</p> -->
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

  function splitTstructTargetParams(paramString) {
    return cleanTargetParams(paramString)
      .split(/&(?=[A-Za-z0-9_]+=)/)
      .map(function (part) { return part.trim(); })
      .filter(Boolean);
  }

  function normalizeTstructParamKey(part) {
    const key = String(part || "").split("=")[0] || "";
    return normalizeIndexPart(key).replace(/000f1$/, "");
  }

  function mergeTstructTargetParams(baseParams, entries) {
    const contextKeys = new Set([
      "unit", "unitid", "unitname",
      "house", "houseid", "housecode", "housename",
      "batch", "batchid", "batchcode",
      "schedule", "scheduleid", "scheduledate", "scheduleage", "schedulestatus",
    ]);
    const baseParts = splitTstructTargetParams(baseParams)
      .filter(function (part) { return !contextKeys.has(normalizeTstructParamKey(part)); });
    const existingKeys = new Set(baseParts.map(normalizeTstructParamKey).filter(Boolean));
    const generatedParts = entries
      .filter(function (entry) { return entry[1] !== undefined && entry[1] !== null && entry[1] !== ""; })
      .filter(function (entry) {
        const key = normalizeTstructParamKey(entry[0]);
        return contextKeys.has(key) || !existingKeys.has(key);
      })
      .map(function (entry) { return `${entry[0]}=${String(entry[1])}`; });

    return baseParts.concat(generatedParts).join("&");
  }

  function encodeTstructTargetParams(paramString) {
    return String(paramString || "")
      .split(/&(?=[A-Za-z0-9_]+=)/)
      .map(function (part) {
        const equalsIndex = part.indexOf("=");
        return equalsIndex === -1 ? part : part.slice(0, equalsIndex + 1) + encodeURIComponent(part.slice(equalsIndex + 1));
      })
      .filter(Boolean)
      .join("&");
  }

  function buildTstructTargetParams(transid,context) {
    if (!context) return "";
    console.log("malintha context is",context.houseName);

    const unitTargetValue = context.unitName || context.unitId;
    const houseTargetValue = context.houseName || context.houseCode || context.houseId;
    const batchTargetValue = context.batchId || context.batchCode;

    if (transid === "btplc") {
      return batchTargetValue ? `batchid=${String(batchTargetValue)}` : "";
    }

    let entries=[]

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
    entries =[["itemgroup", "COM LAYER CHICKS"],]
  }
  else{
   entries = [
      ["module", context.module],
      ["unit", unitTargetValue],
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
      ["schedule", context.scheduleName],
      ["scheduleid", context.scheduleId],
      ["scheduledate", context.scheduleDate],
      ["scheduleage", context.scheduleAge],
      ["schedulestatus", context.scheduleStatus],
    ];
  }

   return entries
            .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "")
            .map((entry) => `${entry[0]}=${String(entry[1])}`)
            .join("&");
    // return mergeTstructTargetParams(context.targetParams || context.targetparams || "", entries);
  }

  function buildTstructUrl(transid, context) {
    console.log("malintha transid",transid)
    const targetParams = buildTstructTargetParams(transid,context);
    const encodedParams = encodeTstructTargetParams(targetParams);
    const transParam = `transid=${encodeURIComponent(transid)}`;
    const openerParam = CONFIG.tstructOptions.openerIV
      ? `&openerIV=${encodeURIComponent(CONFIG.tstructOptions.openerIV)}`
      : "";
    const baseParams = `${transParam}&isIV=false&isDupTab=false&dummyload=false&hdnbElapsTime=0`;

    if (CONFIG.tstructOptions.passContextInQuery && encodedParams) {
      return `${CONFIG.tstructOptions.basePath}?${baseParams}${openerParam}&${encodedParams}&act=open`;
    }

    return `${CONFIG.tstructOptions.basePath}?${baseParams}${openerParam}&act=open`;
  }

  function findPlacementOriginFields(frameDocument, labels, fieldNames) {
    if (!frameDocument) return [];

    const normalizedNames = new Set((fieldNames || []).map((name) => String(name || "").toLowerCase()));
    const fields = [];
    const seen = new Set();
    const addField = (field) => {
      if (!field) return;
      const key = field.id || field.getAttribute("name") || field.getAttribute("data-field") || field.getAttribute("data-fieldname") || "";
      if (!key || seen.has(key)) return;
      seen.add(key);
      fields.push(field);
    };

    Array.from(frameDocument.querySelectorAll("input, select, textarea")).forEach((field) => {
      const names = [
        field.id,
        field.getAttribute("name"),
        field.getAttribute("data-field"),
        field.getAttribute("data-axfield"),
        field.getAttribute("data-fieldname"),
      ].map((value) => String(value || "").toLowerCase());
      if (names.some((name) => normalizedNames.has(name) || Array.from(normalizedNames).some((candidate) => name.startsWith(candidate)))) {
        addField(field);
      }
    });

    (labels || []).forEach((labelText) => {
      const normalizedLabel = String(labelText || "").trim().toLowerCase();
      const label = Array.from(frameDocument.querySelectorAll("label, span, div, td, th"))
        .find((item) => String(item.textContent || "").trim().toLowerCase() === normalizedLabel);
      if (!label) return;

      let container = label;
      for (let depth = 0; depth < 5 && container; depth += 1) {
        addField(container.querySelector && container.querySelector("input, select, textarea"));
        container = container.parentElement;
      }
    });

    return fields;
  }

  function clearPlacementOriginFields(frameWindow, frameDocument) {
    if (!frameDocument) return false;

    const fieldGroups = [
      {
        labels: ["From Unit", "From Location"],
        fieldNames: ["fromunit", "fromunitid", "fromunitcode", "fromsubunit"],
      },
      {
        labels: ["From House", "From Sub Unit", "From Location"],
        fieldNames: [
          "fromhouse", "fromhouseid", "fromhousecode", "fromsubunit",
          "fromsublocation", "fromsublocationid", "fromsublocationcode",
        ],
      },
    ];

    let cleared = false;
    fieldGroups.forEach((group) => {
      findPlacementOriginFields(frameDocument, group.labels, group.fieldNames).forEach((field) => {
        if ((field.tagName || "").toLowerCase() === "select") field.selectedIndex = -1;
        field.value = "";
        try {
          if (frameWindow && frameWindow.jQuery) frameWindow.jQuery(field).val(null).trigger("change.select2");
        } catch (error) {
          console.warn("[Layers Operations] Placement origin clear skipped.", error);
        }
        cleared = true;
      });
    });

    return cleared;
  }

  function schedulePlacementOriginClear(context, frameWindow, frameDocument) {
    if (!context || context.transid !== "btplc") return;
    [0, 250, 700, 1400, 2200].forEach((delay) => {
      window.setTimeout(() => {
        if (pendingTstructContext === context) clearPlacementOriginFields(frameWindow, frameDocument);
      }, delay);
    });
  }

  function handleTstructLoad() {
    if (!pendingTstructContext || pendingTstructContext.transid !== "btplc") return;

    try {
      const frameWindow = tstructFrame.contentWindow;
      const frameDocument = tstructFrame.contentDocument || (frameWindow && frameWindow.document);
      schedulePlacementOriginClear(pendingTstructContext, frameWindow, frameDocument);
    } catch (error) {
      console.warn("[Layers Operations] Unable to access placement TStruct fields.", error);
    }
  }

  function openTstruct(actionKey, context) {
    if (actionKey === "placement" && context && context.placementDone) return;
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;

    pendingTstructContext = Object.assign({ module: CONFIG.key }, context || {}, { transid: action.transid });
    tstructFrame.src = buildTstructUrl(action.transid, pendingTstructContext);
    console.log("malintha url is",tstructFrame.src);
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
  }

  function closeTstructPanel() {
    tstructPanel.classList.remove("is-open");
    tstructPanel.setAttribute("aria-hidden", "true");
    tstructFrame.src = "about:blank";
    pendingTstructContext = null;
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
      houseRecordId: house ? getHouseRecordId(house) : "",
      unitId: house ? house.unit : selectedUnit === "all" ? "" : selectedUnit,
      unitName: house ? getHouseUnitLabel(house) : getUnitLabelByValue(selectedUnit),
      houseId: house ? house.id : "",
      houseCode: house ? house.code : "",
      houseName: house ? house.name : "",
      batchId: house ? house.batchId : "",
      batchCode: house ? house.batchCode || house.batchId : "",
      placementDone: house ? hasPlacementDone(house) : false,
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
    return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
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
    const directDate = new Date(placementDateStr);
    const parts = String(placementDateStr).split("/");
    const placementDate = !Number.isNaN(directDate.getTime())
      ? directDate
      : new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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
    const houseRecordId = getHouseRecordId(house);
    const batchId = house.batchId || house.batchCode || "";
    const transferStage = isReadyToHarvest(house);
    const stageClass = transferStage ? " live-transfer-card is-ready-to-transfer" : " ready-harvest-card";
    return `
      <article class="house-card${stageClass}" data-house-id="${escapeAttribute(houseRecordId)}" data-batch-id="${escapeAttribute(batchId)}" role="button" tabindex="0">
        <div class="house-card-header">
          <div class="house-card-copy">
            <h3>
              <span>${escapeHtml(house.name || "")}</span>
              <span class="house-code-pill">${escapeHtml(house.code || "")}</span>
            </h3>
            <div class="house-subline">
              <small>${escapeHtml(house.stage || "-")} house</small>
              <span class="flock-age-badge">Flock age: ${escapeHtml(house.flockAge || "-")}</span>
              ${transferStage ? '<span class="transfer-state-badge status-badge">Ready for transfer</span>' : ""}
            </div>
          </div>
          <div class="house-tools">
            <details class="card-menu">
              <summary aria-label="House actions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg></summary>
              <div class="command-popover align-right">
                ${getHouseActionKeys(CONFIG.cardActions, house).filter((action) => action !== "batchCreation").map((action) => `<button type="button" data-tstruct-action="${escapeAttribute(action)}" data-house-id="${escapeAttribute(houseRecordId)}" data-batch-id="${escapeAttribute(batchId)}">${escapeHtml(actionText(action))}</button>`).join("")}
              </div>
            </details>
          </div>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", escapeHtml(house.batchId || "-"))}
          ${metric("Bird count", birdCountLabel(house))}
          ${metric("Placement Date", escapeHtml(formatDate(getHousePlacementDate(house))))}
          ${metric("Expected Production Date", escapeHtml(formatDate(getHouseHarvestDate(house))))}
          ${metric("Feed / Bird", `${formatNumber(feedPerBird(house), 3)} kg`)}
          ${metric("Mortality Rate", percentLabel(mortalityRate(house)))}
        </div>
        ${renderTransferAction(house)}
      </article>
    `;
  }

  function renderTransferAction(house) {
    const houseRecordId = getHouseRecordId(house);
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!hasPlacementDone(house)) return "";
    if (isReadyToHarvest(house)) {
      return `
        <button class="command-button primary live-bird-transfer-button" type="button" data-tstruct-action="liveBirdTransferRequest" data-house-id="${escapeAttribute(houseRecordId)}" data-batch-id="${escapeAttribute(batchId)}" aria-label="Live Bird Transfer Request for ${escapeAttribute(batchId || house.name)}">
          ${svgIcon("M5 12h14M13 6l6 6-6 6M5 6v12")}
          <span>Live Bird Transfer Request</span>
        </button>
      `;
    }

    return `
      <button class="command-button primary ready-to-transfer-button" type="button" data-ready-to-transfer data-house-id="${escapeAttribute(houseRecordId)}" data-batch-id="${escapeAttribute(batchId)}" ${batchId ? "" : "disabled"} aria-label="Ready To Transfer Update for ${escapeAttribute(batchId || house.name)}">
        ${svgIcon("M12 5v14M5 12h14")}
        <span>Ready To Transfer Update</span>
      </button>
    `;
  }

  function renderDayEndButton(house) {
    const houseRecordId = escapeAttribute(getHouseRecordId(house));
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    const completed = isDayEnded(house);
    const label = completed ? "Day End Completed" : "Day End";
    const icon = completed
      ? "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5V10zm7 4v2"
      : "M12 3v9M8 8l4 4 4-4M5 16v4h14v-4";
    return `
      <button class="command-button primary day-end-button ${completed ? "is-completed" : ""}" type="button" data-day-end data-house-id="${houseRecordId}" ${batchId && !completed ? "" : "disabled"} aria-label="${label}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icon}" /></svg>
        <span>${label}</span>
      </button>
    `;
  }

  function renderDayEndConfirmation(house) {
    if (!dayEndConfirmation || dayEndConfirmation.houseId !== getHouseRecordId(house)) return "";

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

  function renderReadyToTransferConfirmation(house) {
    if (!readyToTransferConfirmation || !house || readyToTransferConfirmation.houseId !== getHouseRecordId(house)) return "";

    const processing = Boolean(readyToTransferConfirmation.processing);
    const disabled = processing ? "disabled" : "";
    const error = readyToTransferConfirmation.error
      ? `<p class="ready-to-transfer-confirmation-error" role="alert">${escapeHtml(readyToTransferConfirmation.error)}</p>`
      : "";

    return `
      <div class="activity-modal-backdrop" role="presentation">
        <section class="activity-modal ready-to-transfer-confirmation" role="dialog" aria-modal="true" aria-labelledby="readyToTransferConfirmationTitle">
          <div class="activity-modal-header">
            <div>
              <h3 id="readyToTransferConfirmationTitle">Confirm Ready To Transfer</h3>
              <p>Mark batch ${escapeHtml(house.batchId || house.batchCode || "")} as ready to transfer?</p>
            </div>
          </div>
          ${error}
          <div class="activity-modal-footer">
            <button class="activity-modal-cancel-button" type="button" data-ready-to-transfer-cancel ${disabled}>No</button>
            <button class="activity-modal-save-button" type="button" data-ready-to-transfer-confirm ${disabled}>${processing ? "Processing..." : "Yes"}</button>
          </div>
        </section>
      </div>
    `;
  }

  function getReadyToTransferConfirmationHouse() {
    return readyToTransferConfirmation
      ? findHouseByRecordId(readyToTransferConfirmation.houseId, readyToTransferConfirmation.batchId)
      : null;
  }

  function openReadyToTransferConfirmation(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!house || !batchId || isReadyToHarvest(house)) return;
    readyToTransferConfirmation = { houseId: getHouseRecordId(house), batchId, processing: false, error: "" };
    if (selectedHouseId === getHouseRecordId(house)) renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
    else renderHouses(currentSearchValue);
  }

  function closeReadyToTransferConfirmation(house) {
    readyToTransferConfirmation = null;
    if (house && selectedHouseId === getHouseRecordId(house)) renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
    else renderHouses(currentSearchValue);
  }

  async function completeReadyToTransfer(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    const houseRecordId = getHouseRecordId(house);
    if (!house || !batchId || isReadyToHarvest(house) || !readyToTransferConfirmation || readyToTransferConfirmation.houseId !== houseRecordId || readyToTransferConfirmation.processing) return;

    readyToTransferConfirmation = Object.assign({}, readyToTransferConfirmation, { processing: true, error: "" });
    if (selectedHouseId === houseRecordId) renderHouseDetail(houseRecordId, { skipDataLoad: true });
    else renderHouses(currentSearchValue);

    try {
      if (!window.LayersAPI || typeof window.LayersAPI.executeReadyToTransferUpdate !== "function") {
        throw new Error("Layers Ready To Transfer datasource is unavailable.");
      }
      await window.LayersAPI.executeReadyToTransferUpdate({ batchid: batchId });
      house.readyToHarvest = true;
      readyToTransferConfirmation = null;
      if (selectedHouseId === houseRecordId) renderHouseDetail(houseRecordId, { skipDataLoad: true });
      else renderHouses(currentSearchValue);
    } catch (error) {
      readyToTransferConfirmation = Object.assign({}, readyToTransferConfirmation, {
        processing: false,
        error: error && error.message ? error.message : "Ready To Transfer Update could not be completed.",
      });
      if (selectedHouseId === houseRecordId) renderHouseDetail(houseRecordId, { skipDataLoad: true });
      else renderHouses(currentSearchValue);
      console.warn("[Layers Operations] Ready To Transfer Update failed.", error);
    }
  }

  function openDayEndConfirmation(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!house || !batchId || isDayEnded(house)) return;
    dayEndConfirmation = { houseId: getHouseRecordId(house), batchId, processing: false, error: "" };
    renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
  }

  function closeDayEndConfirmation(house) {
    dayEndConfirmation = null;
    if (house) renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
  }

  function renderQuickEntryMenu(house) {
    const houseRecordId = getHouseRecordId(house);
    const batchId = house.batchId || house.batchCode || "";
    return `
      <details class="command-menu entry-menu">
        <summary class="command-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8l1 3H7l1-3zM6 7h12v13H6z" /></svg>
          <span>Entry</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div class="entry-grid-popover align-right">
          ${getQuickEntryActions(house).map((action) => `
            <button class="entry-grid-option" type="button" data-tstruct-action="${escapeAttribute(action.key)}" data-house-id="${escapeAttribute(houseRecordId)}" data-batch-id="${escapeAttribute(batchId)}">
              <span class="entry-grid-icon">${svgIcon(action.icon)}</span>
              <span>${escapeHtml(actionText(action.key))}</span>
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
      return '<input type="month" data-chart-period="' + escapeAttribute(periodKey) + '" value="' + escapeAttribute(value) + '" min="' + escapeAttribute(minValue) + '" max="' + escapeAttribute(maxValue) + '">';
    }

    return '<input type="number" data-chart-period="' + escapeAttribute(periodKey) + '" value="' + escapeAttribute(value) + '" min="' + escapeAttribute(minValue) + '" max="' + escapeAttribute(maxValue) + '" step="1" inputmode="numeric" pattern="[0-9]*">';
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

  function renderScheduleTable(house) {
    const schedules = Array.isArray(house.schedules) ? house.schedules : [];
    if (!schedules.length) return `<div class="empty-state">No schedules assigned to this batch.</div>`;

    return `
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Age</th><th>Sch. Date</th><th>Name</th><th>Dose</th><th>Method</th><th>Description</th><th>Status</th><th>Edit</th></tr></thead>
          <tbody>
            ${schedules.map((item, index) => `
              <tr>
                <td>${escapeHtml(item.id || index + 1)}</td><td>${escapeHtml(item.age || "-")}</td><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(item.name || "-")}</td>
                <td>${escapeHtml(item.dose || "-")}</td><td>${escapeHtml(item.method || "-")}</td><td>${escapeHtml(item.description || "-")}</td>
                <td>${renderActivityStatusPill(item.status)}</td>
                <td>${renderScheduleStatusEditButton(index, item.id || index + 1)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      ${renderScheduleStatusEditor(house)}
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
    if (!house || !scheduleStatusEditor || scheduleStatusEditor.houseId !== getHouseRecordId(house)) return null;
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
    if (!house || selectedActivityTab !== "schedule" || selectedHouseId !== getHouseRecordId(house)) return;
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
    const houseRecordId = getHouseRecordId(house);
    const batchId = house.batchId || house.batchCode || "";
    return `
      <div class="activity-panel-body" role="tabpanel" aria-label="Schedule">
        <div class="table-panel-header activity-table-header">
          <div>
            <h3>Schedules</h3>
            <p>${escapeHtml(CONFIG.scheduleCopy)}</p>
          </div>
          <div class="activity-header-actions">
            ${renderScheduleStatusFilter()}
            <button class="command-button" type="button" data-tstruct-action="feedMedication" data-house-id="${escapeAttribute(houseRecordId)}" data-batch-id="${escapeAttribute(batchId)}">Add Schedule</button>
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
            <p>Tasks, findings, and remarks attached to this layer batch.</p>
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
            <p>Track schedules and farmer activity for this layer batch.</p>
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
    const house = findHouseByRecordId(houseId);
    if (!house) return;

    const previousHouseId = selectedHouseId;
    selectedHouseId = getHouseRecordId(house);
    if (previousHouseId && previousHouseId !== selectedHouseId) {
      selectedActivityTab = "schedule";
      selectedScheduleStatusFilter = "all";
      closeScheduleStatusEditor();
      dayEndConfirmation = null;
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
      ${renderReadyToTransferConfirmation(house)}
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
    const visibleHouses = houses.filter(function (house) {
      var matchesUnit = houseMatchesSelectedUnit(house);
      var matchesSearch = !search || [house.name, house.code, house.stage, house.batchId, house.status, getHouseUnitLabel(house)]
        .join(" ")
        .toLowerCase()
        .includes(search);
      return matchesUnit && matchesSearch;
    });

    document.getElementById("activeHouseCount").textContent = formatNumber(houses.filter(function (h) { return h.status === "Active"; }).length);
    document.getElementById("birdTotal").textContent = formatNumber(houses.reduce(function (sum, h) { return sum + h.birdsHoused; }, 0));
    updateUnitFilters();

    if (!visibleHouses.length) {
      houseGrid.innerHTML = '<div class="empty-state">' + escapeHtml(CONFIG.emptyLabel) + '</div>';
      return;
    }

    if (selectedUnit === "all") {
      var grouped = {};
      visibleHouses.forEach(function (house) {
        var label = getHouseUnitLabel(house);
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(house);
      });

      var unitKeys = Object.keys(grouped).sort();
      var html = "";
      unitKeys.forEach(function (unitLabel) {
        html += '<div class="unit-separator"><h3>' + escapeHtml(unitLabel) + '</h3><hr/></div>';
        html += grouped[unitLabel].map(renderHouseCard).join("");
      });
      houseGrid.innerHTML = html + renderReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
    } else {
      houseGrid.innerHTML = visibleHouses.map(renderHouseCard).join("") + renderReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
    }
  }

  async function completeDayEnd(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!batchId || !dayEndConfirmation || dayEndConfirmation.houseId !== getHouseRecordId(house) || dayEndConfirmation.processing) return;

    dayEndConfirmation = { houseId: getHouseRecordId(house), batchId, processing: true, error: "" };
    renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });

    try {
      if (!window.LayersAPI || typeof window.LayersAPI.executeDayEnd !== "function") {
        throw new Error("Layers Day End datasource is unavailable.");
      }
      await window.LayersAPI.executeDayEnd({ batchid: batchId });
      house.dayEnd = true;
      dayEndConfirmation = null;
      renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
    } catch (error) {
      console.error("[Layers Operations] Day End failed.", error);
      dayEndConfirmation = { houseId: getHouseRecordId(house), batchId, processing: false, error: "Unable to complete Day End. Please try again." };
      renderHouseDetail(getHouseRecordId(house), { skipDataLoad: true });
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

    const readyToTransferButton = event.target.closest("[data-ready-to-transfer]");
    if (readyToTransferButton) {
      event.preventDefault();
      event.stopPropagation();
      openReadyToTransferConfirmation(findHouseByRecordId(readyToTransferButton.dataset.houseId || "", readyToTransferButton.dataset.batchId || ""));
      closeOpenMenus();
      return;
    }

    const readyToTransferCancelButton = event.target.closest("[data-ready-to-transfer-cancel]");
    if (readyToTransferCancelButton) {
      event.preventDefault();
      event.stopPropagation();
      closeReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
      return;
    }

    const readyToTransferConfirmButton = event.target.closest("[data-ready-to-transfer-confirm]");
    if (readyToTransferConfirmButton) {
      event.preventDefault();
      event.stopPropagation();
      completeReadyToTransfer(getReadyToTransferConfirmationHouse());
      return;
    }

    const dayEndCancelButton = event.target.closest("[data-day-end-cancel]");
    if (dayEndCancelButton) {
      event.preventDefault();
      event.stopPropagation();
      const house = dayEndConfirmation && findHouseByRecordId(dayEndConfirmation.houseId, dayEndConfirmation.batchId);
      closeDayEndConfirmation(house);
      return;
    }

    const dayEndConfirmButton = event.target.closest("[data-day-end-confirm]");
    if (dayEndConfirmButton) {
      event.preventDefault();
      event.stopPropagation();
      const house = dayEndConfirmation && findHouseByRecordId(dayEndConfirmation.houseId, dayEndConfirmation.batchId);
      completeDayEnd(house);
      return;
    }

    const dayEndButton = event.target.closest("[data-day-end]");
    if (dayEndButton) {
      event.preventDefault();
      event.stopPropagation();
      openDayEndConfirmation(findHouseByElement(dayEndButton));
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
      const house = findHouseByRecordId(selectedHouseId);
      selectedScheduleStatusFilter = normalizeScheduleStatusFilter(scheduleStatusFilterButton.dataset.scheduleStatusFilter);
      closeScheduleStatusEditor();
      if (house) refreshScheduleActivityPanel(house);
      return;
    }

    const scheduleEditButton = event.target.closest("[data-schedule-status-edit]");
    if (scheduleEditButton) {
      event.preventDefault();
      event.stopPropagation();
      const house = findHouseByRecordId(selectedHouseId);
      closeScheduleStatusEditor();
      openTstruct("scheduleMonitoring", scheduleActionContext(house, scheduleEditButton));
      closeOpenMenus();
      return;
    }

    const scheduleCancelButton = event.target.closest("[data-schedule-status-cancel]");
    if (scheduleCancelButton) {
      const house = findHouseByRecordId(selectedHouseId);
      closeScheduleStatusEditor();
      if (house) refreshScheduleActivityPanel(house);
      return;
    }

    const scheduleSaveButton = event.target.closest("[data-schedule-status-save]");
    if (scheduleSaveButton) {
      const house = findHouseByRecordId(selectedHouseId);
      const editor = getScheduleStatusEditorItem(house);
      const statusSelect = houseDetail.querySelector("[data-schedule-status-editor-select]");
      if (editor && statusSelect) editor.item.status = normalizeActivityStatus(statusSelect.value);
      closeScheduleStatusEditor();
      if (house) refreshScheduleActivityPanel(house);
      return;
    }

    const actionButton = event.target.closest("[data-tstruct-action]");
    if (actionButton) {
      event.preventDefault();
      event.stopPropagation();
      const house = findHouseByElement(actionButton);
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
      const house = findHouseByElement(houseCard);
      if (house) renderHouseDetail(getHouseRecordId(house));
      return;
    }

    if (event.target === tstructPanel) closeTstructPanel();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && readyToTransferConfirmation) {
      closeReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
      return;
    }

    if (event.key === "Escape" && dayEndConfirmation) {
      const house = findHouseByRecordId(dayEndConfirmation.houseId, dayEndConfirmation.batchId);
      closeDayEndConfirmation(house);
      return;
    }

    if (event.key === "Escape" && scheduleStatusEditor) {
      const house = findHouseByRecordId(selectedHouseId);
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
      const house = findHouseByElement(event.target.closest(".house-card"));
      if (house) renderHouseDetail(getHouseRecordId(house));
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
    tstructFrame.addEventListener("load", handleTstructLoad);

  window[CONFIG.exposeName] = {
    openTstruct,
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

  renderHouseList();
  renderHouses(currentSearchValue);
  loadScreenDataFromDataSource();

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

  function getChartSeries(house, key, range) {
    const metrics = house.metrics || {};
    const baseValues = metrics[key] || [];

    if (range === "month") {
      const months = getSelectedPeriodItems(MONTH_OPTIONS, selectedMonthFrom, selectedMonthTo);
      if (metrics.fromDataSource && Array.isArray(metrics.records) && metrics.records.length) {
        return aggregateChartRecords(metrics.records, key, range, months);
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
        return aggregateChartRecords(metrics.records, key, range, years);
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

  function getSelectedPeriodItems(options, fromValue, toValue) {
    const fromIndex = Math.max(0, options.findIndex((item) => item.key === fromValue));
    const toIndex = Math.max(0, options.findIndex((item) => item.key === toValue));
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    return options.slice(start, end + 1);
  }

  function makeRangeValues(seedValues, key, range, pointCount) {
    seedValues = Array.isArray(seedValues) ? seedValues : [];
    const last = seedValues[seedValues.length - 1] || 0;
    const count = Math.max(pointCount || 1, 1);
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

// ---- Merged Axpert datasource API from layersapi.js ----
(function () {
  const AXPERT_DATASOURCES = {
    units: {
      name: "poultry_layer_unit",
      valueField: "locationcode",
      labelField: "locationname",
    },
    houses: { name: "poultry_layer_house" },
    layerBatchDetails: { name: "poultry_layer_batch_details" },
    dayEnd: { name: "poultry_dayend_update" },
    readyToHarvestUpdate: { name: "poultry_cull_harvest_update" },
    charts: { name: "poultry_card_chart_details" },
    schedules: { name: "poultry_schedule_details" },
    activities: { name: "poultry_activities_details" },
  };

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

  function normalizeKey(value) {
    return String(value || "").replace(/[\s_]/g, "").toLowerCase();
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
    const isEnvelope = function (object) {
      return object && typeof object === "object" && !Array.isArray(object) &&
        ["result", "Result", "success", "message", "partialsuccess", "error", "adsname"].some(function (key) {
          return Object.prototype.hasOwnProperty.call(object, key);
        });
    };

    if (!parsed) return [];

    if (parsed && typeof parsed === "object" && typeof parsed.d === "string") {
      return normalizeDataSourceRows(parsed.d, dataSourceName);
    }

    if (Array.isArray(parsed)) {
      return parsed.reduce(function (rows, item) {
        const nestedRows = normalizeDataSourceRows(item, dataSourceName);
        if (nestedRows.length) return rows.concat(nestedRows);
        if (item && typeof item === "object" && !Array.isArray(item) && !isEnvelope(item)) return rows.concat(item);
        return rows;
      }, []);
    }

    if (parsed && typeof parsed === "object") {
      if (dataSourceName) {
        const namedKey = Object.keys(parsed).find(function (key) {
          return normalizeKey(key) === normalizeKey(dataSourceName);
        });
        if (namedKey && parsed[namedKey] !== parsed) {
          const namedRows = normalizeDataSourceRows(parsed[namedKey], dataSourceName);
          if (namedRows.length) return namedRows;
        }

        if (normalizeKey(parsed.adsname) === normalizeKey(dataSourceName) && parsed.data !== undefined) {
          const adsRows = normalizeDataSourceRows(parsed.data, dataSourceName);
          if (adsRows.length) return adsRows;
        }
      }

      const nestedKeys = ["row", "rows", "data", "result", "Result", "records", "Table", "table", "value", "values", "d"];
      for (const key of nestedKeys) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          const nestedRows = normalizeDataSourceRows(parsed[key], dataSourceName);
          if (nestedRows.length) return nestedRows;
        }
      }
    }

    return isEnvelope(parsed) ? [] : [parsed];
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
      const readNamedStore = function (store) {
        if (!store || typeof store !== "object") return [];
        const directRows = normalizeDataSourceRows(store[dataSourceName], dataSourceName);
        if (directRows.length) return directRows;
        const matchingKey = Object.keys(store).find(function (key) {
          return normalizeKey(key) === normalizeKey(dataSourceName);
        });
        return matchingKey ? normalizeDataSourceRows(store[matchingKey], dataSourceName) : [];
      };

      const namedStores = [
        frameWindow.AxDataSources,
        frameWindow.axDataSources,
        frameWindow.dataSources,
      ];

      for (const store of namedStores) {
        const rows = readNamedStore(store);
        if (rows.length) return rows;
      }

      const stores = [
        frameWindow[dataSourceName],
      ];

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
      .filter((key) => parameters[key] !== undefined && parameters[key] !== null)
      .map((key) => `${key}~${String(parameters[key])}`)
      .join(",");
  }

  function callAxpertDataSourceFunction(dataSourceName, parameters) {
    for (const frameWindow of getAxpertWindows()) {
      if (typeof frameWindow.GetDataFromAxList !== "function") continue;

      const request = {
        adsNames: [dataSourceName],
        refreshCache: true,
        sqlParams: parameters || {},
        props: { ADS: true, pageno: 1, pagesize: 0 },
      };

      return new Promise(function (resolve, reject) {
        let settled = false;
        const done = function (payload) {
          if (settled) return;
          settled = true;
          resolve(payload);
        };
        const fail = function (error) {
          if (settled) return;
          settled = true;
          reject(error);
        };

        try {
          const result = frameWindow.GetDataFromAxList(request, done, fail);
          if (result && typeof result.then === "function") {
            result.then(done).catch(fail);
          } else if (result !== undefined) {
            done(result);
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
      if (typeof frameWindow.AxGetSqlData !== "function") continue;

      try {
        const result = frameWindow.AxGetSqlData(dataSourceName, parameters || {});
        return result && typeof result.then === "function" ? result : Promise.resolve(result);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    for (const frameWindow of getAxpertWindows()) {
      if (typeof frameWindow.GetIViewData !== "function") continue;
      const paramString = serializeIViewParameters(parameters);

      return new Promise(function (resolve, reject) {
        let settled = false;
        const done = function (payload) {
          if (settled) return;
          settled = true;
          resolve(payload);
        };
        const fail = function (error) {
          if (settled) return;
          settled = true;
          reject(error);
        };

        try {
          const result = frameWindow.GetIViewData(dataSourceName, paramString, 1, 500, done);
          if (result && typeof result.then === "function") {
            result.then(done).catch(fail);
          } else if (result !== undefined) {
            done(result);
          } else {
            window.setTimeout(function () {
              if (!settled) fail(new Error(`GetIViewData did not return data for ${dataSourceName}`));
            }, 6000);
          }
        } catch (error) {
          fail(error);
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

        return new Promise(function (resolve, reject) {
          let settled = false;
          const done = function (payload) {
            if (settled) return;
            settled = true;
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

    return Promise.resolve([]);
  }

  async function loadRows(dataSourceName, parameters) {
    let rows = readInjectedDataSource(dataSourceName);

    if (!rows.length) {
      try {
        rows = normalizeDataSourceRows(await callAxpertDataSourceFunction(dataSourceName, parameters), dataSourceName);
      } catch (error) {
        console.warn(`[Layers API] Unable to call Axpert data source '${dataSourceName}'.`, error);
      }
    }

    return rows;
  }

  function toNumber(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function isCompletedFlag(value) {
    return ["T", "TRUE", "Y", "YES", "1", "DONE", "COMPLETED", "COMPLETE"].includes(String(value || "").trim().toUpperCase());
  }

  function mapHouseRow(row, context) {
    const sourceRow = row || {};
    const batchRow = context && context.batchRow || {};
    const unitOption = context && context.unitOption || {};
    const readValue = function (fieldNames) {
      return getRowValue(batchRow, fieldNames) || getRowValue(sourceRow, fieldNames);
    };

    const id = readValue(["id", "houseId", "house_id", "sublocationcode", "sub_location_code"]);
    const code = readValue(["code", "houseCode", "house_code", "housecode", "sublocation", "sublocationcode", "sub_location_code"]);
    const femaleBirds = toNumber(readValue(["femaleBirds", "female_birds", "femalebirds"]));
    const maleBirds = toNumber(readValue(["maleBirds", "male_birds", "malebirds"]));
    const birdsHoused = toNumber(readValue(["birdsHoused", "birds_housed", "birdshoused"]), femaleBirds + maleBirds);
    const totalBirdsValue = readValue(["totalBirds", "total_birds", "totalbirds"]);
    const hasTotalBirds = totalBirdsValue !== "";
    const totalBirds = toNumber(totalBirdsValue, birdsHoused);
    const batchId = readValue(["batchId", "batch_id", "batchid", "batch"]);
    const unit = readValue(["unit", "unitcode", "unit_code", "locationcode", "locationCode"]) || unitOption.value || "";
    const unitName = readValue(["unitname", "unit_name", "locationname", "locationName"]) || unitOption.label || unit;
    const batchActive = readValue(["batchactive", "batch_active"]);
    const status = readValue(["status"]) || (String(batchActive || "").toUpperCase() === "F" ? "Inactive" : "Active");

    return {
      unit,
      unitName,
      id: id || code,
      code: code || id,
      name: readValue(["name", "houseName", "house_name", "housename", "sublocationname", "sub_location_name"]) || code || id,
      stage: readValue(["stage", "category"]),
      status,
      batchActive,
      batchId,
      batchCode: readValue(["batchCode", "batch_code", "batchcode"]) || batchId,
      flockAge: readValue(["flockAge", "flock_age", "flockage", "age"]) || (readValue(["flockagedays", "flock_age_days"]) ? `${readValue(["flockagedays", "flock_age_days"])} days` : "0 days"),
      birdsHoused,
      femaleBirds,
      maleBirds,
      liveHens: hasTotalBirds ? totalBirds : toNumber(readValue(["liveHens", "live_hens", "livehens"]), femaleBirds),
      totalEggsProduced: toNumber(readValue(["totalEggsProduced", "total_eggs_produced", "totaleggsproduced"])),
      totalFeedGivenKg: toNumber(readValue(["totalFeedGivenKg", "total_feed_given_kg", "totalfeedgivenkg"])),
      deadBirds: toNumber(readValue(["deadBirds", "dead_birds", "deadbirds", "deadb"])),
      totalBirds,
      sampledBirds: toNumber(readValue(["sampledBirds", "sampled_birds", "sampledbirds"])),
      birdsWithinTargetWeight: toNumber(readValue(["birdsWithinTargetWeight", "birds_within_target_weight", "birdswithintargetweight"])),
      mortalityToday: toNumber(readValue(["deadBirds", "dead_birds", "deadbirds", "mortalityToday", "mortality_today"])),
      trays: { standard: 0, reject: 0 },
      weightKg: toNumber(readValue(["weightKg", "weight_kg", "weightkg"])),
      feedIndent: readValue(["feedIndent", "feed_indent", "feedindent"]),
      healthTasks: toNumber(readValue(["healthTasks", "health_tasks", "healthtasks"])),
      placementDate: readValue(["placementDate", "placement_date", "placementdate", "birthdate"]),
      readyToHarvest: isCompletedFlag(readValue(["readytoharvest", "readyToHarvest", "harvestready"])),
      placementDone: isCompletedFlag(readValue(["placementDone", "placement_done", "placementdone"])),
      dayEnd: isCompletedFlag(readValue(["dayEnd", "day_end", "dayend"])),
      harvestDate: readValue(["harvestDate", "harvest_date", "harvestdate"]),
      houseCost: toNumber(readValue(["houseCost", "house_cost", "housecost"])),
      mortalityRate: toNumber(readValue(["mortalityRate", "mortality_rate", "mortalityrate"])),
      feedPerBird: toNumber(readValue(["feedPerBird", "feed_per_bird", "feedperbird"])),
      metrics: { labels: [], birds: [], mortality: [], feedKg: [], bodyWeight: [] },
      schedules: [],
    };
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

  function readAxpertGlobalVar(possibleKeys) {
    const keys = Array.isArray(possibleKeys) ? possibleKeys : [possibleKeys];

    for (const frameWindow of getAxpertWindows()) {
      try {
        const stores = [frameWindow.AxGlobalVars, frameWindow.axGlobalVars, frameWindow.globalVars];

        for (const store of stores) {
          const storeValue = extractAxpertGlobalVarValue(store, keys);
          if (storeValue) return storeValue;
        }

        if (typeof frameWindow.AxGetGlobalVar === "function") {
          for (const key of keys) {
            const directValue = frameWindow.AxGetGlobalVar(key);
            const matchedValue = extractAxpertGlobalVarValue(directValue, [key]);
            if (matchedValue) return matchedValue;
          }

          const dumpValue = frameWindow.AxGetGlobalVar("");
          const dumpMatch = extractAxpertGlobalVarValue(dumpValue, keys);
          if (dumpMatch) return dumpMatch;
        }
      } catch (error) {
        // Cross-frame access can be blocked outside Axpert preview.
      }
    }

    return "";
  }

  function getGlobalContext() {
    return {
      branch: readAxpertGlobalVar(["M_BRANCH", "M_BRANCHNAME", "branch", "branchname"]),
      company: readAxpertGlobalVar(["M_COMPANY", "M_COMPANYNAME", "company", "companyname"]),
    };
  }

  function addGlobalContextParams(parameters) {
    const context = getGlobalContext();
    const merged = Object.assign({}, parameters || {});
    if (context.company && !merged.company) merged.company = context.company;
    if (context.branch && !merged.branch) merged.branch = context.branch;
    return merged;
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
          month: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "",
          year: date ? String(date.getFullYear()) : "",
          label,
          birds: toNumber(getRowValue(row, ["birds", "livebirds", "live_birds"])),
          mortality: toNumber(getRowValue(row, ["mortality", "deadbirds", "dead_birds"])),
          feedKg: toNumber(getRowValue(row, ["feedkg", "feedKg", "feed_kg", "feedperbird", "feed_per_bird"])),
          bodyWeight: toNumber(getRowValue(row, ["bodyweight", "bodyWeight", "body_weight", "totalweight", "total_weight"])),
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
    const dataSourceName = AXPERT_DATASOURCES.units.name;
    const context = getGlobalContext();
    const parameters = {};
    if (context.company) parameters.company = context.company;
    if (context.branch) parameters.branch = context.branch;

    const rows = await loadRows(dataSourceName, parameters);

    const units = rows
      .map(function (row) {
        const value = getRowValue(row, [
          AXPERT_DATASOURCES.units.valueField,
          "unit",
          "unitcode",
          "unit_code",
          "locationcode",
          "location_code",
          "code",
          "value",
          "id",
        ]);
        const label = getRowValue(row, [
          AXPERT_DATASOURCES.units.labelField,
          "unitname",
          "unit_name",
          "locationname",
          "location_name",
          "name",
          "text",
          "label",
        ]);
        if (!value && !label) return null;

        return {
          value: value || label,
          label: label || value,
        };
      })
      .filter(Boolean);

    const byValue = new Map();
    units.forEach(function (unit) {
      byValue.set(String(unit.value || unit.label), unit);
    });

    return Array.from(byValue.values());
  }

  function isActiveBatchRow(row) {
    const status = String(getRowValue(row, ["status"]) || "").trim().toLowerCase();
    const batchActive = String(getRowValue(row, ["batchactive", "batch_active"]) || "").trim().toUpperCase();
    if (batchActive === "F") return false;
    return !status || status === "active";
  }

  function isActiveHouse(house) {
    if (!house || !house.id) return false;
    if (String(house.batchActive || "").toUpperCase() === "F") return false;
    return String(house.status || "Active").toLowerCase() === "active";
  }

  function uniqueNonEmpty(values) {
    return Array.from(new Set(values.map(function (value) {
      return String(value || "").trim();
    }).filter(Boolean)));
  }

  function getBatchUnitCandidates(house, houseRow, unitOption) {
    return uniqueNonEmpty([
      getRowValue(houseRow, ["unit", "unitcode", "unit_code", "locationcode", "location_code"]),
      house && house.unit,
      unitOption && unitOption.value,
      unitOption && unitOption.label,
    ]);
  }

  function getBatchHouseCandidates(house, houseRow) {
    return uniqueNonEmpty([
      house && house.code,
      getRowValue(houseRow, ["sublocationcode", "sub_location_code"]),
      getRowValue(houseRow, ["houseCode", "house_code", "housecode"]),
      getRowValue(houseRow, ["sublocation", "subLocation", "sublocationcode", "sub_location_code"]),
      house && house.id,
    ]);
  }

  async function loadHouseRowsForUnit(unitOption) {
    const attempts = [];
    uniqueNonEmpty([unitOption && unitOption.label, unitOption && unitOption.value]).forEach(function (value) {
      attempts.push({ locationname: value });
      attempts.push({ unit: value });
      attempts.push({ locationcode: value });
    });

    if (!attempts.length) attempts.push({});

    for (const parameters of attempts) {
      const rows = await loadRows(AXPERT_DATASOURCES.houses.name, addGlobalContextParams(parameters));
      if (rows.length) return rows;
    }

    return [];
  }

  async function loadBatchRowsForUnit(unitOption) {
    const attempts = [];
    uniqueNonEmpty([unitOption && unitOption.value, unitOption && unitOption.label]).forEach(function (unit) {
      attempts.push({ unit, house: "" });
      attempts.push({ unit });
      attempts.push({ locationcode: unit, house: "" });
      attempts.push({ locationname: unit, house: "" });
    });

    if (!attempts.length) {
      attempts.push({ unit: "", house: "" });
      attempts.push({ house: "" });
      attempts.push({});
    }

    for (const parameters of attempts) {
      const rows = await loadRows(AXPERT_DATASOURCES.layerBatchDetails.name, addGlobalContextParams(parameters));
      if (rows.length) return rows;
    }

    return [];
  }

  async function loadBatchRowsForHouse(house, houseRow, unitOption) {
    const attempts = [];
    getBatchUnitCandidates(house, houseRow, unitOption).slice(0, 3).forEach(function (unit) {
      getBatchHouseCandidates(house, houseRow).slice(0, 4).forEach(function (houseCode) {
        attempts.push({ unit, house: houseCode });
      });
    });

    for (const parameters of attempts) {
      const rows = await loadRows(AXPERT_DATASOURCES.layerBatchDetails.name, addGlobalContextParams(parameters));
      if (rows.length) return rows;
    }

    return [];
  }

  async function loadHouses(options) {
    const selected = options && options.unit && options.unit !== "all" ? String(options.unit) : "";
    let activeUnitOptions = options && Array.isArray(options.unitOptions) && options.unitOptions.length
      ? options.unitOptions
      : await loadUnitOptions();

    if (selected) {
      activeUnitOptions = activeUnitOptions.filter(function (unitOption) {
        return String(unitOption.value || "") === selected;
      });
      if (!activeUnitOptions.length) activeUnitOptions = [{ value: selected, label: selected }];
    }

    if (!activeUnitOptions.length) activeUnitOptions = [{ value: "", label: "" }];

    const mappedHouses = [];

    for (const unitOption of activeUnitOptions) {
      const unitBatchRows = await loadBatchRowsForUnit(unitOption);
      if (unitBatchRows.length) {
        unitBatchRows.forEach(function (row) {
          mappedHouses.push(mapHouseRow(row, { unitOption, batchRow: row }));
        });
        continue;
      }

      const houseRows = await loadHouseRowsForUnit(unitOption);
      for (const houseRow of houseRows) {
        const baseHouse = mapHouseRow(houseRow, { unitOption });
        if (!baseHouse.id) continue;
        const batchRows = await loadBatchRowsForHouse(baseHouse, houseRow, unitOption);
        const activeBatchRow = batchRows.find(isActiveBatchRow) || batchRows[0];
        mappedHouses.push(mapHouseRow(houseRow, { unitOption, batchRow: activeBatchRow || {} }));
      }
    }

    if (!mappedHouses.length) {
      const rows = await loadRows(AXPERT_DATASOURCES.layerBatchDetails.name, addGlobalContextParams({}));
      rows.forEach(function (row) {
        mappedHouses.push(mapHouseRow(row, { batchRow: row }));
      });
    }

    const byKey = new Map();
    mappedHouses.filter(isActiveHouse).forEach(function (house) {
      const key = `${house.unit}|${house.id}|${house.batchId || house.batchCode || ""}`;
      byKey.set(key, house);
    });

    return Array.from(byKey.values()).sort(function (a, b) {
      return `${a.unitName || a.unit} ${a.name} ${a.batchId}`.localeCompare(`${b.unitName || b.unit} ${b.name} ${b.batchId}`);
    });
  }

  async function loadCharts(parameters) {
    const batchId = parameters && (parameters.batchid || parameters.batch_id || parameters.batchId || parameters.batch);
    if (!batchId) return mapChartRows([]);
    const queryParameters = {};
    if (batchId) {
      queryParameters.batchid = batchId;
      queryParameters.batch_id = batchId;
    }
    return mapChartRows(await loadRows(AXPERT_DATASOURCES.charts.name, queryParameters));
  }

  async function loadSchedules(parameters) {
    const batchId = parameters && (parameters.batchid || parameters.batch_id || parameters.batchId || parameters.batch);
    if (!batchId) return [];
    return (await loadRows(AXPERT_DATASOURCES.schedules.name, { batchid: batchId, batch_id: batchId })).map(function (row, index) {
      const schedule = mapScheduleRow(row);
      if (!schedule.id) schedule.id = index + 1;
      return schedule;
    });
  }

  async function loadFarmerActivities(parameters) {
    const batchId = parameters && (parameters.batchid || parameters.batch_id || parameters.batchId || parameters.batch);
    if (!batchId) return [];
    return (await loadRows(AXPERT_DATASOURCES.activities.name, { batchid: batchId, batch_id: batchId })).map(function (row, index) {
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

  async function executeReadyToTransferUpdate(parameters) {
    const batchId = String(parameters && parameters.batchid || "").trim();
    if (!batchId) throw new Error("A batch ID is required to mark the batch ready to transfer.");
    return callAxpertDataSourceFunction(AXPERT_DATASOURCES.readyToHarvestUpdate.name, { batchid: batchId });
  }

  window.LayersAPI = {
    loadUnitOptions: loadUnitOptions,
    loadHouses: loadHouses,
    loadCharts: loadCharts,
    loadSchedules: loadSchedules,
    loadFarmerActivities: loadFarmerActivities,
    executeDayEnd: executeDayEnd,
    executeReadyToTransferUpdate: executeReadyToTransferUpdate,
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

  window.dispatchEvent(new CustomEvent("LayersAPIReady", { detail: window.LayersAPI }));
})();

