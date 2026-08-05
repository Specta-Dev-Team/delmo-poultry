(function () {
  const CONFIG = {
    key: "parent",
    title: "Parent Operations",
    emptyLabel: "No active parent batch houses found.",
    exposeName: "parentOps",
    tstructOptions: {
      basePath: "../../aspx/tstruct.aspx",
      openerIV: "",
      passContextInQuery: true,
    },
  };

  const DEBUG_PARENT = false;

  const DATA_SOURCES = {
    units: { name: "poultry_unit_filter" },
    parentBatchDetails: { name: "poultry_parent_batch_details" },
    targetParams: { name: "poultry_targetparams" },
    charts: { name: "poultry_card_chart_details" },
    schedules: { name: "poultry_schedule_details" },
    activities: { name: "poultry_activities_details" },
    dayEnd: { name: "poultry_dayend_update" },
    readyToHarvestUpdate: { name: "poultry_cull_harvest_update" },
  };

  const TARGET_PARAM_FIELDS = [
    "targetParams", "targetparams", "target_params", "targetparam", "target_param",
    "tstructParams", "tstruct_params", "params", "param", "openerIV", "openeriv", "iv",
  ];

  const TSTRUCTS = {
    placement: { title: "Placement", transid: "btplc" },
    eggCollection: { title: "Egg Collection", transid: "eggcl" },
    mortality: { title: "Mortality", transid: "morta" },
    feedMedication: { title: "Feed Consumption / Medication", transid: "fdcon" },
    bodyWeight: { title: "Body Weight Monitoring", transid: "bdwgt" },
    lighting: { title: "Lighting Management", transid: "light" },
    environment: { title: "Environment Monitoring", transid: "envnm" },
    water: { title: "Water Consumption Monitoring", transid: "water" },
    liveBirdTransferRequest: { title: "Live Bird Transfer Request", transid: "nlbdt" },
    hatcherTransfer: { title: "Grower To Layer", transid: "layer" },
    scheduleMonitoring: { title: "Schedule Monitoring", transid: "schst" },
    batchCreation: { title: "Batch Creation", transid: "batcr" },
    houseCreation: { title: "House Creation", transid: "house" },
  };

  const IVIEWS = {
    materialConsumptionCost: {
      title: "Poultry Material Consumption Cost Details",
      ivname: "feedmedi",
    },
  };

  const CARD_ACTIONS = ["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water"];
  const DETAIL_ACTIONS = ["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water", "hatcherTransfer"];
  const DETAIL_IVIEW_ACTIONS = ["materialConsumptionCost"];

  const ICONS = {
    placement: "M8 4h8M6 8h12l-1 12H7L6 8zM9 12h6M10 16h4",
    eggCollection: "M4 9h16M5 9l2 10h10l2-10M8 6h8M9 13h.01M12 13h.01M15 13h.01",
    mortality: "M12 3 3 20h18L12 3zM12 9v5M12 17h.01",
    feedMedication: "M4 8h16M6 8l1 12h10l1-12M9 4h6M9 12h6M10 16h4",
    bodyWeight: "M7 20h10l-1-11H8L7 20zM9 9a3 3 0 0 1 6 0",
    lighting: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1.5 2 1.5 3h5c0-1 0.5-2 1.5-3a7 7 0 0 0-4-12z",
    environment: "M12 2v20M5 8a7 7 0 0 0 14 0M5 16a7 7 0 0 1 14 0",
    water: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
    hatcherTransfer: "M5 12h14M13 6l6 6-6 6M5 5v14",
    batchCreation: "M12 5v14M5 12h14",
    houseCreation: "M4 6h16v14H4zM8 6V4h8v2M8 11h8M8 15h5",
    materialConsumptionCost: "M4 7h16M6 7v13h12V7M9 11h6M9 15h3M16 4v4M12 4v4",
  };

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
  let unitOptions = [];
  let selectedUnit = "all";
  let selectedHouseId = "";
  let currentSearchValue = "";
  let pendingTstructContext = null;
  let pendingIViewContext = null;
  let screenDataLoadPromise = null;
  let selectedChartRange = "month";
  let selectedMonthFrom = MONTH_OPTIONS[0] ? MONTH_OPTIONS[0].key : "";
  let selectedMonthTo = MONTH_OPTIONS[MONTH_OPTIONS.length - 1] ? MONTH_OPTIONS[MONTH_OPTIONS.length - 1].key : "";
  let selectedYearFrom = YEAR_OPTIONS[0] ? YEAR_OPTIONS[0].key : "";
  let selectedYearTo = YEAR_OPTIONS[YEAR_OPTIONS.length - 1] ? YEAR_OPTIONS[YEAR_OPTIONS.length - 1].key : "";
  let selectedActivityTab = "schedule";
  let selectedScheduleStatusFilter = "all";
  let scheduleStatusEditor = null;
  let dayEndConfirmation = null;
  let readyToTransferConfirmation = null;

  const moduleCommand = document.getElementById("moduleCommand");
  const unitFilterBar = document.getElementById("unitFilterBar");
  const houseGrid = document.getElementById("houseGrid");
  const houseDetail = document.getElementById("houseDetail");
  const tstructPanel = document.getElementById("tstructPanel");
  const tstructFrame = document.getElementById("tstructFrame");
  const closeTstruct = document.getElementById("closeTstruct");

  function debugParent(...args) {
    if (DEBUG_PARENT && window.console) console.debug("[Parent Operations]", ...args);
  }

  function warnParent(message, error) {
    if (window.console) console.warn(`[Parent Operations] ${message}`, error || "");
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function currentDateLabel() {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }

  function actionText(actionKey) {
    return TSTRUCTS[actionKey] ? TSTRUCTS[actionKey].title : actionKey;
  }

  function svgIcon(path) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
  }

  function toNumber(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function normalizeGlobalVarKey(value) {
    return String(value || "").replace(/[\s_]/g, "").toLowerCase();
  }

  function extractAxpertGlobalVarValue(source, targetKeys, visited) {
    if (source === undefined || source === null) return "";

    const normalizedTargets = targetKeys.map(normalizeGlobalVarKey).filter(Boolean);
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
      if (normalizedTargets.includes(normalizeGlobalVarKey(key))) {
        const value = source[key];
        if (value !== undefined && value !== null && value !== "") return String(value);
      }
    }

    const keyLabel = source.key || source.name || source.variable || source.var || source.field;
    const valueLabel = source.value !== undefined ? source.value : source.val !== undefined ? source.val : source.text;
    if (keyLabel && normalizedTargets.includes(normalizeGlobalVarKey(keyLabel))) {
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
      debugParent("parent window inaccessible", error);
    }

    try {
      if (window.top && !windows.includes(window.top)) windows.push(window.top);
    } catch (error) {
      debugParent("top window inaccessible", error);
    }

    try {
      if (window.opener && !windows.includes(window.opener)) windows.push(window.opener);
    } catch (error) {
      debugParent("opener window inaccessible", error);
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
        debugParent("global var lookup skipped inaccessible window", error);
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
    const normalizeKey = (value) => String(value || "").replace(/[\s_]/g, "").toLowerCase();
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

  function getMatchingFieldValue(object, fieldNames) {
    if (!object || typeof object !== "object" || Array.isArray(object)) return "";

    const normalizedFields = fieldNames.map(normalizeGlobalVarKey).filter(Boolean);
    const sourceKey = Object.keys(object).find((key) => normalizedFields.includes(normalizeGlobalVarKey(key)));
    return sourceKey === undefined ? "" : object[sourceKey];
  }

  function getOptionalNumber(object, fieldNames) {
    const value = getMatchingFieldValue(object, fieldNames);
    return value === "" || value === undefined || value === null ? null : toNumber(value);
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
      debugParent("GetDataFromAxList", { dataSourceName, sqlParams: request.sqlParams, refreshCache: request.refreshCache });

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

      debugParent("AxGetSqlData", { dataSourceName, parameters });

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
      debugParent("GetIViewData", { dataSourceName, paramString, forceReload: Boolean(options && options.forceReload) });

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
      debugParent("datasource rows loaded", { dataSourceName, count: rows.length });
      return rows;
    } catch (error) {
      warnParent(`Unable to load datasource ${dataSourceName}.`, error);
      return [];
    }
  }

  async function loadUnitOptions(options) {
    const context = getGlobalContext();
    const parameters = {};
    if (context.company) parameters.company = context.company;
    if (context.branch) parameters.branch = context.branch;

    const rows = await loadRows(DATA_SOURCES.units.name, parameters, { forceReload: options && options.forceReload });
    return rows
      .map((row) => {
        const value = String(row.locationcode || row.value || row.code || "").trim();
        const label = String(row.locationname || row.label || row.name || value).trim();
        return value || label ? { value: value || label, label: label || value } : null;
      })
      .filter(Boolean);
  }

  function mapBatchRow(row, unit) {
    const femaleBirds = toNumber(row.femalebirds);
    const maleBirds = toNumber(row.malebirds);
    const birdsHoused = toNumber(row.birdshoused, femaleBirds + maleBirds);
    const maleDeadBirdsValue = getOptionalNumber(row, ["maledeadbirds", "male_dead_birds", "maledead", "male_dead", "deadmales", "dead_male"]);
    const femaleDeadBirdsValue = getOptionalNumber(row, ["femaledeadbirds", "female_dead_birds", "femaledead", "female_dead", "deadfemales", "dead_female"]);
    const maleDeadBirds = maleDeadBirdsValue === null ? 0 : maleDeadBirdsValue;
    const femaleDeadBirds = femaleDeadBirdsValue === null ? 0 : femaleDeadBirdsValue;
    const maleLiveBirds = maleBirds;
    const femaleLiveBirds = femaleBirds;
    const hasTotalBirds = row.totalbirds !== undefined && row.totalbirds !== null && row.totalbirds !== "";
    const totalBirds = toNumber(row.totalbirds, birdsHoused);
    const batchId = String(row.batchid || "").trim();
    const code = String(row.code || row.id || "").trim();
    const unitValue = String(row.unit || unit && unit.value || "").trim();
    const unitName = String(row.unitname || unit && unit.label || unitValue).trim();
    const status = String(row.status || (String(row.batchactive || "").toUpperCase() === "F" ? "Inactive" : "Active")).trim();

    const mappedHouse = {
      unit: unitValue,
      unitName,
      id: String(row.id || code || batchId).trim(),
      code,
      name: String(row.housename || row.name || code || row.id || "").trim(),
      stage: String(row.stage || "").trim(),
      itemType: String(row.itemtype || "").trim(),
      groupName: String(row.groupname || "").trim(),
      status,
      batchActive: String(row.batchactive || "").trim(),
      batchId,
      batchCode: String(row.batchcode || batchId).trim(),
      flockAge: String(row.flockage || (row.flockagedays ? `${row.flockagedays} days` : "")).trim(),
      femaleBirds,
      maleBirds,
      maleLiveBirds,
      femaleLiveBirds,
      maleDeadBirds,
      femaleDeadBirds,
      birdsHoused,
      liveHens: hasTotalBirds ? totalBirds : toNumber(row.livehens, femaleBirds),
      deadBirds: toNumber(row.deadbirds),
      totalBirds,
      mortalityRate: toNumber(row.mortalityrate),
      totalFeedGivenKg: toNumber(row.totalfeedgivenkg),
      feedPerBird: toNumber(row.feedperbird),
      placementDate: row.placementdate || row.birthdate || "",
      harvestDate: row.harvestdate || "",
      houseCost: toNumber(row.housecost),
      totalEggsProduced: toNumber(row.totaleggsproduced),
      sampledBirds: toNumber(row.sampledbirds),
      birdsWithinTargetWeight: toNumber(row.birdswithintargetweight),
      weightKg: toNumber(row.weightkg),
      healthTasks: toNumber(row.healthtasks),
      feedIndent: String(row.feedindent || "").trim(),
      targetParams: String(row.targetParams || row.targetparams || row.target_params || "").trim(),
      readyToHarvest: isCompletedFlag(getMatchingFieldValue(row, ["readytoharvest", "readyToHarvest", "harvestready"])),
      placementDone: isCompletedFlag(row.placementdone),
      dayEnd: isCompletedFlag(row.dayend),
    };

    rememberTargetParamsForHouse(mappedHouse, mappedHouse.targetParams);
    return mappedHouse;
  }

  function isCompletedFlag(value) {
    return ["T", "TRUE", "Y", "YES", "1", "DONE", "COMPLETED", "COMPLETE"].includes(String(value || "").trim().toUpperCase());
  }

  function isActiveHouse(house) {
    if (!house || !house.id) return false;
    if (String(house.batchActive || "").toUpperCase() === "F") return false;
    return String(house.status || "Active").toLowerCase() === "active";
  }

  async function loadHouses(options) {
    const selected = options && options.unit && options.unit !== "all" ? options.unit : "";
    let units = options && Array.isArray(options.unitOptions) ? options.unitOptions : await loadUnitOptions({ forceReload: options && options.forceReload });

    if (selected) {
      units = units.filter((unit) => unit.value === selected);
      if (!units.length) units = [{ value: selected, label: selected }];
    }

    const mappedHouses = [];
    for (const unit of units) {
      const rows = await loadRows(DATA_SOURCES.parentBatchDetails.name, { unit: unit.value, house: "" }, { forceReload: options && options.forceReload });
      rows.forEach((row) => mappedHouses.push(mapBatchRow(row, unit)));
    }

    const byKey = new Map();
    mappedHouses.filter(isActiveHouse).forEach((house) => {
      const key = `${house.unit}|${house.id}|${house.batchId}`;
      byKey.set(key, house);
    });

    return Array.from(byKey.values()).sort((a, b) => {
      return `${a.unitName} ${a.name} ${a.batchId}`.localeCompare(`${b.unitName} ${b.name} ${b.batchId}`);
    });
  }

  async function loadTargetParamsForHouse(house) {
    if (!house) return "";

    const cachedParams = getCachedTargetParams(house);
    if (cachedParams) return cachedParams;

    const context = getGlobalContext();
    const parameters = {};
    if (context.branch) parameters.branch = context.branch;
    if (house.unit) parameters.unit = house.unit;
    if (house.code || house.id) parameters.sublocation = house.code || house.id;
    if (house.name) parameters.housename = house.name;

    const rows = await loadRows(DATA_SOURCES.targetParams.name, parameters);
    return rememberTargetParamsForHouse(house, extractTargetParams(rows));
  }

  async function loadUnitsFromDataSource() {
    unitOptions = await loadUnitOptions();
    updateUnitFilters();
  }

  async function loadScreenData(options) {
    if (screenDataLoadPromise) return screenDataLoadPromise;
    const forceReload = Boolean(options && options.forceReload);
    const shouldReloadUnits = options && options.reloadUnits || !unitOptions.length;

    screenDataLoadPromise = (async () => {
      if (shouldReloadUnits) unitOptions = await loadUnitOptions({ forceReload });
      const unit = selectedUnit === "all" ? "" : selectedUnit;
      const loadedHouses = await loadHouses({ unit, unitOptions, forceReload });

      houses.splice(0, houses.length, ...loadedHouses);
      if (selectedHouseId && !houses.some((house) => house.id === selectedHouseId)) selectedHouseId = "";

      if (selectedHouseId) renderHouseDetail(selectedHouseId);
      else {
        renderHouseList();
        renderHouses(currentSearchValue);
      }
    })();

    try {
      return await screenDataLoadPromise;
    } finally {
      screenDataLoadPromise = null;
    }
  }

  function getHouseUnitLabel(house) {
    if (house && house.unitName) return house.unitName;
    const option = unitOptions.find((unit) => unit.value === (house && house.unit));
    return option ? option.label : house && house.unit || "";
  }

  function getUnitLabelByValue(value) {
    if (!value || value === "all") return "";
    const option = unitOptions.find((unit) => unit.value === value);
    return option ? option.label : value;
  }

  function houseMatchesSelectedUnit(house) {
    return selectedUnit === "all" || house.unit === selectedUnit;
  }

  function renderSearchControl() {
    return `
      <div class="search-box module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
        <input id="houseSearch" type="search" value="${escapeHtml(currentSearchValue)}" placeholder="Search parent houses..." aria-label="Search parent houses" />
      </div>
    `;
  }

  function renderNavTools() {
    return `
      <div class="nav-tools">
        <button class="icon-button" type="button" aria-label="Refresh" id="refreshBtn">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" /></svg>
        </button>
        <button class="date-button" type="button">${currentDateLabel()}</button>
      </div>
    `;
  }

  function renderListActions() {
    return `
      <div class="command-actions">
        <button class="command-button" type="button" data-tstruct-action="houseCreation">
          ${svgIcon(ICONS.houseCreation)}
          <span>Create House</span>
        </button>
        <button class="command-button primary" type="button" data-tstruct-action="batchCreation">
          ${svgIcon(ICONS.batchCreation)}
          <span>Batch Creation</span>
        </button>
      </div>
    `;
  }

  function renderListNavbar() {
    moduleCommand.innerHTML = `
      <div class="module-copy">
        <h2>${CONFIG.title}</h2>
        <p><span id="activeHouseCount">${formatNumber(houses.length)}</span> active houses / <span id="birdTotal">${formatNumber(houses.reduce((sum, house) => sum + house.birdsHoused, 0))}</span> birds housed</p>
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
          ${escapeHtml(CONFIG.title)}
        </button>
        <h2>${escapeHtml(house.name)} <span class="house-code-pill">${escapeHtml(house.code)}</span></h2>
        <p>${escapeHtml(house.batchId || "-")} / ${escapeHtml(house.stage || "-")}</p>
        <!-- <p>${escapeHtml(house.batchId || "-")} / ${escapeHtml(house.stage || "-")} / Feed indent: ${escapeHtml(house.feedIndent || "-")}</p> -->
      </div>
      ${renderSearchControl()}
      <div class="command-actions">
        ${renderDayEndButton(house)}
        ${renderEntryMenu(house)}
      </div>
      ${renderNavTools()}
    `;
  }

  function metric(label, value) {
    return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
  }

  function birdCountLabel(house) {
    return `
      <span class="bird-count-split">
        <span>F - ${formatNumber(house.femaleBirds)}</span>
        <span>M - ${formatNumber(house.maleBirds)}</span>
      </span>
    `;
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

  function getHouseActions(actions, house) {
    return actions.filter((action) => {
      if (isGrowerStage(house) && action === "eggCollection") return false;
      if (hasPlacementDone(house) && action === "placement") return false;
      return true;
    });
  }

  function renderHouseCard(house) {
    const transferStage = isReadyToHarvest(house);
    const stageClass = transferStage ? " live-transfer-card is-ready-to-transfer" : " ready-harvest-card";
    return `
      <article class="house-card${stageClass}" data-house-id="${escapeHtml(house.id)}" role="button" tabindex="0">
        <div class="house-card-header">
          <div class="house-card-copy">
            <h3>
              <span>${escapeHtml(house.name)}</span>
              <span class="house-code-pill">${escapeHtml(house.code)}</span>
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
                ${getHouseActions(CARD_ACTIONS, house).map((action) => `<button type="button" data-tstruct-action="${action}" data-house-id="${escapeHtml(house.id)}">${escapeHtml(actionText(action))}</button>`).join("")}
              </div>
            </details>
          </div>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", escapeHtml(house.batchId || "-"))}
          ${metric("Bird count", birdCountLabel(house))}
          ${metric("Placement Date", escapeHtml(formatDate(house.placementDate)))}
          ${metric("Expected Production Date", escapeHtml(formatDate(house.harvestDate)))}
          ${metric("Feed / Bird", `${formatNumber(house.feedPerBird, 3)} kg`)}
          ${metric("Mortality Rate", `${formatNumber(house.mortalityRate, 2)}%`)}
        </div>
        ${renderTransferAction(house)}
      </article>
    `;
  }

  function renderTransferAction(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!hasPlacementDone(house)) return "";
    if (isReadyToHarvest(house)) {
      return `
        <button class="command-button primary live-bird-transfer-button" type="button" data-tstruct-action="liveBirdTransferRequest" data-house-id="${escapeHtml(house.id)}" aria-label="Live Bird Transfer Request for ${escapeHtml(batchId || house.name)}">
          ${svgIcon("M5 12h14M13 6l6 6-6 6M5 6v12")}
          <span>Live Bird Transfer Request</span>
        </button>
      `;
    }

    return `
      <button class="command-button primary ready-to-transfer-button" type="button" data-ready-to-transfer data-house-id="${escapeHtml(house.id)}" ${batchId ? "" : "disabled"} aria-label="Ready To Transfer Update for ${escapeHtml(batchId || house.name)}">
        ${svgIcon("M12 5v14M5 12h14")}
        <span>Ready To Transfer Update</span>
      </button>
    `;
  }

  function renderEntryMenu(house) {
    return `
      <details class="command-menu entry-menu">
        <summary class="command-button">
          ${svgIcon("M8 4h8l1 3H7l1-3zM6 7h12v13H6z")}
          <span>Entry</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div class="entry-grid-popover align-right">
          ${getHouseActions(DETAIL_ACTIONS, house).map((action) => `
            <button class="entry-grid-option" type="button" data-tstruct-action="${action}" data-house-id="${escapeHtml(house.id)}">
              <span class="entry-grid-icon">${svgIcon(ICONS[action] || ICONS.batchCreation)}</span>
              <span>${escapeHtml(actionText(action))}</span>
            </button>
          `).join("")}
          ${DETAIL_IVIEW_ACTIONS.map((action) => `
            <button class="entry-grid-option" type="button" data-iview-action="${action}" data-house-id="${escapeHtml(house.id)}">
              <span class="entry-grid-icon">${svgIcon(ICONS[action] || ICONS.batchCreation)}</span>
              <span>${escapeHtml(IVIEWS[action] ? IVIEWS[action].title : action)}</span>
            </button>
          `).join("")}
        </div>
      </details>
    `;
  }

  function renderDayEndButton(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    const completed = isDayEnded(house);
    const label = completed ? "Day End Completed" : "Day End";
    const icon = completed
      ? "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5V10zm7 4v2"
      : "M12 3v9M8 8l4 4 4-4M5 16v4h14v-4";

    return `
      <button class="command-button primary day-end-button ${completed ? "is-completed" : ""}" type="button" data-day-end data-house-id="${escapeHtml(house.id)}" ${batchId && !completed ? "" : "disabled"} aria-label="${label}">
        ${svgIcon(icon)}
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

  function renderReadyToTransferConfirmation(house) {
    if (!readyToTransferConfirmation || !house || readyToTransferConfirmation.houseId !== house.id) return "";

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
      ? houses.find((item) => item.id === readyToTransferConfirmation.houseId)
      : null;
  }

  function openReadyToTransferConfirmation(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!house || !batchId || isReadyToHarvest(house)) return;
    readyToTransferConfirmation = { houseId: house.id, batchId, processing: false, error: "" };
    if (selectedHouseId === house.id) renderHouseDetail(house.id);
    else renderHouses(currentSearchValue);
  }

  function closeReadyToTransferConfirmation(house) {
    readyToTransferConfirmation = null;
    if (house && selectedHouseId === house.id) renderHouseDetail(house.id);
    else renderHouses(currentSearchValue);
  }

  function openDayEndConfirmation(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!house || !batchId || isDayEnded(house)) return;
    dayEndConfirmation = { houseId: house.id, batchId, processing: false, error: "" };
    renderHouseDetail(house.id);
  }

  function closeDayEndConfirmation(house) {
    dayEndConfirmation = null;
    if (house) renderHouseDetail(house.id);
  }

  async function completeDayEnd(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!batchId || !dayEndConfirmation || dayEndConfirmation.houseId !== house.id || dayEndConfirmation.processing) return;

    dayEndConfirmation = Object.assign({}, dayEndConfirmation, { processing: true, error: "" });
    renderHouseDetail(house.id);

    try {
      await window.ParentAPI.executeDayEnd({ batchid: batchId });
      house.dayEnd = true;
      dayEndConfirmation = null;
      renderHouseDetail(house.id);
    } catch (error) {
      dayEndConfirmation = Object.assign({}, dayEndConfirmation, {
        processing: false,
        error: error && error.message ? error.message : "Day End could not be completed.",
      });
      renderHouseDetail(house.id);
    }
  }

  async function completeReadyToTransfer(house) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!house || !batchId || isReadyToHarvest(house) || !readyToTransferConfirmation || readyToTransferConfirmation.houseId !== house.id || readyToTransferConfirmation.processing) return;

    readyToTransferConfirmation = Object.assign({}, readyToTransferConfirmation, { processing: true, error: "" });
    if (selectedHouseId === house.id) renderHouseDetail(house.id);
    else renderHouses(currentSearchValue);

    try {
      await window.ParentAPI.executeReadyToTransferUpdate({ batchid: batchId });
      house.readyToHarvest = true;
      readyToTransferConfirmation = null;
      if (selectedHouseId === house.id) {
        renderHouseDetail(house.id);
      } else {
        renderHouses(currentSearchValue);
      }
    } catch (error) {
      readyToTransferConfirmation = Object.assign({}, readyToTransferConfirmation, {
        processing: false,
        error: error && error.message ? error.message : "Ready To Transfer Update could not be completed.",
      });
      if (selectedHouseId === house.id) renderHouseDetail(house.id);
      else renderHouses(currentSearchValue);
      warnParent("Ready To Transfer Update could not be completed.", error);
    }
  }

  function contextItem(label, value, iconPath) {
    return `
      <div class="context-item">
        <span class="context-icon">${svgIcon(iconPath)}</span>
        <div><span>${escapeHtml(label)}</span><strong>${value}</strong></div>
      </div>
    `;
  }

  function chartCard(key, title, axis) {
    return `
      <article class="chart-card" data-chart-key="${escapeHtml(key)}">
        <div class="chart-card-header">
          <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(axis)}</p></div>
        </div>
        <div class="chart-scroll">
          <canvas class="chart-canvas" data-chart="${escapeHtml(key)}"></canvas>
        </div>
      </article>
    `;
  }

  function renderChartPeriodInput(periodKey, value, options) {
    const minValue = options[0] ? options[0].key : "";
    const maxValue = options[options.length - 1] ? options[options.length - 1].key : "";

    if (selectedChartRange === "month") {
      return '<input type="month" data-chart-period="' + escapeHtml(periodKey) + '" value="' + escapeHtml(value) + '" min="' + escapeHtml(minValue) + '" max="' + escapeHtml(maxValue) + '">';
    }

    return '<input type="number" data-chart-period="' + escapeHtml(periodKey) + '" value="' + escapeHtml(value) + '" min="' + escapeHtml(minValue) + '" max="' + escapeHtml(maxValue) + '" step="1" inputmode="numeric" pattern="[0-9]*">';
  }

  function renderChartPeriodControls() {
    const options = selectedChartRange === "month" ? MONTH_OPTIONS : YEAR_OPTIONS;
    const fromValue = selectedChartRange === "month" ? selectedMonthFrom : selectedYearFrom;
    const toValue = selectedChartRange === "month" ? selectedMonthTo : selectedYearTo;
    const label = selectedChartRange === "month" ? "Month range" : "Year range";
    const startLabel = selectedChartRange === "month" ? "Start month" : "Start year";
    const endLabel = selectedChartRange === "month" ? "End month" : "End year";

    return '<div class="chart-period-controls" aria-label="' + escapeHtml(label) + '">' +
      '<span class="control-group-label">Period</span>' +
      '<label class="period-field">' +
        '<span>' + startLabel + '</span>' +
        renderChartPeriodInput("from", fromValue, options) +
      '</label>' +
      '<span class="period-separator">to</span>' +
      '<label class="period-field">' +
        '<span>' + endLabel + '</span>' +
        renderChartPeriodInput("to", toValue, options) +
      '</label>' +
    '</div>';
  }

  function renderChartToolbar() {
    var rangeButtons = Object.entries(CHART_RANGES).map(function (entry) {
      var range = entry[0];
      var item = entry[1];
      var activeClass = selectedChartRange === range ? " is-active" : "";
      return '<button class="chart-range-button' + activeClass + '" type="button" data-chart-range="' + range + '">' + item.label + '</button>';
    }).join("");

    return '<section class="chart-report-toolbar">' +
      '<div>' +
        '<h2>Chart Statistics</h2>' +
        '<p>Review house performance by selected month or year range.</p>' +
      '</div>' +
      '<div class="chart-toolbar-controls">' +
        '<div class="period-mode-group">' +
          '<span class="control-group-label">View</span>' +
          '<div class="chart-range-tabs" aria-label="Chart range">' +
            rangeButtons +
          '</div>' +
        '</div>' +
        renderChartPeriodControls() +
      '</div>' +
    '</section>';
  }

  function renderChartReserveSection() {
    return `
      ${renderChartToolbar()}
      <section class="chart-grid">
        ${chartCard("birds", "Birds Housed", "Count (Nos)")}
        ${chartCard("mortality", "Mortality", "Count (Nos)")}
        ${chartCard("feedKg", "Feed Consumption", "Feed Consumption (kg)")}
        ${chartCard("bodyWeight", "Body Weight", "Total weight")}
      </section>
    `;
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
      .map((row) => {
        const rawDate = getMatchingFieldValue(row, ["docdate", "doc_date", "date"]);
        const date = parseChartDate(rawDate);
        const label = getMatchingFieldValue(row, ["periodLabel", "period_label", "label"]) || formatChartDateLabel(date, rawDate);

        return {
          batchId: getMatchingFieldValue(row, ["batchid", "batch_id", "batchId", "batch"]),
          docdate: rawDate,
          dateValue: date ? date.getTime() : 0,
          month: date ? chartMonthKey(date) : "",
          year: date ? String(date.getFullYear()) : "",
          label,
          birds: toNumber(getMatchingFieldValue(row, ["birds", "livebirds", "live_birds"])),
          mortality: toNumber(getMatchingFieldValue(row, ["mortality", "deadbirds", "dead_birds"])),
          feedKg: toNumber(getMatchingFieldValue(row, ["feedkg", "feedKg", "feed_kg", "feedperbird", "feed_per_bird"])),
          bodyWeight: toNumber(getMatchingFieldValue(row, ["bodyweight", "bodyWeight", "body_weight", "totalweight", "total_weight"])),
        };
      })
      .filter((record) => record.dateValue || record.label)
      .sort((a, b) => (a.dateValue || 0) - (b.dateValue || 0));

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
    const batchId = house.batchId || house.batchCode || "";
    if (!batchId) return mapChartRows([]);
    const parameters = { batchid: batchId, batch_id: batchId };
    const rows = await loadRows(DATA_SOURCES.charts.name, parameters);
    return mapChartRows(rows);
  }

  function mapScheduleRows(rows) {
    return rows.map((row, index) => {
      const status = getMatchingFieldValue(row, ["completed", "status", "schedule_status"]) || "Pending";
      return {
        id: getMatchingFieldValue(row, ["id", "slno", "serial"]) || index + 1,
        age: getMatchingFieldValue(row, ["age", "bage", "batch_age"]) || "",
        date: getMatchingFieldValue(row, ["scheduledate", "scheduleDate", "schedule_date", "sch_date", "date", "docdate"]) || "",
        name: getMatchingFieldValue(row, ["name", "bname", "schedule", "schedule_name"]) || "",
        dose: getMatchingFieldValue(row, ["dose"]) || "",
        method: getMatchingFieldValue(row, ["method"]) || "",
        description: getMatchingFieldValue(row, ["description"]) || "",
        employeeName: getMatchingFieldValue(row, ["employee_name", "employeeName", "employee"]) || "",
        batchId: getMatchingFieldValue(row, ["batchid", "batch_id", "batch"]) || "",
        status,
      };
    });
  }

  async function loadSchedules(house) {
    const batchId = house && (house.batchId || house.batchCode) || "";
    if (!batchId) return [];
    const parameters = { batchid: batchId, batch_id: batchId };
    return mapScheduleRows(await loadRows(DATA_SOURCES.schedules.name, parameters, { forceReload: true }));
  }

  function mapFarmerActivityRows(rows) {
    return rows.map((row, index) => ({
      id: getMatchingFieldValue(row, ["id", "slno", "serial"]) || index + 1,
      batchId: getMatchingFieldValue(row, ["batchid", "batch_id", "batch"]) || "",
      task: getMatchingFieldValue(row, ["task"]) || "",
      instructions: getMatchingFieldValue(row, ["instructions", "instruction"]) || "",
      finding: getMatchingFieldValue(row, ["finding", "findings"]) || "",
      status: getMatchingFieldValue(row, ["status"]) || "Pending",
      priority: getMatchingFieldValue(row, ["priority"]) || "",
      remark: getMatchingFieldValue(row, ["remark", "remarks"]) || "",
    }));
  }

  async function loadFarmerActivities(house) {
    const batchId = house && (house.batchId || house.batchCode) || "";
    if (!batchId) return [];
    const parameters = { batchid: batchId, batch_id: batchId };
    return mapFarmerActivityRows(await loadRows(DATA_SOURCES.activities.name, parameters, { forceReload: true }));
  }

  async function executeDayEnd(parameters) {
    const batchId = String(parameters && parameters.batchid || "").trim();
    if (!batchId) throw new Error("A batch ID is required to run Day End.");
    return callAxpertDataSourceFunction(DATA_SOURCES.dayEnd.name, { batchid: batchId });
  }

  async function executeReadyToTransferUpdate(parameters) {
    const batchId = String(parameters && parameters.batchid || "").trim();
    if (!batchId) throw new Error("A batch ID is required to mark the batch ready to transfer.");
    return callAxpertDataSourceFunction(DATA_SOURCES.readyToHarvestUpdate.name, { batchid: batchId });
  }

  function hasChartRows(metrics) {
    return metrics && (
      Array.isArray(metrics.records) && metrics.records.length > 0 ||
      Array.isArray(metrics.labels) && metrics.labels.length > 0
    );
  }

  function shouldDrawChartMarker(index, total) {
    return total <= 7 || index === 0 || index === total - 1 || index % 2 === 0;
  }

  function drawLineChart(canvas, labels, values, options) {
    if (!values || !values.length) return;

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

  function formatChartLabel(dateValue) {
    if (!dateValue) return "";
    if (/^[A-Za-z]{3}\s+\d{4}$/.test(String(dateValue))) return String(dateValue);
    if (/^\d{4}$/.test(String(dateValue))) return String(dateValue);
    if (/^\d{4}-\d{2}$/.test(String(dateValue))) {
      const parts = String(dateValue).split("-");
      return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" })
        .format(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);
  }

  function getSelectedChartPeriodItems() {
    const fromKey = selectedChartRange === "month" ? selectedMonthFrom : selectedYearFrom;
    const toKey = selectedChartRange === "month" ? selectedMonthTo : selectedYearTo;
    const options = selectedChartRange === "month" ? MONTH_OPTIONS : YEAR_OPTIONS;
    const fromIndex = Math.max(0, options.findIndex((item) => item.key === fromKey));
    const toIndex = Math.max(0, options.findIndex((item) => item.key === toKey));
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    return options.slice(start, end + 1);
  }

  function aggregateChartRecords(records, key, periodItems) {
    const rangeType = selectedChartRange === "month" ? "month" : "year";
    const grouped = records.reduce((result, record) => {
      const periodKey = rangeType === "month" ? record.month : record.year;
      if (!periodKey) return result;
      result[periodKey] = result[periodKey] || [];
      result[periodKey].push(record);
      return result;
    }, {});

    return {
      labels: periodItems.map((item) => item.label),
      values: periodItems.map((item) => {
        const periodRows = (grouped[item.key] || []).slice().sort((a, b) => {
          return (a.dateValue || 0) - (b.dateValue || 0);
        });
        if (!periodRows.length) return 0;

        if (key === "birds") {
          return periodRows[periodRows.length - 1].birds || 0;
        }

        if (key === "bodyWeight") {
          const readings = periodRows.map((row) => row.bodyWeight || 0).filter((value) => value > 0);
          if (!readings.length) return 0;
          return Math.round(readings.reduce((sum, value) => sum + value, 0) / readings.length);
        }

        const total = periodRows.reduce((sum, row) => sum + (row[key] || 0), 0);
        return key === "feedKg" ? Number(total.toFixed(2)) : Math.round(total);
      }),
    };
  }

  function getChartSeries(house, key) {
    const metrics = house.metrics || {};
    const baseValues = metrics[key] || [];
    const periodItems = getSelectedChartPeriodItems();

    if (metrics.fromDataSource && Array.isArray(metrics.records) && metrics.records.length) {
      return aggregateChartRecords(metrics.records, key, periodItems);
    }

    if (metrics.fromDataSource && metrics.labels && baseValues.length === metrics.labels.length) {
      const filteredLabels = [];
      const filteredValues = [];
      const rangeType = selectedChartRange === "month" ? "month" : "year";

      metrics.labels.forEach(function (label, index) {
        const date = new Date(label);
        if (Number.isNaN(date.getTime())) {
          filteredLabels.push(label);
          filteredValues.push(baseValues[index]);
          return;
        }
        let matchesRange = false;
        if (rangeType === "month") {
          const labelKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          matchesRange = labelKey >= fromKey && labelKey <= toKey;
        } else {
          const labelYear = String(date.getFullYear());
          matchesRange = labelYear >= fromKey && labelYear <= toKey;
        }
        if (matchesRange) {
          filteredLabels.push(label);
          filteredValues.push(baseValues[index]);
        }
      });

      return { labels: filteredLabels, values: filteredValues };
    }

    return {
      labels: periodItems.map((item) => item.label),
      values: periodItems.map((_, index) => baseValues[index] || 0),
    };
  }

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
      const formattedLabels = series.labels.map(formatChartLabel);
      if (!series.values.length) return;
      canvas.style.minWidth = `${Math.max(660, formattedLabels.length * 76)}px`;
      drawLineChart(canvas, formattedLabels, series.values, chartOptions[key]);
    });
  }

  function drawReservedChartPlaceholders() {
    const labels = {
      birds: "Birds Housed",
      mortality: "Mortality",
      feedKg: "Feed Consumption",
      bodyWeight: "Body Weight",
    };

    houseDetail.querySelectorAll("[data-chart]").forEach((canvas) => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(rect.width, 320);
      const height = Math.max(rect.height, 220);
      const ratio = window.devicePixelRatio || 1;
      const key = canvas.dataset.chart || "";
      const ctx = canvas.getContext && canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const padding = { top: 24, right: 20, bottom: 34, left: 46 };
      ctx.strokeStyle = "rgba(216, 226, 238, 0.88)";
      ctx.lineWidth = 1;
      for (let index = 0; index <= 4; index += 1) {
        const y = padding.top + ((height - padding.top - padding.bottom) / 4) * index;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      ctx.fillStyle = "#536982";
      ctx.textAlign = "center";
      ctx.font = "600 13px Inter, system-ui, sans-serif";
      ctx.fillText(labels[key] || "Chart", width / 2, height / 2 - 8);
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillText("No chart records available", width / 2, height / 2 + 14);
    });
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

  function renderScheduleStatusEditButton(rowIndex, rowId, status) {
    if (normalizeActivityStatus(status) !== "Pending") return "";
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
                <td>${renderScheduleStatusEditButton(index, rowId, status)}</td>
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
            <p>Medication, monitoring, and review actions attached to this parent batch.</p>
          </div>
          <div class="activity-header-actions">
            ${renderScheduleStatusFilter()}
            <button class="command-button" type="button" data-tstruct-action="scheduleMonitoring" data-house-id="${escapeHtml(house.id)}">Add Schedule</button>
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
            <p>Tasks, findings, and remarks attached to this parent batch.</p>
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
            <p>Track schedules and farmer activity for this parent batch.</p>
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
    const house = houses.find((item) => item.id === houseId);
    if (!house) return;

    const previousHouseId = selectedHouseId;
    selectedHouseId = house.id;
    if (previousHouseId && previousHouseId !== house.id) {
      selectedActivityTab = "schedule";
      selectedScheduleStatusFilter = "all";
      closeScheduleStatusEditor();
    }
    renderDetailNavbar(house);
    moduleCommand.hidden = false;
    unitFilterBar.hidden = true;
    houseGrid.hidden = true;
    houseDetail.hidden = false;
    house.schedulesLoading = Boolean(house.batchId || house.batchCode);
    house.farmerActivitiesLoading = Boolean(house.batchId || house.batchCode);

    houseDetail.innerHTML = `
      <section class="context-strip">
        ${contextItem("Batch birds", formatNumber(house.birdsHoused), "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Male live birds", formatNumber(house.maleLiveBirds), "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Female live birds", formatNumber(house.femaleLiveBirds), "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Male dead birds", formatNumber(house.maleDeadBirds), "M12 3 3 20h18L12 3zM12 9v5M12 17h.01")}
        ${contextItem("Female dead birds", formatNumber(house.femaleDeadBirds), "M12 3 3 20h18L12 3zM12 9v5M12 17h.01")}
      </section>

      ${renderChartReserveSection()}
      ${renderActivitySection(house)}
      ${renderDayEndConfirmation(house)}
      ${renderReadyToTransferConfirmation(house)}
    `;

    if (!house.metrics) {
      house.metrics = { labels: [], birds: [], mortality: [], feedKg: [], bodyWeight: [] };
    }

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(function () { drawHouseCharts(house); });
    } else {
      window.setTimeout(function () { drawHouseCharts(house); }, 0);
    }

    loadCharts(house).then(function (chartMetrics) {
      if (!hasChartRows(chartMetrics)) return;
      house.metrics = chartMetrics;
      drawHouseCharts(house);
    }).catch(function (error) {
      warnParent("Failed to load chart data.", error);
    });

    loadSchedules(house).then(function (schedules) {
      if (selectedHouseId !== house.id) return;
      house.schedules = schedules;
      house.schedulesLoading = false;
      refreshScheduleActivityPanel(house);
    }).catch(function (error) {
      house.schedulesLoading = false;
      refreshScheduleActivityPanel(house);
      warnParent("Failed to load schedule data.", error);
    });

    loadFarmerActivities(house).then(function (activities) {
      if (selectedHouseId !== house.id) return;
      house.farmerActivities = activities;
      house.farmerActivitiesLoading = false;
      refreshFarmerActivityPanel(house);
    }).catch(function (error) {
      house.farmerActivitiesLoading = false;
      refreshFarmerActivityPanel(house);
      warnParent("Failed to load farmer activity data.", error);
    });
  }

  function renderHouseList() {
    selectedHouseId = "";
    selectedActivityTab = "schedule";
    selectedScheduleStatusFilter = "all";
    closeScheduleStatusEditor();
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

    const unitCounts = {};
    houses.forEach((house) => {
      if (house.unit) unitCounts[house.unit] = (unitCounts[house.unit] || 0) + 1;
    });

    if (selectedUnit !== "all" && !unitOptions.some((unit) => unit.value === selectedUnit)) selectedUnit = "all";

    unitSelect.innerHTML = `<option value="all">All Units (${houses.length})</option>` +
      unitOptions.map((unit) => {
        const count = unitCounts[unit.value] || 0;
        return `<option value="${escapeHtml(unit.value)}">${escapeHtml(unit.label)}${count ? ` (${count})` : ""}</option>`;
      }).join("");
    unitSelect.value = selectedUnit;
  }

  function renderHouses(query) {
    const search = String(query || "").trim().toLowerCase();
    const visibleHouses = houses.filter((house) => {
      const haystack = [house.name, house.code, house.stage, house.batchId, house.status, getHouseUnitLabel(house)].join(" ").toLowerCase();
      return houseMatchesSelectedUnit(house) && (!search || haystack.includes(search));
    });

    const activeHouseCount = document.getElementById("activeHouseCount");
    const birdTotal = document.getElementById("birdTotal");
    if (activeHouseCount) activeHouseCount.textContent = formatNumber(houses.length);
    if (birdTotal) birdTotal.textContent = formatNumber(houses.reduce((sum, house) => sum + house.birdsHoused, 0));
    updateUnitFilters();

    if (!visibleHouses.length) {
      houseGrid.innerHTML = `<div class="empty-state">${escapeHtml(CONFIG.emptyLabel)}</div>`;
      return;
    }

    if (selectedUnit !== "all") {
      houseGrid.innerHTML = visibleHouses.map(renderHouseCard).join("") + renderReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
      return;
    }

    const grouped = visibleHouses.reduce((result, house) => {
      const label = getHouseUnitLabel(house) || "Unassigned";
      result[label] = result[label] || [];
      result[label].push(house);
      return result;
    }, {});

    houseGrid.innerHTML = Object.keys(grouped).sort().map((unitLabel) => {
      return `<div class="unit-separator"><h3>${escapeHtml(unitLabel)}</h3><hr/></div>` +
        grouped[unitLabel].map(renderHouseCard).join("");
    }).join("") + renderReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
  }

  function closeOpenMenus(exceptMenu) {
    document.querySelectorAll("details[open]").forEach((menu) => {
      if (menu !== exceptMenu) menu.removeAttribute("open");
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
    const globalContext = getGlobalContext();
    const farmName = house && (house.farmName || house.branchName || house.farm) || globalContext.branch || "";

    return {
      module: CONFIG.key,
      farmName,
      branchName: farmName,
      unitId: house ? house.unit : selectedUnit === "all" ? "" : selectedUnit,
      unitName: house ? getHouseUnitLabel(house) : getUnitLabelByValue(selectedUnit),
      houseId: house ? house.id : "",
      houseCode: house ? house.code : "",
      houseName: house ? house.name : "",
      batchId: house ? house.batchId : "",
      batchCode: house ? house.batchCode || house.batchId : "",
      readyToHarvest: house ? isReadyToHarvest(house) : false,
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

  function splitTstructTargetParams(paramString) {
    return cleanTargetParams(paramString)
      .split(/&(?=[A-Za-z0-9_]+=)/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function normalizeTstructParamKey(part) {
    const key = String(part || "").split("=")[0] || "";
    return normalizeIndexPart(key).replace(/000f1$/, "");
  }

  function appendMissingTstructTargetParams(baseParams, entries) {
    const baseParts = splitTstructTargetParams(baseParams);
    const existingKeys = new Set(baseParts.map(normalizeTstructParamKey).filter(Boolean));
    const generatedParts = entries
      .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "")
      .filter((entry) => !existingKeys.has(normalizeTstructParamKey(entry[0])))
      .map((entry) => `${entry[0]}=${String(entry[1])}`);

    return baseParts.concat(generatedParts).join("&");
  }

  function isMortalityTstruct(context) {
    return context && (context.actionKey === "mortality" || context.transid === "morta");
  }

  function getMortalityTargetParamEntries(context, unitTargetValue, houseTargetValue, batchTargetValue) {
    if (!isMortalityTstruct(context)) return [];

    const farmTargetValue = context.farmName || context.branchName || context.farm || context.branch;
    return [
      ["farm", farmTargetValue],
      ["branch", farmTargetValue],
      ["locationid", context.unitId],
      ["batch", batchTargetValue],
      ["birdcategory", context.birdCategory],
      ["batchunit", unitTargetValue],
      ["batchunit000F1", unitTargetValue],
      ["unit", unitTargetValue],
      ["unitid", context.unitId],
      ["batchhouse", houseTargetValue],
      ["batchhouse000F1", houseTargetValue],
      ["house", context.houseName],
      ["sublocationid", context.houseId],
      ["mortsublocation", houseTargetValue],
      ["mortsublocation000F1", houseTargetValue],
    ];
  }

 function buildTstructTargetParams(transid, context) {
  if (!context) return "";

  console.log("malintha transid", transid);

  const unitTargetValue = context.unitName || context.unitId;
  const houseTargetValue = context.houseName || context.houseCode || context.houseId;
  const batchTargetValue = context.batchCode || context.batchId;

  let entries = [];

  if (transid === "morta") {
    entries = [
      ["batch", batchTargetValue],
    ];
  } else if(transid ==="layer"){
     entries = [
      ["currentbatch", batchTargetValue],
    ];
  }
  else if (transid === "btplc") {
            return batchTargetValue ? `batchid=${String(batchTargetValue)}` : "";
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
    entries =[["itemgroup", "PS CHICKS"],]
  }
  else if (transid==="house"){
    entries =[["category", "PARENT"],]
  }
  else {
    entries = [
      ["module", context.module],
      ["unit", unitTargetValue],
      ["unit000F1", unitTargetValue],
      ["unitid", context.unitId],
      ["unitname", context.unitName],

      ["itemgroup", context.groupname],

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
     return entries
            .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "")
            .map((entry) => `${entry[0]}=${String(entry[1])}`)
            .join("&");

  // const mortalityEntries = getMortalityTargetParamEntries(
  //   context,
  //   unitTargetValue,
  //   houseTargetValue,
  //   batchTargetValue
  // );

  // const targetEntries =
  //   transid === "morta"
  //     ? entries.concat(mortalityEntries)
  //     : entries;

  // const existingTargetParams = cleanTargetParams(
  //   context.targetParams || context.targetparams
  // );

  // if (existingTargetParams) {
  //   return transid === "morta"
  //     ? appendMissingTstructTargetParams(
  //         existingTargetParams,
  //         targetEntries
  //       )
  //     : existingTargetParams;
  // }

  // const cachedTargetParams = getCachedTargetParams(context);

  // if (cachedTargetParams) {
  //   return transid === "morta"
  //     ? appendMissingTstructTargetParams(
  //         cachedTargetParams,
  //         targetEntries
  //       )
  //     : cachedTargetParams;
  // }

  // return targetEntries
  //   .filter(
  //     ([key, value]) =>
  //       value !== undefined &&
  //       value !== null &&
  //       value !== ""
  //   )
  //   .map(
  //     ([key, value]) =>
  //       `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
  //   )
  //   .join("&");
}

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
      debugParent("jQuery change skipped", error);
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
            debugParent("Axpert setter skipped", { setterName, fieldName, error });
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
        debugParent("field onchange skipped", error);
      }

      try {
        dispatchInputEvents(field);
        if (frameWindow && frameWindow.jQuery) {
          frameWindow.jQuery(field).trigger("change").trigger("change.select2");
        }
      } catch (error) {
        debugParent("dependent change skipped", error);
      }

      reloadFns.forEach((fnName) => {
        const fn = frameWindow && frameWindow[fnName];
        if (typeof fn !== "function") return;

        try {
          fn.call(frameWindow, fieldName);
        } catch (error) {
          debugParent("Axpert dependent reload skipped", { fnName, fieldName, error });
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
          debugParent("placement origin clear skipped", error);
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
      warnParent("Unable to access TStruct iframe for context prefill.", error);
      return null;
    }

    if (!frameWindow || !frameDocument || !frameDocument.body) return null;

    const mortalityTstruct = isMortalityTstruct(context);
    let farmApplied = !mortalityTstruct || Boolean(context._farmApplied);
    let unitApplied = Boolean(context._unitApplied);
    let houseApplied = Boolean(context._houseApplied);
    let batchApplied = Boolean(context._batchApplied);

    if (context.transid === "btplc") {
      context._unitApplied = true;
      context._houseApplied = true;
      unitApplied = true;
      houseApplied = true;
    }

    if (mortalityTstruct && !context._farmApplied) {
      const farmConfig = {
        value: context.farmName || context.branchName || context.farm || context.branch,
        displayText: context.farmName || context.branchName || context.farm || context.branch,
        fieldNames: ["farm", "branch"],
        labels: ["Farm", "Branch"],
        keywords: ["farm", "branch"],
      };

      if (!farmConfig.value || applyFieldContextToTstruct(frameWindow, frameDocument, farmConfig)) {
        context._farmApplied = true;
        farmApplied = true;
        if (farmConfig.value) schedulePrefillReload(context, "farm", frameWindow, frameDocument, farmConfig);
        return { complete: false, farmApplied, unitApplied, houseApplied, batchApplied, stage: "farm" };
      }
    }

    if (!context._unitApplied) {
      const unitConfig = {
        value: context.unitName || context.unitId,
        displayText: context.unitId,
        fieldNames: mortalityTstruct ? ["batchunit", "unit", "unitid", "locationid"] : ["unit", "unitname"],
        labels: mortalityTstruct ? ["Unit", "batchlocation"] : context.transid === "house" ? ["Unit Name", "Unit"] : ["Unit", "Unit Name"],
        keywords: mortalityTstruct ? ["batchunit", "unit", "locationid", "batchlocation"] : ["unit"],
      };

      if (!unitConfig.value || applyFieldContextToTstruct(frameWindow, frameDocument, unitConfig)) {
        context._unitApplied = true;
        unitApplied = true;
        if (unitConfig.value) schedulePrefillReload(context, "unit", frameWindow, frameDocument, unitConfig);
        return { complete: false, farmApplied, unitApplied, houseApplied, batchApplied, stage: "unit" };
      }
    }

    const houseNeeded = Boolean(context.houseName || context.houseCode || context.houseId);
    if (houseNeeded && !context._houseApplied) {
      const houseConfig = {
        value: context.houseName || context.houseCode || context.houseId,
        displayText: context.houseCode || context.houseId,
        fieldNames: mortalityTstruct ? ["batchhouse", "house", "sublocationid", "mortsublocation"] : ["house", "houseid", "housename", "housecode"],
        labels: mortalityTstruct ? ["House", "To House"] : ["House", "House Name"],
        keywords: mortalityTstruct ? ["batchhouse", "house", "sublocationid", "mortsublocation"] : ["house"],
      };

      if (applyFieldContextToTstruct(frameWindow, frameDocument, houseConfig)) {
        context._houseApplied = true;
        houseApplied = true;
        schedulePrefillReload(context, "house", frameWindow, frameDocument, houseConfig);
        return { complete: false, farmApplied, unitApplied, houseApplied, batchApplied, stage: "house" };
      }
    } else if (!houseNeeded) {
      context._houseApplied = true;
      houseApplied = true;
    }

    if (!context._batchApplied) {
      const batchValue = context.batchCode || context.batchId || "";
      if (!batchValue) {
        context._batchApplied = true;
        batchApplied = true;
      } else if (applyFieldContextToTstruct(frameWindow, frameDocument, {
        value: batchValue,
        displayText: context.batchCode || context.batchId,
        fieldNames: context.transid === "btplc"
          ? ["batchid", "batchid000F1"]
          : mortalityTstruct ? ["batch", "batchid", "nbatch"] : ["batch", "batchid", "batchno", "batchnumber"],
        labels: context.transid === "btplc" ? ["Batch ID", "Batch"] : ["Batch", "Batch No"],
        keywords: context.transid === "btplc" ? ["batchid"] : mortalityTstruct ? ["batch", "nbatch"] : ["batch"],
      })) {
        context._batchApplied = true;
        batchApplied = true;
        if (context.transid === "btplc") schedulePlacementOriginClear(context, frameWindow, frameDocument);
      }
    }

    const complete = farmApplied && context._unitApplied && context._houseApplied && context._batchApplied;
    return { complete, farmApplied, unitApplied, houseApplied, batchApplied };
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
        option = new elementWindow.Option(displayText || value, value, true, true);
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
      debugParent("iView jQuery change skipped", error);
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
      warnParent("Unable to access iView iframe for context prefill.", error);
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
    if (!window.ParentAPI || typeof window.ParentAPI.loadTargetParamsForHouse !== "function") return context;

    try {
      const targetParams = await window.ParentAPI.loadTargetParamsForHouse({
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
      warnParent("Failed to load TStruct target params.", error);
    }

    return context;
  }

  async function openTstruct(actionKey, context) {
    if (actionKey === "placement" && context && context.placementDone) return;

    const action = TSTRUCTS[actionKey];
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

    console.log("malintha url is",tstructFrame.src)
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
  }

  function openIView(actionKey, context) {
    const action = IVIEWS[actionKey];
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
    if (!tstructPanel || !tstructFrame) return;
    tstructPanel.classList.remove("is-open");
    tstructPanel.setAttribute("aria-hidden", "true");
    pendingTstructContext = null;
    pendingIViewContext = null;
    tstructFrame.src = "about:blank";
  }

  function handleClick(event) {
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
      const house = houses.find((item) => item.id === (readyToTransferButton.dataset.houseId || ""));
      openReadyToTransferConfirmation(house);
      closeOpenMenus();
      return;
    }

    const readyToTransferCancelButton = event.target.closest("[data-ready-to-transfer-cancel]");
    if (readyToTransferCancelButton) {
      closeReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
      return;
    }

    const readyToTransferConfirmButton = event.target.closest("[data-ready-to-transfer-confirm]");
    if (readyToTransferConfirmButton) {
      completeReadyToTransfer(getReadyToTransferConfirmationHouse());
      return;
    }

    const dayEndButton = event.target.closest("[data-day-end]");
    if (dayEndButton) {
      const house = houses.find((item) => item.id === (dayEndButton.dataset.houseId || ""));
      openDayEndConfirmation(house);
      return;
    }

    const dayEndCancelButton = event.target.closest("[data-day-end-cancel]");
    if (dayEndCancelButton) {
      const house = houses.find((item) => item.id === selectedHouseId);
      closeDayEndConfirmation(house);
      return;
    }

    const dayEndConfirmButton = event.target.closest("[data-day-end-confirm]");
    if (dayEndConfirmButton) {
      const house = houses.find((item) => item.id === selectedHouseId);
      completeDayEnd(house);
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
      if (selectedHouseId) renderHouseDetail(selectedHouseId);
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
      const schedule = getScheduleRowFromButton(house, scheduleEditButton);
      if (!schedule || normalizeActivityStatus(schedule.status) !== "Pending") return;
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

    if (event.target.closest(".card-menu") || event.target.closest(".entry-menu")) return;

    const houseCard = event.target.closest("[data-house-id]");
    if (houseCard) {
      renderHouseDetail(houseCard.dataset.houseId);
      return;
    }

    if (event.target === tstructPanel) closeTstructPanel();
  }

  function handleKeydown(event) {
    if (event.key === "Escape" && readyToTransferConfirmation) {
      closeReadyToTransferConfirmation(getReadyToTransferConfirmationHouse());
      return;
    }

    if (event.key === "Escape" && dayEndConfirmation) {
      const house = houses.find((item) => item.id === selectedHouseId);
      closeDayEndConfirmation(house);
      return;
    }

    if (event.key === "Escape" && scheduleStatusEditor) {
      const house = houses.find((item) => item.id === selectedHouseId);
      closeScheduleStatusEditor();
      if (house) refreshScheduleActivityPanel(house);
      return;
    }

    if (event.key === "Escape" && tstructPanel && tstructPanel.classList.contains("is-open")) {
      closeTstructPanel();
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && event.target.closest(".house-card")) {
      event.preventDefault();
      renderHouseDetail(event.target.closest(".house-card").dataset.houseId);
    }
  }

  function handleChange(event) {
    const activityStatusSelect = event.target.closest(".activity-status-select");
    if (activityStatusSelect) {
      updateActivityStatusSelectClass(activityStatusSelect);
      return;
    }

    const unitSelect = event.target.closest("#unitSelect");
    if (unitSelect) {
      selectedUnit = unitSelect.value;
      loadScreenData();
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
      const house = houses.find((item) => item.id === selectedHouseId);
      if (house) drawHouseCharts(house);
    }
  }

  function handleInput(event) {
    if (event.target && event.target.id === "houseSearch") {
      currentSearchValue = event.target.value;
      if (!selectedHouseId) renderHouses(currentSearchValue);
    }
  }

  window.ParentAPI = {
    loadUnitOptions,
    loadHouses,
    loadTargetParamsForHouse,
    loadCharts,
    loadSchedules,
    loadFarmerActivities,
    executeDayEnd,
    executeReadyToTransferUpdate,
    dataSources: DATA_SOURCES,
    helpers: {
      getAxpertWindows,
      readAxpertGlobalVar,
      parseMaybeJson,
      normalizeRows,
      loadRows,
      mapBatchRow,
      mapChartRows,
      mapScheduleRows,
      mapFarmerActivityRows,
    },
  };

  window[CONFIG.exposeName] = {
    openTstruct,
    openIView,
    openHouse: renderHouseDetail,
    reloadUnits: loadUnitsFromDataSource,
    reloadData: loadScreenData,
    backToHouses: function () {
      renderHouseList();
      renderHouses(currentSearchValue);
    },
    tstructs: TSTRUCTS,
    houses,
  };

  if (!moduleCommand || !unitFilterBar || !houseGrid || !houseDetail || !tstructPanel || !tstructFrame || !closeTstruct) {
    warnParent("Required parent screen DOM elements are missing.");
    return;
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("change", handleChange);
  document.addEventListener("input", handleInput);
  closeTstruct.addEventListener("click", closeTstructPanel);
  tstructFrame.addEventListener("load", prefillTstructUnitContext);
  tstructFrame.addEventListener("load", prefillIViewContext);

  renderHouseList();
  renderHouses(currentSearchValue);
  loadScreenData({ reloadUnits: true });
  window.dispatchEvent(new CustomEvent("ParentAPIReady", { detail: window.ParentAPI }));
})();
