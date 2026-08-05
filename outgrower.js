(function () {
  const AXPERT_TSTRUCT_OPTIONS = {
    basePath: "../../aspx/tstruct.aspx",
    iViewBasePath: "../../aspx/iview.aspx",
    openerIV: "",
    passContextInQuery: true,
  };

  const AXPERT_TSTRUCTS = {
    farmerRegistration: { title: "Farmer Registration", transid: "fmreg" },
    batchAllocationToFarmer: { title: "Batch Allocation to Farmer", transid: "bafar" },
    liveBirdTransferRequest: { title: "Live Bird Transfer Request", transid: "nlbdt" },
    outGrowerChickPlacement: { title: "Out Grower Chick Placement", transid: "chpog" },
    outGrowerMortality: { title: "Mortality - Out Grower", transid: "ogmor" },
    materialConsumption: { title: "Material Consumption Note", transid: "fdcon" },
    outGrowerBodyWeight: { title: "Body Weight Monitoring - Out Grower", transid: "ogbdw" },
    outGrowerPriceCard: { title: "Outgrower Price Card", transid: "prcad" },
    outGrowerMaterialIssue: { title: "Material Issue - Out Grower", transid: "matog" },
    outGrowerFeedReturn: { title: "Outgrower Feed Return", transid: "ogret" },
    scheduleMonitoring: { title: "Schedule Monitoring", transid: "schst" },
  };

  const AXPERT_IVIEWS = {};

  const QUICK_ENTRY_ACTIONS = [
    { key: "outGrowerMortality", icon: "M12 3 3 20h18L12 3zM12 9v5M12 17h.01" },
    { key: "materialConsumption", icon: "M4 8h16M6 8l1 12h10l1-12M9 4h6M9 12h6M10 16h4" },
    { key: "outGrowerBodyWeight", icon: "M7 20h10l-1-11H8L7 20zM9 9a3 3 0 0 1 6 0" },
    { key: "outGrowerPriceCard", icon: "M5 6h14M5 12h14M5 18h14" },
    { key: "outGrowerMaterialIssue", icon: "M4 6h16v12H4zM8 10h8M8 14h5" },
    { key: "outGrowerFeedReturn", icon: "M9 7 4 12l5 5M4 12h16" },
  ];

  const CARD_ACTIONS = [
    "outGrowerChickPlacement",
    "outGrowerMortality",
    "materialConsumption",
    "outGrowerBodyWeight",
    "outGrowerPriceCard",
    "outGrowerMaterialIssue",
    "outGrowerFeedReturn",
  ];

  const CHART_RANGES = {
    month: { label: "Monthly" },
    year: { label: "Yearly" },
  };

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

  const DATA_SOURCES = {
    farmers: { name: "poultry_outgrower_farmer" },
    houses: { name: "poultry_outgrower_houses" },
    batchDetails: { name: "poultry_outgrower_batchdetails" },
    schedules: { name: "poultry_schedule_details" },
    activities: { name: "poultry_activities_details" },
    charts: { name: "poultry_card_chart_details" },
    targetParams: { name: "poultry_outgrower_targetparams" },
    harvestReady: { name: "poultry_outgrower_harvestready" },
  };

  const outGrowerHouses = [];
  const farmerOptions = [];
  const targetParamIndex = new Map();

  const moduleCommand = document.getElementById("moduleCommand");
  const categoryFilterBar = document.getElementById("categoryFilterBar");
  const houseGrid = document.getElementById("houseGrid");
  const houseDetail = document.getElementById("houseDetail");
  const tstructPanel = document.getElementById("tstructPanel");
  const tstructFrame = document.getElementById("tstructFrame");
  const closeTstruct = document.getElementById("closeTstruct");
  const harvestReadyDialogHost = document.getElementById("harvestReadyDialogHost");
  let selectedHouseId = "";
  let selectedChartRange = "month";
  let selectedFarmer = "all";
  let currentSearchValue = "";
  let selectedMonthFrom = MONTH_OPTIONS[0] ? MONTH_OPTIONS[0].key : "";
  let selectedMonthTo = MONTH_OPTIONS[MONTH_OPTIONS.length - 1] ? MONTH_OPTIONS[MONTH_OPTIONS.length - 1].key : "";
  let selectedYearFrom = YEAR_OPTIONS[0] ? YEAR_OPTIONS[0].key : "";
  let selectedYearTo = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] ? YEAR_OPTIONS[YEAR_OPTIONS.length - 1].key : "";
  let selectedActivityTab = "schedule";
  let selectedScheduleStatusFilter = "all";
  let farmersLoading = false;
  let housesLoading = false;
  let farmerLoadMessage = "";
  let houseLoadMessage = "";
  let pendingTstructContext = null;
  let harvestReadyConfirmation = null;

  function debugOutgrower(message, payload) {
    if (!window.console) return;
    if (payload !== undefined) {
      console.log(`[Out Grower Operations] ${message}`, payload);
    } else {
      console.log(`[Out Grower Operations] ${message}`);
    }
  }

  function warnOutgrower(message, error) {
    if (window.console) console.warn(`[Out Grower Operations] ${message}`, error || "");
  }

  function toNumber(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    }).format(toNumber(value));
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

  function trayLabel(trays) {
    return `${formatNumber(trays.standard)}-${formatNumber(trays.reject)} Trays`;
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeKey(value) {
    return String(value || "").replace(/[\s_]/g, "").toLowerCase();
  }

  function getRowValue(row, fieldNames) {
    if (!row || typeof row !== "object") return "";
    const fields = fieldNames.map(normalizeKey).filter(Boolean);
    const sourceKey = Object.keys(row).find((key) => fields.includes(normalizeKey(key)));
    return sourceKey === undefined ? "" : row[sourceKey];
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

  function normalizeRows(payload, dataSourceName) {
    const parsed = parseMaybeJson(payload);
    const getByKey = (object, keyName) => {
      if (!object || typeof object !== "object" || !keyName) return undefined;
      const targetKey = normalizeKey(keyName);
      const sourceKey = Object.keys(object).find((key) => normalizeKey(key) === targetKey);
      return sourceKey === undefined ? undefined : object[sourceKey];
    };
    const isEnvelope = (object) => {
      return object && typeof object === "object" && !Array.isArray(object) &&
        ["result", "Result", "success", "message", "partialsuccess", "error", "adsname"].some((key) => Object.prototype.hasOwnProperty.call(object, key));
    };

    if (!parsed) return [];

    if (parsed && typeof parsed === "object" && typeof parsed.d === "string") {
      return normalizeRows(parsed.d, dataSourceName);
    }

    if (Array.isArray(parsed)) {
      return parsed.reduce((rows, item) => {
        const nestedRows = normalizeRows(item, dataSourceName);
        if (nestedRows.length) return rows.concat(nestedRows);
        if (item && typeof item === "object" && !Array.isArray(item) && !isEnvelope(item)) return rows.concat(item);
        return rows;
      }, []);
    }

    if (typeof parsed !== "object") return [];

    const namedRows = getByKey(parsed, dataSourceName);
    if (namedRows !== undefined && namedRows !== parsed) {
      const rows = normalizeRows(namedRows, dataSourceName);
      if (rows.length) return rows;
    }

    for (const key of ["row", "rows", "data", "records", "Table", "table", "value", "values", "result", "Result"]) {
      if (Object.prototype.hasOwnProperty.call(parsed, key)) {
        const rows = normalizeRows(parsed[key], dataSourceName);
        if (rows.length) return rows;
      }
    }

    return isEnvelope(parsed) ? [] : [parsed];
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

  function getAxpertWindows() {
    const windows = [window];

    try {
      if (window.parent && window.parent !== window) windows.push(window.parent);
    } catch (error) {
      debugOutgrower("parent window inaccessible", error);
    }

    try {
      if (window.top && !windows.includes(window.top)) windows.push(window.top);
    } catch (error) {
      debugOutgrower("top window inaccessible", error);
    }

    try {
      if (window.opener && !windows.includes(window.opener)) windows.push(window.opener);
    } catch (error) {
      debugOutgrower("opener window inaccessible", error);
    }

    return windows;
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
        debugOutgrower("global var lookup skipped inaccessible window", error);
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

  function serializeIViewParameters(parameters) {
    if (!parameters || typeof parameters !== "object") return "";
    return Object.keys(parameters)
      .filter((key) => parameters[key] !== undefined && parameters[key] !== null)
      .map((key) => `${key}~${String(parameters[key])}`)
      .join(",");
  }

  function callAxpertDataSourceFunction(dataSourceName, parameters, options) {
    for (const frameWindow of getAxpertWindows()) {
      if (typeof frameWindow.GetDataFromAxList !== "function") continue;

      const request = {
        adsNames: [dataSourceName],
        refreshCache: Boolean(options && options.forceReload),
        sqlParams: parameters || {},
        props: { ADS: true, pageno: 1, pagesize: 0 },
      };
      debugOutgrower("GetDataFromAxList", { dataSourceName, sqlParams: request.sqlParams, refreshCache: request.refreshCache });

      return new Promise((resolve, reject) => {
        let settled = false;
        const done = (payload) => {
          if (settled) return;
          settled = true;
          resolve(payload);
        };
        const fail = (error) => {
          if (settled) return;
          settled = true;
          reject(error);
        };

        try {
          const result = frameWindow.GetDataFromAxList(request, done, fail);
          if (result && typeof result.then === "function") result.then(done).catch(fail);
          else if (result !== undefined) done(result);
          else window.setTimeout(() => fail(new Error(`GetDataFromAxList did not return ${dataSourceName}`)), 6000);
        } catch (error) {
          fail(error);
        }
      });
    }

    for (const frameWindow of getAxpertWindows()) {
      if (typeof frameWindow.AxGetSqlData !== "function") continue;

      debugOutgrower("AxGetSqlData", { dataSourceName, parameters });

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
      debugOutgrower("GetIViewData", { dataSourceName, paramString, forceReload: Boolean(options && options.forceReload) });

      return new Promise((resolve, reject) => {
        let settled = false;
        const done = (payload) => {
          if (settled) return;
          settled = true;
          resolve(payload);
        };
        const fail = (error) => {
          if (settled) return;
          settled = true;
          reject(error);
        };

        try {
          const result = frameWindow.GetIViewData(dataSourceName, paramString, 1, 500, done);
          if (result && typeof result.then === "function") result.then(done).catch(fail);
          else if (result !== undefined) done(result);
          else window.setTimeout(() => fail(new Error(`GetIViewData did not return ${dataSourceName}`)), 6000);
        } catch (error) {
          fail(error);
        }
      });
    }

    return Promise.resolve([]);
  }

  async function loadRows(dataSourceName, parameters, options) {
    try {
      const payload = await callAxpertDataSourceFunction(dataSourceName, parameters || {}, options || {});
      const rows = normalizeRows(payload, dataSourceName);
      debugOutgrower("datasource rows loaded", { dataSourceName, count: rows.length });
      return rows;
    } catch (error) {
      warnOutgrower(`Unable to load datasource ${dataSourceName}.`, error);
      return [];
    }
  }

  function cleanTargetParams(value) {
    return String(value || "").trim().replace(/^\?/, "");
  }

  function extractTargetParams(source, visited) {
    if (source === undefined || source === null) return "";

    const seen = visited || new WeakSet();
    const parsed = parseMaybeJson(source);

    if (typeof parsed !== "object" || parsed === null) {
      const text = cleanTargetParams(parsed);
      return text.includes("=") ? text : "";
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

    const directValue = getRowValue(parsed, ["targetParams", "targetparams", "target_params", "targetparam", "target_param", "tstructParams", "tstruct_params", "params", "param", "openerIV", "openeriv", "iv"]);
    const directParams = cleanTargetParams(directValue);
    if (directParams && directParams.includes("=")) return directParams;

    for (const nestedKey of ["result", "Result", "row", "data", "rows", "records", "Table", "table", "value", "values", "d"]) {
      if (Object.prototype.hasOwnProperty.call(parsed, nestedKey)) {
        const nestedParams = extractTargetParams(parsed[nestedKey], seen);
        if (nestedParams) return nestedParams;
      }
    }

    for (const value of Object.values(parsed)) {
      const fallback = cleanTargetParams(value);
      if (fallback && fallback.includes("=")) return fallback;
    }

    return "";
  }

  function targetParamKeys(context) {
    if (!context) return [];

    const units = [context.unitCode, context.unitName, context.unit, context.unitId].map(normalizeKey).filter(Boolean);
    const houses = [context.houseId, context.houseCode, context.houseName, context.code, context.name, context.id].map(normalizeKey).filter(Boolean);
    const batches = [context.batchId, context.batchCode].map(normalizeKey).filter(Boolean);
    const keys = [];

    if (houses.length) keys.push(...houses);
    houses.forEach((houseValue) => {
      units.forEach((unitValue) => {
        keys.push(`${unitValue}|${houseValue}`);
        batches.forEach((batchValue) => keys.push(`${unitValue}|${houseValue}|${batchValue}`));
      });
      batches.forEach((batchValue) => keys.push(`${houseValue}|${batchValue}`));
    });

    return Array.from(new Set(keys));
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

  async function loadTargetParamsForHouse(house) {
    if (!house) return "";

    const cachedParams = getCachedTargetParams(house);
    if (cachedParams) return cachedParams;

    const context = getGlobalContext();
    const parameters = {};
    const farmName = house.farmName || house.branchName || context.branch;
    if (farmName) parameters.branch = farmName;
    if (farmName) parameters.farm = farmName;
    if (house.farmerName) parameters.farmer = house.farmerName;
    if (house.farmerName) parameters.farmername = house.farmerName;
    if (house.name) parameters.unit = house.name;
    if (house.name) parameters.house = house.name;
    if (house.code || house.id) parameters.sublocation = house.code || house.id;
    if (house.unitName) parameters.unitname = house.unitName;
    if (house.unitCode) parameters.unitcode = house.unitCode;
    if (house.batchId) {
      parameters.batchid = house.batchId;
      parameters.batch_id = house.batchId;
    }

    const rows = await loadRows(DATA_SOURCES.targetParams.name, parameters);
    return rememberTargetParamsForHouse(house, extractTargetParams(rows));
  }

  function renderSearchControl() {
    return `
      <div class="search-box module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
        <input id="houseSearch" type="search" value="${escapeAttribute(currentSearchValue)}" placeholder="Search houses..." aria-label="Search houses" />
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

  function renderFarmerFilter() {
    if (!categoryFilterBar) return;

    let optionsHtml = "";
    let disabled = "";

    if (farmersLoading) {
      disabled = "disabled";
      optionsHtml = '<option value="">Loading farmers...</option>';
    } else if (!farmerOptions.length) {
      disabled = "disabled";
      optionsHtml = '<option value="">No farmers found</option>';
    } else {
      optionsHtml = [
        `<option value="all" ${selectedFarmer === "all" ? "selected" : ""}>All Farmers</option>`,
        farmerOptions.map((farmer) => {
          const selected = selectedFarmer === farmer.value ? "selected" : "";
          return `<option value="${escapeAttribute(farmer.value)}" ${selected}>${escapeHtml(farmer.label)}</option>`;
        }).join(""),
      ].join("");
    }

    categoryFilterBar.innerHTML = `
      <label class="farmer-select">
        <span>Farmer</span>
        <select id="farmerFilter" aria-label="Select farmer" ${disabled}>
          ${optionsHtml}
        </select>
      </label>
    `;
  }

  function renderListActions() {
    return `
      <div class="command-actions">
        <button class="command-button" type="button" data-tstruct-action="farmerRegistration">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M16 11h6" /></svg>
          <span>Farmer Registration</span>
        </button>
        <button class="command-button primary" type="button" data-tstruct-action="batchAllocationToFarmer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v10H4zM8 11h4M8 14h8M17 5v4M15 7h4" /></svg>
          <span>Batch Allocation</span>
        </button>
        <details class="command-menu">
          <summary class="command-button icon-only" aria-label="More actions">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg>
          </summary>
          <div class="command-popover align-right">
            ${QUICK_ENTRY_ACTIONS.map((action) => `<button type="button" data-tstruct-action="${escapeAttribute(action.key)}">${escapeHtml(actionLabel(action.key))}</button>`).join("")}
          </div>
        </details>
      </div>
    `;
  }

  function renderListNavbar() {
    moduleCommand.innerHTML = `
      <div class="module-copy">
        <h2>Out Grower Operations</h2>
        <p><span id="activeHouseCount">${formatNumber(outGrowerHouses.filter((house) => house.status === "Active").length)}</span> active houses / <span id="birdTotal">${formatNumber(outGrowerHouses.reduce((sum, house) => sum + house.birdsHoused, 0))}</span> birds housed</p>
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
          Out Grower Operations
        </button>
        <h2>${escapeHtml(house.name)} <span class="house-code-pill">${escapeHtml(house.code)}</span></h2>
        <!-- <p>${escapeHtml(house.batchId)} / ${escapeHtml(house.stage)} / Feed indent: ${escapeHtml(house.feedIndent)}</p> -->
        <p>${escapeHtml(house.batchId)} / ${escapeHtml(house.stage)}</p>
      </div>
      ${renderSearchControl()}
      <div class="command-actions">
        ${renderQuickEntryMenu(house)}
      </div>
      ${renderNavTools()}
    `;
  }

  function encodeTargetParams(paramString) {
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

    console.log("malintha transid",transid);



    const unitTargetValue = context.unitName || context.unitCode || context.unitId;
    const houseTargetValue = context.houseName || context.houseCode || context.houseId;
    const batchTargetValue = context.batchId || context.batchCode;
    const farmTargetValue = context.branch || context.farm || context.farmName || context.branchName;
    const farmerTargetValue = context.farmerName || context.farmerCode;

    let entries=[];

     if (transid === "ogmor") {
    entries = [
      ["batch", batchTargetValue],
    ];
    }

    else if (transid==="fdcon"){
      entries =[["tobatch", batchTargetValue],];
    }
    else
    if (transid === "fmreg") {
  // Prevent URL prefill
     entries = [];

  // Prevent applyContextToTstruct() from manually prefilling Branch
      context.branch = "";
      context.branchName = "";
      context.farm = "";
      context.farmName = "";
    }
     else if (transid==="ogbdw"){
      entries =[["batch", batchTargetValue],];
    }
    else{
                entries = [
      ["module", context.module],
      ["unit", unitTargetValue],
      ["unit000F1", unitTargetValue],
      ["unitid", context.unitId || context.unitCode],
      ["unitname", context.unitName],
      ["unitcode", context.unitCode],
      ["house", houseTargetValue],
      ["house000F1", houseTargetValue],
      ["houseid", context.houseId],
      ["housecode", context.houseCode],
      ["housename", context.houseName],
      ["sublocation", houseTargetValue],
      ["sublocation000F1", houseTargetValue],
      ["farm", farmTargetValue],
      ["farm000F1", farmTargetValue],
      ["farmname", farmTargetValue],
      ["branch", farmTargetValue],
      ["branch000F1", farmTargetValue],
      ["branchname", farmTargetValue],
      ["farmer", farmerTargetValue],
      ["farmer000F1", farmerTargetValue],
      ["farmername", context.farmerName],
      ["farmercode", context.farmerCode],
      ["batch", batchTargetValue],
      ["batch000F1", batchTargetValue],
      ["batchid", context.batchId],
      ["batchcode", context.batchCode],
      ["batchno", batchTargetValue],
      ["tobatch", batchTargetValue],
      ["birdbatch", batchTargetValue],
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

  }

//   function buildTstructUrl(transid, context) {
//     const targetParams = buildTstructTargetParams(transid,context);
//     const encodedParams = encodeTargetParams(targetParams);
//     const transParam = `transid=${encodeURIComponent(transid)}`;
//     const openerParam = AXPERT_TSTRUCT_OPTIONS.openerIV
//       ? `&openerIV=${encodeURIComponent(AXPERT_TSTRUCT_OPTIONS.openerIV)}`
//       : "";

//     if (AXPERT_TSTRUCT_OPTIONS.passContextInQuery && encodedParams) {
//       return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${transParam}${openerParam}&${encodedParams}&act=open`;
//     }

//     return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${transParam}${openerParam}&act=open`;
//   }


  function buildTstructUrl(transid, context) {
    const targetParams = buildTstructTargetParams(transid,context);
    const encodedParams = encodeTstructTargetParams(targetParams);
    const transParam = `transid=${encodeURIComponent(transid)}`;
    const openerParam = AXPERT_TSTRUCT_OPTIONS.openerIV
      ? `&openerIV=${encodeURIComponent(AXPERT_TSTRUCT_OPTIONS.openerIV)}`
      : "";

      console.log("malintha targetparams",targetParams)
      console.log("malintha encodedParams",encodedParams)
      console.log("malintha transParam",transParam)
      console.log("malintha openerParam",openerParam)

    if (AXPERT_TSTRUCT_OPTIONS.passContextInQuery && encodedParams) {
      return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${transParam}${openerParam}&${encodedParams}&act=open`;
    }

    return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${transParam}${openerParam}&act=open`;
  }

  function buildIViewUrl(ivname, context) {
    const targetParams = buildTstructTargetParams(ivname,context);
    const encodedParams = encodeTargetParams(targetParams);
    const ivParam = `ivname=${encodeURIComponent(ivname)}`;
    return encodedParams
      ? `${AXPERT_TSTRUCT_OPTIONS.iViewBasePath}?${ivParam}&${encodedParams}&act=open`
      : `${AXPERT_TSTRUCT_OPTIONS.iViewBasePath}?${ivParam}&act=open`;
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

  async function loadTargetParamsForAction(context) {
    if (!context || context.targetParams || context.targetparams || !context.houseName) return context;

    try {
      const targetParams = await loadTargetParamsForHouse({
        id: context.houseId,
        code: context.houseCode,
        name: context.houseName,
        unitCode: context.unitCode,
        unitName: context.unitName,
        farmName: context.farmName || context.farm || context.branch,
        branchName: context.branchName || context.branch || context.farm,
        farmerName: context.farmerName,
        farmerCode: context.farmerCode,
        batchId: context.batchId,
      });

      if (targetParams) {
        context.targetParams = targetParams;
        const house = outGrowerHouses.find((item) => item.id === context.houseId);
        rememberTargetParamsForHouse(house || context, targetParams);
      }
    } catch (error) {
      warnOutgrower("Failed to load outgrower target params.", error);
    }

    return context;
  }

  async function openTstruct(actionKey, context) {
    if (actionKey === "outGrowerChickPlacement" && context && context.placementDone) return;
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;

    pendingTstructContext = Object.assign({ module: "outgrower" }, context || {}, {
      actionKey,
      transid: action.transid,
      title: action.title,
    });

    const currentContext = pendingTstructContext;
    await loadTargetParamsForAction(pendingTstructContext);
    if (pendingTstructContext !== currentContext) return;

    tstructFrame.src = buildTstructUrl(action.transid, pendingTstructContext);
    console.log("malintha transid is",tstructFrame.src)
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
  }

  async function openIView(actionKey, context) {
    const action = AXPERT_IVIEWS[actionKey];
    if (!action) return;

    pendingTstructContext = Object.assign({ module: "outgrower" }, context || {}, {
      actionKey,
      ivname: action.ivname,
      title: action.title,
    });

    const currentContext = pendingTstructContext;
    await loadTargetParamsForAction(pendingTstructContext);
    if (pendingTstructContext !== currentContext) return;

    tstructFrame.src = buildIViewUrl(action.ivname, pendingTstructContext);
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
  }

  function normalizePrefillKey(value) {
    return String(value || "").replace(/[\s_-]/g, "").toLowerCase();
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
      if (elementWindow && elementWindow.jQuery) {
        elementWindow.jQuery(element).trigger("change").trigger("change.select2");
      }
    } catch (error) {
      debugOutgrower("jQuery change skipped", error);
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
            debugOutgrower("Axpert setter skipped", { setterName, fieldName, error });
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
        debugOutgrower("field onchange skipped", error);
      }

      try {
        dispatchInputEvents(field);
        if (frameWindow && frameWindow.jQuery) {
          frameWindow.jQuery(field).trigger("change").trigger("change.select2");
        }
      } catch (error) {
        debugOutgrower("dependent change skipped", error);
      }

      reloadFns.forEach((fnName) => {
        const fn = frameWindow && frameWindow[fnName];
        if (typeof fn !== "function") return;

        try {
          fn.call(frameWindow, fieldName);
        } catch (error) {
          debugOutgrower("Axpert dependent reload skipped", { fnName, fieldName, error });
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

  function applyContextToTstruct() {
    const context = pendingTstructContext;
    if (!context) return null;

    let frameWindow;
    let frameDocument;

    try {
      frameWindow = tstructFrame.contentWindow;
      frameDocument = tstructFrame.contentDocument || frameWindow && frameWindow.document;
    } catch (error) {
      warnOutgrower("Unable to access TStruct iframe for context prefill.", error);
      return null;
    }

    if (!frameWindow || !frameDocument || !frameDocument.body) return null;

    const farmValue = context.branch || context.farm || context.farmName || context.branchName;
    const farmerValue = context.farmerName || context.farmerCode;
    const fieldStages = [
      {
        key: "farm",
        value: farmValue,
        displayText: farmValue,
        fieldNames: ["farm", "farmname", "branch", "branchname"],
        labels: ["Farm", "Farm Name", "Branch"],
        keywords: ["farm", "branch"],
      },
      {
        key: "farmer",
        value: farmerValue,
        displayText: context.farmerCode || context.farmerName,
        fieldNames: ["farmer", "farmername", "farmercode"],
        labels: ["Farmer", "Farmer Name"],
        keywords: ["farmer"],
      },
      {
        key: "unit",
        value: context.unitName || context.unitCode || context.unitId,
        displayText: context.unitCode || context.unitId || context.unitName,
        fieldNames: ["unit", "unitname", "unitcode"],
        labels: ["Unit", "Unit Name"],
        keywords: ["unit"],
      },
      {
        key: "house",
        value: context.houseName || context.houseCode || context.houseId,
        displayText: context.houseCode || context.houseId || context.houseName,
        fieldNames: ["house", "houseid", "housename", "housecode", "sublocation"],
        labels: ["House", "House Name", "Sub Location"],
        keywords: ["house", "sublocation"],
      },
      {
        key: "batch",
        value: context.batchId || context.batchCode,
        displayText: context.batchCode || context.batchId,
        fieldNames: ["batch", "batchid", "batchno", "batchnumber", "tobatch", "birdbatch"],
        labels: ["Batch", "Batch No", "Batch ID"],
        keywords: ["batch"],
      },
    ];

    for (const config of fieldStages) {
      const appliedKey = `_${config.key}Applied`;
      if (context[appliedKey]) continue;

      if (!config.value) {
        context[appliedKey] = true;
        continue;
      }

      if (applyFieldContextToTstruct(frameWindow, frameDocument, config)) {
        context[appliedKey] = true;
        schedulePrefillReload(context, config.key, frameWindow, frameDocument, config);
        return { complete: false, stage: config.key };
      }

      return { complete: false, stage: config.key };
    }

    return { complete: fieldStages.every((config) => context[`_${config.key}Applied`] || !config.value) };
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

  function closeTstructPanel() {
    tstructPanel.classList.remove("is-open");
    tstructPanel.setAttribute("aria-hidden", "true");
    pendingTstructContext = null;
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

  function metric(label, value) {
    return `
      <div class="metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `;
  }

  function birdCountLabel(house) {
    if (!house.hasGenderSplit && !house.femaleBirds && !house.maleBirds) {
      return formatNumber(house.birdsHoused);
    }

    return `
      <span class="bird-count-split">
        <span>F - ${formatNumber(house.femaleBirds)}</span>
        <span>M - ${formatNumber(house.maleBirds)}</span>
      </span>
    `;
  }

  function percentLabel(value) {
    return `${formatNumber(value, 1)}%`;
  }

  function eggProductionPercent(house) {
    return house.liveHens ? (house.totalEggsProduced / house.liveHens) * 100 : 0;
  }

  function feedPerBird(house) {
    if (house.feedPerBird !== undefined && house.feedPerBird !== null && house.feedPerBird !== "") {
      return toNumber(house.feedPerBird);
    }

    return house.birdsHoused ? house.totalFeedGivenKg / house.birdsHoused : 0;
  }

  function mortalityRate(house) {
    if (house.mortalityRate !== undefined && house.mortalityRate !== null && house.mortalityRate !== "") {
      return toNumber(house.mortalityRate);
    }

    return house.totalBirds ? (house.deadBirds / house.totalBirds) * 100 : 0;
  }

  function bodyWeightUniformity(house) {
    return house.sampledBirds ? (house.birdsWithinTargetWeight / house.sampledBirds) * 100 : 0;
  }

  function getHousePlacementDate(house) {
    return house.placementDate || "-";
  }

  function actionContext(house) {
    const globalContext = getGlobalContext();
    return {
      module: "outgrower",
      houseId: house ? house.id : "",
      houseCode: house ? house.code : "",
      houseName: house ? house.name : "",
      unitCode: house ? house.unitCode : "",
      unitName: house ? house.unitName : "",
      farmName: house ? house.farmName || house.branchName : "",
      branchName: house ? house.branchName || house.farmName : "",
      farmerName: house ? house.farmerName : "",
      farmerCode: house ? house.farmerCode : "",
      batchId: house ? house.batchId : "",
      batchCode: house ? house.batchCode || house.batchId : "",
      branch: house && (house.branchName || house.farmName) || globalContext.branch,
      farm: house && (house.farmName || house.branchName) || globalContext.branch,
      targetParams: house ? house.targetParams || getCachedTargetParams(house) : "",
    };
  }

  function scheduleActionContext(house, button) {
    const schedules = house && Array.isArray(house.schedules) ? house.schedules : [];
    const rowIndex = Number(button && button.dataset.scheduleRowIndex);
    const schedule = Number.isInteger(rowIndex) ? schedules[rowIndex] : null;
    const context = actionContext(house);

    context.scheduleId = schedule ? schedule.id || "" : "";
    context.scheduleName = schedule ? schedule.name || "" : "";
    context.scheduleDate = schedule ? schedule.date || "" : "";
    context.scheduleAge = schedule ? schedule.age || "" : "";
    context.scheduleStatus = schedule ? normalizeActivityStatus(schedule.status) : "";
    return context;
  }

  function svgIcon(path) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
  }

  function actionLabel(actionKey) {
    if (AXPERT_TSTRUCTS[actionKey]) return AXPERT_TSTRUCTS[actionKey].title;
    if (AXPERT_IVIEWS[actionKey]) return AXPERT_IVIEWS[actionKey].title;
    return actionKey;
  }

  function getQuickEntryActions(house) {
    return QUICK_ENTRY_ACTIONS;
  }

  function getHouseHarvestDate(house) {
    return house.harvestDate || house.harvest_date || "";
  }

  function dedupeByValue(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = normalizeKey(item && item.value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function mapScheduleRows(rows) {
    return rows.map((row, index) => {
      const status = getRowValue(row, ["completed", "status", "schedule_status"]) || "Pending";
      return {
        id: getRowValue(row, ["id", "slno", "serial"]) || index + 1,
        age: getRowValue(row, ["age", "bage", "batch_age"]) || "",
        date: getRowValue(row, ["scheduledate", "scheduleDate", "schedule_date", "sch_date", "date", "docdate"]) || "",
        name: getRowValue(row, ["name", "bname", "schedule", "schedule_name"]) || "",
        dose: getRowValue(row, ["dose"]) || "",
        method: getRowValue(row, ["method"]) || "",
        description: getRowValue(row, ["description"]) || "",
        employeeName: getRowValue(row, ["employee_name", "employeeName", "employee"]) || "",
        batchId: getRowValue(row, ["batchid", "batch_id", "batch"]) || "",
        status,
      };
    });
  }

  async function loadSchedules(house) {
    const batchId = house && house.batchId || "";
    if (!batchId || batchId === "-") return [];
    const parameters = { batchid: batchId, batch_id: batchId };
    return mapScheduleRows(await loadRows(DATA_SOURCES.schedules.name, parameters, { forceReload: true }));
  }

  function mapFarmerActivityRows(rows) {
    return rows.map((row, index) => ({
      id: getRowValue(row, ["id", "slno", "serial"]) || index + 1,
      batchId: getRowValue(row, ["batchid", "batch_id", "batch"]) || "",
      task: getRowValue(row, ["task"]) || "",
      instructions: getRowValue(row, ["instructions", "instruction"]) || "",
      finding: getRowValue(row, ["finding", "findings"]) || "",
      status: getRowValue(row, ["status"]) || "Pending",
      priority: getRowValue(row, ["priority"]) || "",
      remark: getRowValue(row, ["remark", "remarks"]) || "",
    }));
  }

  async function loadFarmerActivities(house) {
    const batchId = house && house.batchId || "";
    if (!batchId || batchId === "-") return [];
    const parameters = { batchid: batchId, batch_id: batchId };
    return mapFarmerActivityRows(await loadRows(DATA_SOURCES.activities.name, parameters, { forceReload: true }));
  }

  async function executeHarvestReady(parameters) {
    const batchId = String(parameters && parameters.batch || "").trim();
    if (!batchId || batchId === "-") throw new Error("A batch is required to mark it ready to harvest.");
    return callAxpertDataSourceFunction(DATA_SOURCES.harvestReady.name, { batch: batchId });
  }

  async function completeHarvestReady(house) {
    const batchId = String(house && house.batchId || "").trim();
    if (!batchId || !harvestReadyConfirmation || harvestReadyConfirmation.houseId !== (house && house.id) || harvestReadyConfirmation.processing) return;

    harvestReadyConfirmation = Object.assign({}, harvestReadyConfirmation, { processing: true, error: "" });
    renderHarvestReadyConfirmation();

    try {
      await window.outGrowerOps.executeHarvestReady({ batch: batchId });
      house.readyToHarvest = true;
      closeHarvestReadyConfirmation();
      renderHouses(currentSearchValue);
      loadHouseCardsForSelectedFarmer({ forceReload: true }).catch((error) => {
        warnOutgrower("Failed to refresh ready-to-harvest status.", error);
      });
    } catch (error) {
      harvestReadyConfirmation = Object.assign({}, harvestReadyConfirmation, {
        processing: false,
        error: error && error.message ? error.message : "Ready To Harvest could not be updated.",
      });
      renderHarvestReadyConfirmation();
    }
  }

  async function loadFarmerOptions(options) {
    const context = getGlobalContext();
    const parameters = {};
    if (context.company) parameters.company = context.company;
    if (context.branch) parameters.branch = context.branch;

    const rows = await loadRows(DATA_SOURCES.farmers.name, parameters, { forceReload: options && options.forceReload });
    return dedupeByValue(rows
      .map((row) => {
        const farmerName = String(getRowValue(row, ["farmername", "farmer_name", "party_name", "name"]) || "").trim();
        const farmerCode = String(getRowValue(row, ["farmercode", "farmer_code", "party_code", "code"]) || farmerName).trim();
        return farmerName ? { value: farmerName, label: farmerName, code: farmerCode } : null;
      })
      .filter(Boolean));
  }

  function selectedFarmerOptions() {
    if (selectedFarmer === "all") return farmerOptions.slice();
    return farmerOptions.filter((farmer) => farmer.value === selectedFarmer);
  }

  function chartMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function parseChartDate(value) {
    if (!value) return null;
    const text = String(value).trim();
    const direct = new Date(text);
    if (!Number.isNaN(direct.getTime())) return direct;

    const match = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (!match) return null;
    const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatChartDateLabel(date, fallback) {
    if (!date) return fallback || "";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function mapChartRows(rows, batchId) {
    const selectedBatchId = String(batchId || "").trim().toLowerCase();
    const records = rows.map((row) => {
      const rawDate = getRowValue(row, ["docdate", "doc_date", "date"]);
      const date = parseChartDate(rawDate);
      return {
        batchId: getRowValue(row, ["batchid", "batch_id", "batchId", "batch"]),
        dateValue: date ? date.getTime() : 0,
        month: date ? chartMonthKey(date) : "",
        year: date ? String(date.getFullYear()) : "",
        label: getRowValue(row, ["periodLabel", "period_label", "label"]) || formatChartDateLabel(date, rawDate),
        birds: toNumber(getRowValue(row, ["birds", "livebirds", "live_birds"])),
        mortality: toNumber(getRowValue(row, ["mortality", "deadbirds", "dead_birds"])),
        feedKg: toNumber(getRowValue(row, ["feedkg", "feedKg", "feed_kg", "feedperbird", "feed_per_bird"])),
        bodyWeight: toNumber(getRowValue(row, ["bodyweight", "bodyWeight", "body_weight", "totalweight", "total_weight"])),
      };
    }).filter((record) => {
      if (!record.dateValue && !record.label) return false;
      const recordBatchId = String(record.batchId || "").trim().toLowerCase();
      return !selectedBatchId || !recordBatchId || recordBatchId === selectedBatchId;
    }).sort((a, b) => (a.dateValue || 0) - (b.dateValue || 0));

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

  async function loadCharts(house) {
    const batchId = house && house.batchId || "";
    if (!batchId || batchId === "-") return mapChartRows([], "");
    const parameters = { batchid: batchId, batch_id: batchId };
    const rows = await loadRows(DATA_SOURCES.charts.name, parameters, { forceReload: true });
    return mapChartRows(rows, batchId);
  }

  function normalizeParamValue(value) {
    const text = String(value || "").trim();
    return text === "-" ? "" : text;
  }

  function houseIdentityKey(house) {
    return [
      house && house.farmerName,
      house && house.unitCode,
      house && house.code,
    ].map(normalizeKey).join("|");
  }

  function isMaleCategory(category) {
    const normalized = normalizeKey(category);
    return normalized === "m" || normalized === "male" || (normalized.includes("male") && !normalized.includes("female"));
  }

  function isFemaleCategory(category) {
    const normalized = normalizeKey(category);
    return normalized === "f" || normalized === "female" || normalized.includes("female");
  }

  function isReadyToHarvestFlag(value) {
    return ["T", "TRUE", "Y", "YES", "1", "READY"].includes(String(value || "").trim().toUpperCase());
  }

  function isPlacementDoneFlag(value) {
    return ["T", "TRUE", "Y", "YES", "1", "DONE", "COMPLETED", "COMPLETE"].includes(String(value || "").trim().toUpperCase());
  }

  function hasPlacementDone(house) {
    return Boolean(house && house.placementDone);
  }

  function isReadyToHarvest(house) {
    return Boolean(house && house.readyToHarvest);
  }

  function mapHouseRow(row, farmer, index) {
    const houseCode = String(getRowValue(row, ["housecode", "sublocationcode", "code"]) || "").trim();
    const houseName = String(getRowValue(row, ["housename", "sublocationname", "name"]) || houseCode).trim();
    const unitName = String(getRowValue(row, ["unitname", "locationname"]) || "").trim();
    const unitCode = String(getRowValue(row, ["unitcode", "locationcode"]) || "").trim();
    const farmerName = String(getRowValue(row, ["farmername", "party_name"]) || farmer && farmer.label || "").trim();
    const farmerCode = String(getRowValue(row, ["farmercode", "party_code"]) || farmer && farmer.code || farmerName).trim();
    const farmName = String(getRowValue(row, ["farm", "farmname", "branch", "branchname"]) || "").trim();
    const birdsHoused = toNumber(getRowValue(row, ["birdshoused", "birds_housed", "birds"]));
    const femaleBirds = toNumber(getRowValue(row, ["femalebirds", "female_birds", "female"]), birdsHoused || 0);
    const maleBirds = toNumber(getRowValue(row, ["malebirds", "male_birds", "male"]));
    const totalBirdsValue = getRowValue(row, ["totalbirds", "total_birds"]);
    const hasTotalBirds = totalBirdsValue !== undefined && totalBirdsValue !== null && totalBirdsValue !== "";
    const totalBirds = toNumber(totalBirdsValue, femaleBirds + maleBirds);

    const house = {
      id: [farmerCode || farmerName, houseCode || houseName, index + 1].filter(Boolean).join("|"),
      code: houseCode || "-",
      name: houseName || "-",
      unitName,
      unitCode,
      farmName,
      branchName: farmName,
      stage: String(getRowValue(row, ["stage", "housetype", "sublocationtype"]) || "Out Grower").trim(),
      farmerId: farmerName,
      farmerName,
      farmerCode,
      status: String(getRowValue(row, ["status"]) || "Active").trim(),
      users: toNumber(getRowValue(row, ["users"])),
      houseCost: toNumber(getRowValue(row, ["housecost", "house_cost"])),
      batchId: String(getRowValue(row, ["batchid", "batch", "batchno", "batch_no"]) || "-").trim(),
      flockAge: String(getRowValue(row, ["flockage", "flock_age", "age"]) || "-").trim(),
      birdsHoused,
      femaleBirds,
      maleBirds,
      hasGenderSplit: Boolean(femaleBirds || maleBirds),
      liveHens: hasTotalBirds ? totalBirds : toNumber(getRowValue(row, ["livehens", "live_hens"]), femaleBirds),
      totalEggsProduced: toNumber(getRowValue(row, ["totaleggsproduced", "total_eggs_produced", "eggs"])),
      totalFeedGivenKg: toNumber(getRowValue(row, ["totalfeedgivenkg", "feedkg", "feed_kg"])),
      deadBirds: toNumber(getRowValue(row, ["deadbirds", "mortality"])),
      totalBirds,
      hasTotalBirds,
      sampledBirds: toNumber(getRowValue(row, ["sampledbirds", "sampled_birds"])),
      birdsWithinTargetWeight: toNumber(getRowValue(row, ["birdswithintargetweight", "birds_within_target_weight"])),
      mortalityToday: toNumber(getRowValue(row, ["mortalitytoday", "mortality_today"])),
      mortalityRate: getRowValue(row, ["mortalityrate", "mortality_rate"]),
      feedPerBird: getRowValue(row, ["feedperbird", "feed_per_bird"]),
      trays: {
        standard: toNumber(getRowValue(row, ["standardtrays", "standard_trays", "trays"])),
        reject: toNumber(getRowValue(row, ["rejecttrays", "reject_trays"])),
      },
      weightKg: toNumber(getRowValue(row, ["weightkg", "weight_kg", "bodyweight", "body_weight"])),
      feedIndent: String(getRowValue(row, ["feedindent", "feed_indent"]) || "-").trim(),
      healthTasks: toNumber(getRowValue(row, ["healthtasks", "health_tasks"])),
      placementDate: String(getRowValue(row, ["placementdate", "placement_date", "birthdate"]) || "").trim(),
      harvestDate: String(getRowValue(row, ["harvestdate", "harvest_date"]) || "").trim(),
      placementDone: isPlacementDoneFlag(getRowValue(row, ["placementdone", "placement_done", "placementDone"])),
      readyToHarvest: isReadyToHarvestFlag(getRowValue(row, ["readytoharvest", "ready_to_harvest"])),
      schedules: [],
    };

    return house;
  }

  function createBatchHouseFromRow(row, baseHouse, index) {
    const batchId = String(getRowValue(row, ["batchid", "batch", "batchno", "batch_no"]) || baseHouse.batchId || "").trim();
    const houseCode = String(getRowValue(row, ["housecode", "sublocationcode", "code"]) || baseHouse.code || "").trim();
    const houseName = String(getRowValue(row, ["housename", "sublocationname", "name"]) || baseHouse.name || houseCode).trim();
    const unitCode = String(getRowValue(row, ["unitcode", "locationcode"]) || baseHouse.unitCode || "").trim();
    const unitName = String(getRowValue(row, ["unitname", "locationname"]) || baseHouse.unitName || "").trim();
    const farmerName = String(getRowValue(row, ["farmername", "party_name"]) || baseHouse.farmerName || "").trim();
    const farmerCode = String(getRowValue(row, ["farmercode", "party_code"]) || baseHouse.farmerCode || farmerName).trim();
    const farmName = String(getRowValue(row, ["farm", "farmname", "branch", "branchname"]) || baseHouse.farmName || baseHouse.branchName || "").trim();
    const flockAge = String(getRowValue(row, ["flockage", "flock_age"]) || baseHouse.flockAge || "-").trim();
    const status = String(getRowValue(row, ["status"]) || baseHouse.status || "Active").trim();
    const birdName = String(getRowValue(row, ["bird", "birdname", "itemname"]) || "").trim();
    const birdCategory = String(getRowValue(row, ["birdcategory", "bird_category", "category"]) || "").trim();

    return {
      id: [farmerCode || farmerName, unitCode, houseCode || houseName, batchId || index + 1].filter(Boolean).join("|"),
      code: houseCode || "-",
      name: houseName || "-",
      unitName,
      unitCode,
      farmName,
      branchName: farmName,
      stage: baseHouse.stage || "Out Grower",
      farmerId: farmerName,
      farmerName,
      farmerCode,
      status,
      users: baseHouse.users || 0,
      houseCost: baseHouse.houseCost || 0,
      batchId: batchId || "-",
      batchDocId: String(getRowValue(row, ["batchdocid", "batch_docid"]) || "").trim(),
      placementDocId: String(getRowValue(row, ["placementdocid", "placement_docid"]) || "").trim(),
      flockAge,
      flockAgeDays: toNumber(getRowValue(row, ["flockagedays", "flock_age_days"])),
      birdName,
      birdCategory,
      birdsHoused: 0,
      femaleBirds: 0,
      maleBirds: 0,
      hasGenderSplit: false,
      liveHens: 0,
      totalEggsProduced: baseHouse.totalEggsProduced || 0,
      totalFeedGivenKg: 0,
      deadBirds: 0,
      totalBirds: 0,
      hasTotalBirds: false,
      sampledBirds: baseHouse.sampledBirds || 0,
      birdsWithinTargetWeight: baseHouse.birdsWithinTargetWeight || 0,
      mortalityToday: baseHouse.mortalityToday || 0,
      mortalityRate: 0,
      feedPerBird: 0,
      trays: baseHouse.trays || { standard: 0, reject: 0 },
      weightKg: baseHouse.weightKg || 0,
      feedIndent: baseHouse.feedIndent || "-",
      healthTasks: baseHouse.healthTasks || 0,
      birthDate: String(getRowValue(row, ["birthdate", "birth_date"]) || "").trim(),
      placementDate: String(getRowValue(row, ["placementdate", "placement_date"]) || baseHouse.placementDate || "").trim(),
      harvestDate: String(getRowValue(row, ["harvestdate", "harvest_date"]) || baseHouse.harvestDate || "").trim(),
      placementDone: isPlacementDoneFlag(getRowValue(row, ["placementdone", "placement_done", "placementDone"])) || Boolean(baseHouse.placementDone),
      readyToHarvest: isReadyToHarvestFlag(getRowValue(row, ["readytoharvest", "ready_to_harvest"])),
      schedules: baseHouse.schedules || [],
    };
  }

  function applyBatchDetailRow(house, row) {
    const qty = toNumber(getRowValue(row, ["birdhoused", "birdshoused", "qty"]));
    const category = getRowValue(row, ["birdcategory", "bird_category", "category"]);
    house.birdsHoused += qty;

    if (isMaleCategory(category)) {
      house.maleBirds += qty;
      house.hasGenderSplit = true;
    } else if (isFemaleCategory(category)) {
      house.femaleBirds += qty;
      house.hasGenderSplit = true;
    }

    house.deadBirds = Math.max(house.deadBirds, toNumber(getRowValue(row, ["deadbirds", "dead_birds"])));
    house.totalFeedGivenKg += toNumber(getRowValue(row, ["totalfeedgivenkg", "total_feed_given_kg", "feedkg", "feed_kg"]));
    house.placementDone = Boolean(house.placementDone) || isPlacementDoneFlag(getRowValue(row, ["placementdone", "placement_done", "placementDone"]));
    house.readyToHarvest = Boolean(house.readyToHarvest) || isReadyToHarvestFlag(getRowValue(row, ["readytoharvest", "ready_to_harvest"]));

    const totalBirdsValue = getRowValue(row, ["totalbirds", "total_birds"]);
    if (totalBirdsValue !== undefined && totalBirdsValue !== null && totalBirdsValue !== "") {
      house.totalBirds = Math.max(house.totalBirds || 0, toNumber(totalBirdsValue));
      house.hasTotalBirds = true;
    }

    const feedPerBirdValue = getRowValue(row, ["feedperbird", "feed_per_bird"]);
    if (feedPerBirdValue !== undefined && feedPerBirdValue !== null && feedPerBirdValue !== "") {
      house.feedPerBird = toNumber(feedPerBirdValue);
    }

    const weightValue = getRowValue(row, ["bodyweight", "body_weight", "weightkg", "weight_kg"]);
    if (weightValue !== undefined && weightValue !== null && weightValue !== "") {
      house.weightKg = toNumber(weightValue);
    }
  }

  function finalizeBatchHouse(house) {
    if (!house.hasTotalBirds) {
      house.totalBirds = house.birdsHoused ? Math.max(0, house.birdsHoused - house.deadBirds) : 0;
    }
    house.liveHens = house.hasTotalBirds ? house.totalBirds : house.femaleBirds || house.birdsHoused;
    house.mortalityRate = house.birdsHoused ? (house.deadBirds / house.birdsHoused) * 100 : 0;
    if (!house.feedPerBird && house.birdsHoused && house.totalFeedGivenKg) {
      house.feedPerBird = house.totalFeedGivenKg / house.birdsHoused;
    }
    return house;
  }

  function mapBatchDetailRows(rows, baseHouse) {
    const groups = new Map();

    rows.forEach((row, index) => {
      const batchId = String(getRowValue(row, ["batchid", "batch", "batchno", "batch_no"]) || baseHouse.batchId || index + 1).trim();
      const houseCode = String(getRowValue(row, ["housecode", "sublocationcode", "code"]) || baseHouse.code || "").trim();
      const unitCode = String(getRowValue(row, ["unitcode", "locationcode"]) || baseHouse.unitCode || "").trim();
      const farmerName = String(getRowValue(row, ["farmername", "party_name"]) || baseHouse.farmerName || "").trim();
      const groupKey = [farmerName, unitCode, houseCode, batchId].map(normalizeKey).join("|");

      if (!groups.has(groupKey)) {
        groups.set(groupKey, createBatchHouseFromRow(row, baseHouse, index));
      }

      applyBatchDetailRow(groups.get(groupKey), row);
    });

    return Array.from(groups.values()).map(finalizeBatchHouse);
  }

  function normalizedDetailValue(value) {
    const normalized = normalizeKey(value);
    return normalized === "-" ? "" : normalized;
  }

  function isBatchDetailRowForHouse(row, baseHouse) {
    const rowUnit = normalizedDetailValue(getRowValue(row, ["unitcode", "locationcode"]));
    const rowHouse = normalizedDetailValue(getRowValue(row, ["housecode", "sublocationcode", "code"]));
    const rowHouseName = normalizedDetailValue(getRowValue(row, ["housename", "sublocationname"]));
    const rowFarmer = normalizedDetailValue(getRowValue(row, ["farmername", "party_name"]));
    const rowBatch = normalizedDetailValue(getRowValue(row, ["batchid", "batch", "batchno", "batch_no"]));
    const baseUnit = normalizedDetailValue(baseHouse && baseHouse.unitCode);
    const baseHouseCode = normalizedDetailValue(baseHouse && baseHouse.code);
    const baseHouseName = normalizedDetailValue(baseHouse && baseHouse.name);
    const baseFarmer = normalizedDetailValue(baseHouse && baseHouse.farmerName);
    const baseBatch = normalizedDetailValue(baseHouse && baseHouse.batchId);

    if (rowUnit && baseUnit && rowUnit !== baseUnit) return false;
    if (rowFarmer && baseFarmer && rowFarmer !== baseFarmer) return false;
    if (rowHouse && baseHouseCode && rowHouse !== baseHouseCode) return false;
    if (!rowHouse && rowHouseName && baseHouseName && rowHouseName !== baseHouseName) return false;
    if (!rowHouse && !rowHouseName && rowBatch && baseBatch && rowBatch !== baseBatch) return false;
    return true;
  }

  async function loadBaseHouseCardsForSelectedFarmers(farmersToLoad, options) {
    const rowGroups = await Promise.all(farmersToLoad.map(async (farmer) => {
      const rows = await loadRows(
        DATA_SOURCES.houses.name,
        { farmername: farmer.value },
        { forceReload: options && options.forceReload },
      );
      return rows.map((row, index) => mapHouseRow(row, farmer, index));
    }));

    return rowGroups.flat();
  }

  async function loadBatchDetailCards(baseHouses, options) {
  const unitGroups = new Map();
  baseHouses.forEach((baseHouse) => {
    const unitKey = normalizedDetailValue(baseHouse.unitCode);
    if (!unitKey) return;
    const group = unitGroups.get(unitKey) || [];
    group.push(baseHouse);
    unitGroups.set(unitKey, group);
  });

  const detailGroups = await Promise.all(Array.from(unitGroups.entries()).map(async ([unitKey, unitHouses]) => {
    const parameters = {
      unit: normalizeParamValue(unitHouses[0].unitCode),
      house: "",
    };
      const rows = await loadRows(DATA_SOURCES.batchDetails.name, parameters, { forceReload: options && options.forceReload });
      return unitHouses.flatMap((baseHouse) => {
        const matchingRows = rows.filter((row) => isBatchDetailRowForHouse(row, baseHouse));
        return mapBatchDetailRows(matchingRows, baseHouse);
      });
    }));

    const detailCards = detailGroups.flat();
    const housesWithDetails = new Set(detailCards.map(houseIdentityKey));
    const fallbackHouses = baseHouses.filter((house) => !housesWithDetails.has(houseIdentityKey(house)));
    return detailCards.concat(fallbackHouses);
  }

  async function loadHouseCardsForSelectedFarmer(options) {
    housesLoading = true;
    houseLoadMessage = "";
    outGrowerHouses.splice(0, outGrowerHouses.length);
    renderHouses(currentSearchValue);

    const farmersToLoad = selectedFarmerOptions();
    if (!farmersToLoad.length) {
      housesLoading = false;
      houseLoadMessage = farmerOptions.length ? "Select a farmer to load houses." : "No out grower farmers found.";
      renderHouses(currentSearchValue);
      return;
    }

    try {
      const loadedBaseHouses = await loadBaseHouseCardsForSelectedFarmers(farmersToLoad, options);
      const seen = new Set();
      const baseHouses = loadedBaseHouses.filter((house) => {
        const key = normalizeKey(house.id);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const houses = await loadBatchDetailCards(baseHouses, options);

      outGrowerHouses.splice(0, outGrowerHouses.length, ...houses);
      if (!houses.length) houseLoadMessage = "No out grower houses found for the selected farmer.";
    } catch (error) {
      warnOutgrower("Unable to load out grower houses.", error);
      houseLoadMessage = "Unable to load out grower houses.";
    } finally {
      housesLoading = false;
      renderHouses(currentSearchValue);
    }
  }

  async function initializeOutgrowerData(options) {
    farmersLoading = true;
    housesLoading = true;
    farmerLoadMessage = "";
    houseLoadMessage = "";
    farmerOptions.splice(0, farmerOptions.length);
    outGrowerHouses.splice(0, outGrowerHouses.length);
    renderFarmerFilter();
    renderHouses(currentSearchValue);

    const farmers = await loadFarmerOptions(options);
    farmerOptions.splice(0, farmerOptions.length, ...farmers);
    farmersLoading = false;
    if (!farmerOptions.length) {
      farmerLoadMessage = "No out grower farmers found.";
      housesLoading = false;
      houseLoadMessage = farmerLoadMessage;
      renderFarmerFilter();
      renderHouses(currentSearchValue);
      return;
    }

    if (selectedFarmer !== "all" && !farmerOptions.some((farmer) => farmer.value === selectedFarmer)) {
      selectedFarmer = "all";
    }

    renderFarmerFilter();
    await loadHouseCardsForSelectedFarmer(options);
  }

  function renderHouseCard(house) {
    const transferStage = isReadyToHarvest(house);
    const stageClass = transferStage ? " live-transfer-card is-ready-to-transfer" : " ready-harvest-card";
    return `
      <article class="house-card${stageClass}" data-house-id="${escapeAttribute(house.id)}" role="button" tabindex="0">
        <div class="house-card-header">
          <div>
            <h3>
              <span>${escapeHtml(house.name)}</span>
            </h3>
            <small>${escapeHtml(house.stage)} house</small>
          </div>
          <div class="house-tools">
            <div class="house-tag-row house-tag-row-primary">
              <span class="flock-age-badge">Flock age: ${escapeHtml(house.flockAge)}</span>
              ${transferStage ? '<span class="transfer-state-badge status-badge">Ready for transfer</span>' : ""}
            </div>
            <details class="card-menu">
              <summary aria-label="House actions">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg>
              </summary>
              <div class="command-popover align-right">
                ${(hasPlacementDone(house) ? CARD_ACTIONS.filter((action) => action !== "outGrowerChickPlacement") : CARD_ACTIONS).map((action) => {
                  const actionAttribute = AXPERT_IVIEWS[action] ? "data-iview-action" : "data-tstruct-action";
                  return `<button type="button" ${actionAttribute}="${escapeAttribute(action)}" data-house-id="${escapeAttribute(house.id)}">${escapeHtml(actionLabel(action))}</button>`;
                }).join("")}
              </div>
            </details>
          </div>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", escapeHtml(house.batchId))}
          ${metric("Bird count", birdCountLabel(house))}
          ${metric("Placement Date", escapeHtml(formatDate(getHousePlacementDate(house))))}
          ${metric("Expected Production Date", escapeHtml(formatDate(getHouseHarvestDate(house) || "-")))}
          ${metric("Feed / Bird", `${formatNumber(feedPerBird(house), 3)} kg`)}
          ${metric("Mortality Rate", percentLabel(mortalityRate(house)))}
        </div>
        ${renderHarvestAction(house)}
      </article>
    `;
  }

  function renderHarvestAction(house) {
    if (!hasPlacementDone(house)) return "";
    if (isReadyToHarvest(house)) {
      return `
        <button class="command-button primary transfer-request-button" type="button" data-tstruct-action="liveBirdTransferRequest" data-house-id="${escapeAttribute(house.id)}" aria-label="Live Bird Transfer Request for ${escapeAttribute(house.batchId || house.name)}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6M5 6v12" /></svg>
          <span>Live Bird Transfer Request</span>
        </button>
      `;
    }

    return `
      <button class="command-button primary harvest-ready-button" type="button" data-harvest-ready data-house-id="${escapeAttribute(house.id)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z" /></svg>
        <span>Ready To Harvest</span>
      </button>
    `;
  }

  function renderHarvestReadyConfirmation() {
    if (!harvestReadyDialogHost) return;

    if (!harvestReadyConfirmation) {
      harvestReadyDialogHost.innerHTML = "";
      return;
    }

    const house = outGrowerHouses.find((item) => item.id === harvestReadyConfirmation.houseId);
    if (!house) {
      harvestReadyConfirmation = null;
      harvestReadyDialogHost.innerHTML = "";
      return;
    }

    const processing = Boolean(harvestReadyConfirmation.processing);
    const disabled = processing ? "disabled" : "";
    const error = harvestReadyConfirmation.error
      ? `<p class="harvest-ready-confirmation-error" role="alert">${escapeHtml(harvestReadyConfirmation.error)}</p>`
      : "";

    harvestReadyDialogHost.innerHTML = `
      <div class="harvest-ready-confirmation-backdrop" role="presentation">
        <section class="harvest-ready-confirmation" role="dialog" aria-modal="true" aria-labelledby="harvestReadyConfirmationTitle">
          <h3 id="harvestReadyConfirmationTitle">Confirm Ready To Harvest</h3>
          <p>Mark batch ${escapeHtml(house.batchId || "")} as ready to harvest?</p>
          ${error}
          <div class="harvest-ready-confirmation-actions">
            <button class="command-button" type="button" data-harvest-ready-cancel ${disabled}>No</button>
            <button class="command-button primary" type="button" data-harvest-ready-confirm ${disabled}>${processing ? "Processing..." : "Yes"}</button>
          </div>
        </section>
      </div>
    `;
  }

  function openHarvestReadyConfirmation(house) {
    const batchId = String(house && house.batchId || "").trim();
    if (!house || !batchId || batchId === "-" || isReadyToHarvest(house)) return;
    harvestReadyConfirmation = { houseId: house.id, batchId, processing: false, error: "" };
    renderHarvestReadyConfirmation();
  }

  function closeHarvestReadyConfirmation() {
    harvestReadyConfirmation = null;
    renderHarvestReadyConfirmation();
  }

  function renderQuickEntryMenu(house) {
    return `
      <details class="command-menu entry-menu">
        <summary class="command-button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8l1 3H7l1-3zM6 7h12v13H6z" /></svg>
          <span>Entry</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div class="entry-grid-popover align-right">
          ${getQuickEntryActions(house).map((action) => `
            <button class="entry-grid-option" type="button" data-tstruct-action="${escapeAttribute(action.key)}" data-house-id="${escapeAttribute(house.id)}">
              <span class="entry-grid-icon">${svgIcon(action.icon)}</span>
              <span>${escapeHtml(actionLabel(action.key))}</span>
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
        <div>
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      </div>
    `;
  }

  function renderPeriodOptions(options, selectedValue) {
    return options.map((item) => `<option value="${item.key}" ${item.key === selectedValue ? "selected" : ""}>${item.label}</option>`).join("");
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
          <select data-chart-period="from">
            ${renderPeriodOptions(options, fromValue)}
          </select>
        </label>
        <span class="period-separator">to</span>
        <label class="period-field">
          <span>${endLabel}</span>
          <select data-chart-period="to">
            ${renderPeriodOptions(options, toValue)}
          </select>
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
          <div>
            <h3>${title}</h3>
            <p>${axis}</p>
          </div>
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
          return `<button class="activity-tab${isActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${isActive ? "true" : "false"}" data-activity-tab="${escapeHtml(tab.key)}">${escapeHtml(tab.label)}</button>`;
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

  function renderActivityStatusPill(status) {
    const normalizedStatus = normalizeActivityStatus(status);
    return `<span class="activity-status-pill ${scheduleStatusClass(normalizedStatus)}">${escapeHtml(normalizedStatus)}</span>`;
  }

  function renderScheduleStatusEditButton(rowIndex, rowId) {
    return `<button class="activity-row-edit-button" type="button" data-schedule-status-edit="true" data-schedule-row-index="${escapeHtml(rowIndex)}" data-activity-row-id="${escapeHtml(rowId || "")}">Edit</button>`;
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
            return `<button class="schedule-status-filter-button${isActive ? " is-active" : ""}" type="button" data-schedule-status-filter="${escapeHtml(filter.key)}" aria-pressed="${isActive ? "true" : "false"}">${escapeHtml(filter.label)}</button>`;
          }).join("")}
        </div>
      </div>
    `;
  }

  function renderScheduleRows(house) {
    if (house.schedulesLoading) {
      return '<tr><td colspan="9" class="activity-empty-row">Loading schedules...</td></tr>';
    }

    const schedules = Array.isArray(house.schedules) ? house.schedules : [];
    const visibleSchedules = schedules.filter(scheduleMatchesStatusFilter);
    if (!visibleSchedules.length) {
      return '<tr><td colspan="9" class="activity-empty-row">No schedule records available.</td></tr>';
    }

    return visibleSchedules.map((item) => {
      const sourceIndex = schedules.indexOf(item);
      const rowId = item.id || sourceIndex + 1;
      return `
              <tr>
                <td>${escapeHtml(rowId)}</td>
                <td>${escapeHtml(item.age || "-")}</td>
                <td>${escapeHtml(item.date || "-")}</td>
                <td>${escapeHtml(item.name || "-")}</td>
                <td>${escapeHtml(item.dose || "-")}</td>
                <td>${escapeHtml(item.method || "-")}</td>
                <td>${escapeHtml(item.description || "-")}</td>
                <td>${renderActivityStatusPill(item.status)}</td>
                <td>${renderScheduleStatusEditButton(sourceIndex, rowId)}</td>
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

  function refreshFarmerActivityPanel(house) {
    if (!house || selectedActivityTab !== "farmerActivity" || selectedHouseId !== house.id) return;
    const activityPanels = houseDetail.querySelector(".activity-panels");
    if (activityPanels) activityPanels.innerHTML = renderFarmerActivityPanel(house);
  }

  function renderScheduleActivityPanel(house) {
    return `
      <div class="activity-panel-body" role="tabpanel" aria-label="Schedule">
        <div class="table-panel-header activity-table-header">
          <div>
            <h3>Schedules</h3>
            <p>Medication, monitoring, and review actions attached to this out grower batch.</p>
          </div>
          <div class="activity-header-actions">
            ${renderScheduleStatusFilter()}
            <button class="command-button" type="button" data-tstruct-action="materialConsumption" data-house-id="${escapeHtml(house.id)}">Add Schedule</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Age</th><th>Sch. Date</th><th>Name</th><th>Dose</th><th>Method</th><th>Description</th><th>Status</th><th>Edit</th></tr></thead>
            <tbody>${renderScheduleRows(house)}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderFarmerActivityPanel(house) {
    return `
      <div class="activity-panel-body" role="tabpanel" aria-label="Farmer Activity">
        <div class="table-panel-header activity-table-header">
          <div>
            <h3>Farmer Activity</h3>
            <p>Tasks, findings, and remarks attached to this out grower batch.</p>
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
            <p>Track schedules and farmer activity for this out grower batch.</p>
          </div>
        </div>
        ${renderActivityTabs()}
        <div class="activity-panels">
          ${selectedActivityTab === "farmerActivity" ? renderFarmerActivityPanel(house) : renderScheduleActivityPanel(house)}
        </div>
      </section>
    `;
  }

  function renderHouseDetail(houseId) {
    const house = outGrowerHouses.find((item) => item.id === houseId);
    if (!house) return;

    const previousHouseId = selectedHouseId;
    selectedHouseId = house.id;
    if (previousHouseId && previousHouseId !== house.id) {
      selectedActivityTab = "schedule";
      selectedScheduleStatusFilter = "all";
    }
    renderDetailNavbar(house);
    moduleCommand.hidden = false;
    categoryFilterBar.hidden = true;
    houseGrid.hidden = true;
    houseDetail.hidden = false;
    house.schedulesLoading = Boolean(house.batchId && house.batchId !== "-");
    house.farmerActivitiesLoading = Boolean(house.batchId && house.batchId !== "-");

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
    `;

    requestAnimationFrame(function () {
      drawHouseCharts(house);
    });

    loadCharts(house).then(function (chartMetrics) {
      if (selectedHouseId !== house.id) return;
      house.metrics = chartMetrics;
      drawHouseCharts(house);
    }).catch(function (error) {
      warnOutgrower("Failed to load chart data.", error);
      drawHouseCharts(house);
    });

    loadSchedules(house).then(function (schedules) {
      if (selectedHouseId !== house.id) return;
      house.schedules = schedules;
      house.schedulesLoading = false;
      refreshScheduleActivityPanel(house);
    }).catch(function (error) {
      house.schedulesLoading = false;
      refreshScheduleActivityPanel(house);
      warnOutgrower("Failed to load schedule data.", error);
    });

    loadFarmerActivities(house).then(function (activities) {
      if (selectedHouseId !== house.id) return;
      house.farmerActivities = activities;
      house.farmerActivitiesLoading = false;
      refreshFarmerActivityPanel(house);
    }).catch(function (error) {
      house.farmerActivitiesLoading = false;
      refreshFarmerActivityPanel(house);
      warnOutgrower("Failed to load farmer activity data.", error);
    });
  }

  function renderHouseList() {
    selectedHouseId = "";
    selectedActivityTab = "schedule";
    selectedScheduleStatusFilter = "all";
    renderListNavbar();
    renderFarmerFilter();
    moduleCommand.hidden = false;
    categoryFilterBar.hidden = false;
    houseGrid.hidden = false;
    houseDetail.hidden = true;
    houseDetail.innerHTML = "";
  }

  function renderHouses(query) {
    const search = (query || "").trim().toLowerCase();
    const visibleHouses = outGrowerHouses.filter((house) => {
      const matchesFarmer = selectedFarmer === "all" || house.farmerName === selectedFarmer || house.farmerId === selectedFarmer;
      const matchesSearch = !search || [house.name, house.code, house.stage, house.batchId, house.status, house.farmerName, house.unitName, house.unitCode]
        .join(" ")
        .toLowerCase()
        .includes(search);

      return matchesFarmer && matchesSearch;
    });

    const activeHouseCount = document.getElementById("activeHouseCount");
    const birdTotal = document.getElementById("birdTotal");
    if (activeHouseCount) activeHouseCount.textContent = formatNumber(outGrowerHouses.filter((house) => house.status === "Active").length);
    if (birdTotal) birdTotal.textContent = formatNumber(outGrowerHouses.reduce((sum, house) => sum + house.birdsHoused, 0));

    if (housesLoading) {
      houseGrid.innerHTML = "";
      return;
    }

    if (!visibleHouses.length) {
      houseGrid.innerHTML = `<div class="empty-state">${escapeHtml(houseLoadMessage || "No out grower houses found.")}</div>`;
      return;
    }

    if (selectedFarmer !== "all") {
      houseGrid.innerHTML = visibleHouses.map(renderHouseCard).join("");
      return;
    }

    const grouped = visibleHouses.reduce((result, house) => {
      const label = house.farmerName || "Unassigned";
      result[label] = result[label] || [];
      result[label].push(house);
      return result;
    }, {});

    houseGrid.innerHTML = Object.keys(grouped).sort().map((farmerLabel) => {
      return `<div class="unit-separator"><h3>${escapeHtml(farmerLabel)}</h3><hr/></div>` +
        grouped[farmerLabel].map(renderHouseCard).join("");
    }).join("");
  }

  document.addEventListener("click", function (event) {
    const activeMenu = event.target.closest("details");
    closeOpenMenus(activeMenu);

    const refreshButton = event.target.closest("#refreshBtn");
    if (refreshButton) {
      reloadCurrentFrame();
      return;
    }

    const harvestReadyButton = event.target.closest("[data-harvest-ready]");
    if (harvestReadyButton) {
      event.preventDefault();
      event.stopPropagation();
      openHarvestReadyConfirmation(outGrowerHouses.find((item) => item.id === (harvestReadyButton.dataset.houseId || "")));
      return;
    }

    const harvestReadyCancelButton = event.target.closest("[data-harvest-ready-cancel]");
    if (harvestReadyCancelButton) {
      closeHarvestReadyConfirmation();
      return;
    }

    const harvestReadyConfirmButton = event.target.closest("[data-harvest-ready-confirm]");
    if (harvestReadyConfirmButton) {
      completeHarvestReady(outGrowerHouses.find((item) => item.id === (harvestReadyConfirmation && harvestReadyConfirmation.houseId || "")));
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
      selectedActivityTab = activityTab.dataset.activityTab || "schedule";
      if (selectedHouseId) renderHouseDetail(selectedHouseId);
      return;
    }

    const scheduleStatusFilterButton = event.target.closest("[data-schedule-status-filter]");
    if (scheduleStatusFilterButton) {
      const house = outGrowerHouses.find((item) => item.id === selectedHouseId);
      selectedScheduleStatusFilter = normalizeScheduleStatusFilter(scheduleStatusFilterButton.dataset.scheduleStatusFilter);
      if (house) refreshScheduleActivityPanel(house);
      return;
    }

    const scheduleEditButton = event.target.closest("[data-schedule-status-edit]");
    if (scheduleEditButton) {
      event.preventDefault();
      event.stopPropagation();
      const house = outGrowerHouses.find((item) => item.id === selectedHouseId);
      openTstruct("scheduleMonitoring", scheduleActionContext(house, scheduleEditButton));
      closeOpenMenus();
      return;
    }

    const iViewButton = event.target.closest("[data-iview-action]");
    if (iViewButton) {
      event.preventDefault();
      event.stopPropagation();

      const houseId = iViewButton.dataset.houseId || "";
      const house = outGrowerHouses.find((item) => item.id === houseId);
      openIView(iViewButton.dataset.iviewAction, actionContext(house));
      closeOpenMenus();
      return;
    }

    const actionButton = event.target.closest("[data-tstruct-action]");
    if (actionButton) {
      event.preventDefault();
      event.stopPropagation();

      const houseId = actionButton.dataset.houseId || "";
      const house = outGrowerHouses.find((item) => item.id === houseId);
      openTstruct(actionButton.dataset.tstructAction, actionContext(house));
      closeOpenMenus();
      return;
    }

    const backButton = event.target.closest("[data-back-to-houses]");
    if (backButton) {
      renderHouseList();
      renderHouses(currentSearchValue);
      return;
    }

    if (event.target.closest(".card-menu")) {
      return;
    }

    const houseCard = event.target.closest("[data-house-id]");
    if (houseCard) {
      renderHouseDetail(houseCard.dataset.houseId);
      return;
    }

    if (event.target === tstructPanel) {
      closeTstructPanel();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && harvestReadyConfirmation) {
      closeHarvestReadyConfirmation();
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

  document.addEventListener("change", function (event) {
    if (event.target && event.target.id === "farmerFilter") {
      selectedFarmer = event.target.value || "all";
      loadHouseCardsForSelectedFarmer({ forceReload: true });
    }
  });

  closeTstruct.addEventListener("click", closeTstructPanel);

  window.outGrowerOps = {
    openTstruct,
    openIView,
    executeHarvestReady,
    loadTargetParamsForHouse,
    openHouse: renderHouseDetail,
    backToHouses: function () {
      renderHouseList();
      renderHouses(currentSearchValue);
    },
    tstructs: AXPERT_TSTRUCTS,
    iviews: AXPERT_IVIEWS,
    houses: outGrowerHouses,
  };

  tstructFrame.addEventListener("load", prefillTstructUnitContext);
  farmersLoading = true;
  housesLoading = true;
  renderHouseList();
  renderHouses(currentSearchValue);
  initializeOutgrowerData();

  function drawHouseCharts(house) {
    if (!house.metrics || !hasChartRows(house.metrics)) {
      drawReservedChartPlaceholders();
      return;
    }

    const chartOptions = {
      birds: { color: "#2569e8", decimals: 0 },
      mortality: { color: "#df4d5f", decimals: 0 },
      feedKg: { color: "#00a896", decimals: 2 },
      bodyWeight: { color: "#d59220", decimals: 0 },
    };

    Object.keys(chartOptions).forEach(function (key) {
      const canvas = houseDetail.querySelector(`[data-chart="${key}"]`);
      if (!canvas) return;
      const series = getChartSeries(house, key);
      if (!series.values.length) return;
      canvas.style.minWidth = `${Math.max(660, series.labels.length * 76)}px`;
      drawLineChart(canvas, series.labels, series.values, chartOptions[key]);
    });
  }

  function getSelectedPeriodItems(options, fromValue, toValue) {
    const fromIndex = Math.max(0, options.findIndex((item) => item.key === fromValue));
    const toIndex = Math.max(0, options.findIndex((item) => item.key === toValue));
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    return options.slice(start, end + 1);
  }

  function hasChartRows(metrics) {
    return Boolean(metrics && Array.isArray(metrics.records) && metrics.records.length);
  }

  function aggregateChartRecords(records, key, periodItems) {
    const rangeType = selectedChartRange === "month" ? "month" : "year";
    const grouped = records.reduce((result, record) => {
      const periodKey = rangeType === "month" ? record.month : record.year;
      if (!periodKey) return result;
      (result[periodKey] || (result[periodKey] = [])).push(record);
      return result;
    }, {});

    return {
      labels: periodItems.map((item) => item.label),
      values: periodItems.map((item) => {
        const periodRows = (grouped[item.key] || []).slice().sort((a, b) => (a.dateValue || 0) - (b.dateValue || 0));
        if (!periodRows.length) return 0;
        if (key === "birds") return periodRows[periodRows.length - 1].birds || 0;
        if (key === "bodyWeight") {
          const readings = periodRows.map((row) => row.bodyWeight || 0).filter((value) => value > 0);
          return readings.length ? Math.round(readings.reduce((sum, value) => sum + value, 0) / readings.length) : 0;
        }
        const total = periodRows.reduce((sum, row) => sum + (row[key] || 0), 0);
        return key === "feedKg" ? Number(total.toFixed(2)) : Math.round(total);
      }),
    };
  }

  function getChartSeries(house, key) {
    const metrics = house.metrics || {};
    if (!metrics.fromDataSource || !hasChartRows(metrics)) return { labels: [], values: [] };
    const periodItems = selectedChartRange === "month"
      ? getSelectedPeriodItems(MONTH_OPTIONS, selectedMonthFrom, selectedMonthTo)
      : getSelectedPeriodItems(YEAR_OPTIONS, selectedYearFrom, selectedYearTo);
    return aggregateChartRecords(metrics.records, key, periodItems);
  }

  function drawReservedChartPlaceholders() {
    const labels = {
      birds: "Birds Housed",
      mortality: "Mortality",
      feedKg: "Feed Consumption",
      bodyWeight: "Body Weight",
    };

    houseDetail.querySelectorAll("[data-chart]").forEach((canvas) => {
      const ctx = canvas.getContext && canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 320);
      const height = Math.max(rect.height, 220);
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#536982";
      ctx.textAlign = "center";
      ctx.font = "600 13px Inter, system-ui, sans-serif";
      ctx.fillText(labels[canvas.dataset.chart] || "Chart", width / 2, height / 2 - 8);
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillText("No chart records available", width / 2, height / 2 + 14);
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
    points.slice(1).forEach(function (point) {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.lineTo(points[0].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(function (point) {
      ctx.lineTo(point.x, point.y);
    });
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
      }
    });

    points.forEach(function (point, index) {
      if (shouldDrawChartMarker(index, points.length)) {
        ctx.fillStyle = "#536982";
        ctx.textAlign = "center";
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(point.label, point.x, height - 12);
      }
    });
  }
})();

