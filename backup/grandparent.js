(function () {
    const CONFIG = {
        key: "grandparent",
        title: "Grand Parent Operations",
        emptyLabel: "No active grand parent batch houses found.",
        exposeName: "grandparentOps",
        tstructOptions: {
            basePath: "../../aspx/tstruct.aspx",
            openerIV: "",
            passContextInQuery: true,
        },
    };

    const DEBUG_GRANDPARENT = false;
    const GRANDPARENT_UI_VERSION = "grandparent-material-cost-20260710-4";

    const DATA_SOURCES = {
        units: { name: "poultry_gp_unit" },
        houses: { name: "poultry_gp_house" },
        batchDetails: { name: "poultry_gp_batch_details" },
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
    const DETAIL_ACTIONS = ["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water", "hatcherTransfer", "materialConsumptionCost"];

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

    function debugGrandparent(...args) {
        if (DEBUG_GRANDPARENT && window.console) console.debug("[Grand Parent Operations]", ...args);
    }

    function warnGrandparent(message, error) {
        if (window.console) console.warn(`[Grand Parent Operations] ${message}`, error || "");
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
        return TSTRUCTS[actionKey] ? TSTRUCTS[actionKey].title : IVIEWS[actionKey] ? IVIEWS[actionKey].title : actionKey;
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
            debugGrandparent("parent window inaccessible", error);
        }

        try {
            if (window.top && !windows.includes(window.top)) windows.push(window.top);
        } catch (error) {
            debugGrandparent("top window inaccessible", error);
        }

        try {
            if (window.opener && !windows.includes(window.opener)) windows.push(window.opener);
        } catch (error) {
            debugGrandparent("opener window inaccessible", error);
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
                debugGrandparent("global var lookup skipped inaccessible window", error);
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
            debugGrandparent("GetDataFromAxList", { dataSourceName, sqlParams: request.sqlParams, refreshCache: request.refreshCache });

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

            debugGrandparent("AxGetSqlData", { dataSourceName, parameters });

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
            debugGrandparent("GetIViewData", { dataSourceName, paramString, forceReload: Boolean(options && options.forceReload) });

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
            debugGrandparent("datasource rows loaded", { dataSourceName, count: rows.length });
            return rows;
        } catch (error) {
            warnGrandparent(`Unable to load datasource ${dataSourceName}.`, error);
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

    function rowText(row, fieldNames) {
        const value = getMatchingFieldValue(row, fieldNames);
        return String(value === undefined || value === null ? "" : value).trim();
    }

    function rowNumber(row, fieldNames, fallback) {
        return toNumber(rowText(row, fieldNames), fallback);
    }

    function mapHouseRow(row, unit) {
        const code = rowText(row, ["code", "slocationcode", "sublocationcode", "housecode", "house_code", "id"]);
        const id = rowText(row, ["id", "houseid", "house_id", "sublocationid", "slocationcode", "sublocationcode"]) || code;
        const rowUnitCode = rowText(row, ["locationcode", "unitcode", "unit_code", "location", "locationid"]);
        const rowUnitLabel = rowText(row, ["unitname", "locationname", "unit_label", "label", "unit"]);
        const unitValue = String(unit && unit.value || "").trim() || rowUnitCode || rowText(row, ["unit"]);
        const unitName = String(unit && unit.label || "").trim() || rowUnitLabel || unitValue;
        const totalBirdsValue = rowText(row, ["totalbirds", "total_birds"]);
        const hasTotalBirds = totalBirdsValue !== "";
        const totalBirds = rowNumber(row, ["totalbirds", "total_birds"]);

        const mappedHouse = {
            unit: unitValue,
            unitName,
            id,
            code: code || id,
            name: rowText(row, ["housename", "house_name", "name", "slocationname", "sublocationname", "description"]) || code || id,
            stage: rowText(row, ["stage", "category", "house_stage"]),
            itemType: rowText(row, ["itemtype", "item_type"]),
            groupName: rowText(row, ["groupname", "group_name"]),
            status: rowText(row, ["status", "active"]) || "Active",
            batchActive: rowText(row, ["batchactive", "batch_active"]),
            batchId: rowText(row, ["batchid", "batch_id", "batch"]),
            batchCode: rowText(row, ["batchcode", "batch_code"]),
            flockAge: rowText(row, ["flockage", "flock_age", "age"]),
            femaleBirds: rowNumber(row, ["femalebirds", "female_birds", "female"]),
            maleBirds: rowNumber(row, ["malebirds", "male_birds", "male"]),
            birdsHoused: rowNumber(row, ["birdshoused", "birds_housed", "qty", "quantity"]),
            maleLiveBirds: rowNumber(row, ["malebirds", "male_birds", "male"]),
            femaleLiveBirds: rowNumber(row, ["femalebirds", "female_birds", "female"]),
            maleDeadBirds: rowNumber(row, ["maledeadbirds", "male_dead_birds", "maledead", "male_dead"]),
            femaleDeadBirds: rowNumber(row, ["femaledeadbirds", "female_dead_birds", "femaledead", "female_dead"]),
            liveHens: hasTotalBirds ? totalBirds : rowNumber(row, ["livehens", "live_hens", "female"]),
            deadBirds: rowNumber(row, ["deadbirds", "dead_birds", "mortality"]),
            totalBirds,
            mortalityRate: rowNumber(row, ["mortalityrate", "mortality_rate"]),
            totalFeedGivenKg: rowNumber(row, ["totalfeedgivenkg", "total_feed_given_kg"]),
            feedPerBird: rowNumber(row, ["feedperbird", "feed_per_bird"]),
            placementDate: rowText(row, ["placementdate", "placement_date", "birthdate", "birth_date"]),
            harvestDate: rowText(row, ["harvestdate", "harvest_date"]),
            houseCost: rowNumber(row, ["housecost", "house_cost"]),
            totalEggsProduced: rowNumber(row, ["totaleggsproduced", "total_eggs_produced"]),
            sampledBirds: rowNumber(row, ["sampledbirds", "sampled_birds"]),
            birdsWithinTargetWeight: rowNumber(row, ["birdswithintargetweight", "birds_within_target_weight"]),
            weightKg: rowNumber(row, ["weightkg", "weight_kg"]),
            healthTasks: rowNumber(row, ["healthtasks", "health_tasks"]),
            feedIndent: rowText(row, ["feedindent", "feed_indent"]),
            targetParams: rowText(row, ["targetParams", "targetparams", "target_params"]),
            placementDone: isCompletedFlag(rowText(row, ["placementdone", "placement_done"])),
            dayEnd: isCompletedFlag(rowText(row, ["dayend", "day_end"])),
        };

        rememberTargetParamsForHouse(mappedHouse, mappedHouse.targetParams);
        return mappedHouse;
    }

    function mapBatchRow(row, house, unit) {
        const baseHouse = house || {};
        const femaleBirds = rowNumber(row, ["femalebirds", "female_birds", "female"], baseHouse.femaleBirds);
        const maleBirds = rowNumber(row, ["malebirds", "male_birds", "male"], baseHouse.maleBirds);
        const birdsHoused = rowNumber(row, ["birdshoused", "birds_housed", "qty", "quantity"], baseHouse.birdsHoused || femaleBirds + maleBirds);
        const batchId = rowText(row, ["batchid", "batch_id", "batch"]) || baseHouse.batchId || "";
        const code = rowText(row, ["code", "slocationcode", "sublocationcode", "housecode", "house_code", "id"]) || baseHouse.code || baseHouse.id || "";
        const rowUnitCode = rowText(row, ["locationcode", "unitcode", "unit_code"]);
        const rowUnitLabel = rowText(row, ["unitname", "locationname", "unit_label", "unit"]);
        const unitValue = String(unit && unit.value || "").trim() || rowUnitCode || baseHouse.unit || rowText(row, ["unit"]);
        const unitName = String(unit && unit.label || "").trim() || rowUnitLabel || baseHouse.unitName || unitValue;
        const batchActive = rowText(row, ["batchactive", "batch_active", "active"]) || baseHouse.batchActive || "";
        const status = rowText(row, ["status"]) || (isInactiveFlag(batchActive) ? "Inactive" : baseHouse.status || "Active");
        const totalBirdsValue = rowText(row, ["totalbirds", "total_birds"]);
        const hasTotalBirds = totalBirdsValue !== "";
        const totalBirds = rowNumber(row, ["totalbirds", "total_birds"], baseHouse.totalBirds || birdsHoused);

        const mappedHouse = {
            unit: unitValue,
            unitName,
            id: rowText(row, ["id", "houseid", "house_id", "sublocationid"]) || baseHouse.id || code || batchId,
            code,
            name: rowText(row, ["housename", "house_name", "name", "slocationname", "sublocationname"]) || baseHouse.name || code,
            stage: rowText(row, ["stage", "category"]) || baseHouse.stage || "",
            itemType: rowText(row, ["itemtype", "item_type"]) || baseHouse.itemType || "",
            groupName: rowText(row, ["groupname", "group_name"]) || baseHouse.groupName || "",
            status,
            batchActive,
            batchId,
            batchCode: rowText(row, ["batchcode", "batch_code"]) || baseHouse.batchCode || batchId,
            flockAge: rowText(row, ["flockage", "flock_age"]) || (rowText(row, ["flockagedays", "flock_age_days"]) ? `${rowText(row, ["flockagedays", "flock_age_days"])} days` : baseHouse.flockAge || ""),
            femaleBirds,
            maleBirds,
            birdsHoused,
            maleLiveBirds: maleBirds,
            femaleLiveBirds: femaleBirds,
            maleDeadBirds: rowNumber(row, ["maledeadbirds", "male_dead_birds", "maledead", "male_dead"], baseHouse.maleDeadBirds),
            femaleDeadBirds: rowNumber(row, ["femaledeadbirds", "female_dead_birds", "femaledead", "female_dead"], baseHouse.femaleDeadBirds),
            liveHens: hasTotalBirds ? totalBirds : rowNumber(row, ["livehens", "live_hens"], baseHouse.liveHens || femaleBirds),
            deadBirds: rowNumber(row, ["deadbirds", "dead_birds"], baseHouse.deadBirds),
            totalBirds,
            mortalityRate: rowNumber(row, ["mortalityrate", "mortality_rate"], baseHouse.mortalityRate),
            totalFeedGivenKg: rowNumber(row, ["totalfeedgivenkg", "total_feed_given_kg"], baseHouse.totalFeedGivenKg),
            feedPerBird: rowNumber(row, ["feedperbird", "feed_per_bird"], baseHouse.feedPerBird),
            placementDate: rowText(row, ["placementdate", "placement_date", "birthdate", "birth_date"]) || baseHouse.placementDate || "",
            harvestDate: rowText(row, ["harvestdate", "harvest_date"]) || baseHouse.harvestDate || "",
            houseCost: rowNumber(row, ["housecost", "house_cost"], baseHouse.houseCost),
            totalEggsProduced: rowNumber(row, ["totaleggsproduced", "total_eggs_produced"], baseHouse.totalEggsProduced),
            sampledBirds: rowNumber(row, ["sampledbirds", "sampled_birds"], baseHouse.sampledBirds),
            birdsWithinTargetWeight: rowNumber(row, ["birdswithintargetweight", "birds_within_target_weight"], baseHouse.birdsWithinTargetWeight),
            weightKg: rowNumber(row, ["weightkg", "weight_kg"], baseHouse.weightKg),
            healthTasks: rowNumber(row, ["healthtasks", "health_tasks"], baseHouse.healthTasks),
            feedIndent: rowText(row, ["feedindent", "feed_indent"]) || baseHouse.feedIndent || "",
            targetParams: rowText(row, ["targetParams", "targetparams", "target_params"]) || baseHouse.targetParams || "",
            readyToHarvest: isCompletedFlag(rowText(row, ["readytoharvest", "readyToHarvest", "harvestready"])) || Boolean(baseHouse.readyToHarvest),
            placementDone: isCompletedFlag(rowText(row, ["placementdone", "placement_done"])) || Boolean(baseHouse.placementDone),
            dayEnd: isCompletedFlag(rowText(row, ["dayend", "day_end"])) || Boolean(baseHouse.dayEnd),
        };

        rememberTargetParamsForHouse(mappedHouse, mappedHouse.targetParams);
        return mappedHouse;
    }

    function isActiveHouse(house) {
        if (!house || !house.id) return false;
        if (isInactiveFlag(house.batchActive)) return false;
        if (isInactiveFlag(house.status)) return false;
        return true;
    }

    function isInactiveFlag(value) {
        return ["F", "FALSE", "N", "NO", "0", "INACTIVE", "CLOSED", "CLOSE"].includes(String(value || "").trim().toUpperCase());
    }

    function isCompletedFlag(value) {
        return ["T", "TRUE", "Y", "YES", "1", "DONE", "COMPLETED", "COMPLETE"].includes(String(value || "").trim().toUpperCase());
    }

    function buildHouseRecordId(house) {
        if (!house) return "";
        const parts = [
            house.unit,
            house.id || house.code,
            house.batchId || house.batchCode,
        ].map((part) => String(part || "").trim());

        return parts.some(Boolean)
            ? parts.join("|")
            : String(house.id || house.code || house.batchId || house.batchCode || "").trim();
    }

    function getHouseRecordId(house) {
        if (!house) return "";
        if (!house.recordId) house.recordId = buildHouseRecordId(house);
        return house.recordId;
    }

    function findHouseByRecordId(recordId, batchId) {
        const target = String(recordId || "").trim();
        const targetBatch = normalizeLookupValue(batchId);
        if (!target && !targetBatch) return null;

        if (target) {
            const exactRecord = houses.find((house) => getHouseRecordId(house) === target);
            if (exactRecord && (!targetBatch || normalizeLookupValue(exactRecord.batchId || exactRecord.batchCode) === targetBatch)) return exactRecord;
        }

        let candidates = target
            ? houses.filter((house) => {
                return [house.id, house.code, house.name].some((value) => normalizeLookupValue(value) === normalizeLookupValue(target));
            })
            : houses.slice();

        if (targetBatch) {
            candidates = candidates.filter((house) => {
                return [house.batchId, house.batchCode].some((value) => normalizeLookupValue(value) === targetBatch);
            });
        }

        return candidates.length === 1 ? candidates[0] : null;
    }

    function findHouseByElement(element) {
        if (!element) return null;
        return findHouseByRecordId(element.dataset.houseId || "", element.dataset.batchId || "");
    }

    function normalizeLookupValue(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    function addHouseLookup(lookup, key, house) {
        const normalizedKey = normalizeLookupValue(key);
        if (normalizedKey && !lookup.has(normalizedKey)) lookup.set(normalizedKey, house);
    }

    function buildHouseLookup(housesForUnit) {
        const lookup = new Map();
        housesForUnit.forEach((house) => {
            addHouseLookup(lookup, house.id, house);
            addHouseLookup(lookup, house.code, house);
            addHouseLookup(lookup, house.name, house);
        });
        return lookup;
    }

    function findHouseForBatchRow(row, houseLookup) {
        const candidates = [
            rowText(row, ["id", "houseid", "house_id", "sublocationid"]),
            rowText(row, ["code", "slocationcode", "sublocationcode", "housecode", "house_code"]),
            rowText(row, ["housename", "house_name", "name", "slocationname", "sublocationname"]),
        ];

        for (const candidate of candidates) {
            const house = houseLookup.get(normalizeLookupValue(candidate));
            if (house) return house;
        }

        return null;
    }

    async function loadRowsFromAttempts(dataSourceName, attempts, options) {
        for (const parameters of attempts) {
            const rows = await loadRows(dataSourceName, parameters, options);
            if (rows.length) return rows;
        }
        return [];
    }

    async function loadHouses(options) {
        const selected = options && options.unit && options.unit !== "all" ? options.unit : "";
        let units = options && Array.isArray(options.unitOptions) ? options.unitOptions : await loadUnitOptions({ forceReload: options && options.forceReload });
        const loadOptions = { forceReload: options && options.forceReload };

        if (selected) {
            units = units.filter((unit) => unit.value === selected);
            if (!units.length) units = [{ value: selected, label: selected }];
        }

        const mappedHouses = [];
        for (const unit of units) {
            const locationname = String(unit.label || unit.value || "").trim();
            const houseAttempts = [];
            if (locationname) houseAttempts.push({ locationname });
            if (unit.value) houseAttempts.push({ unit: unit.value });

            const houseRows = await loadRowsFromAttempts(DATA_SOURCES.houses.name, houseAttempts, loadOptions);
            const unitHouses = houseRows.map((row) => mapHouseRow(row, unit)).filter((house) => house.id);
            const houseLookup = buildHouseLookup(unitHouses);

            const batchAttempts = [];
            if (unit.value) batchAttempts.push({ unit: unit.value, house: "" });
            if (unit.label && unit.label !== unit.value) batchAttempts.push({ unit: unit.label, house: "" });
            const unitBatchRows = await loadRowsFromAttempts(DATA_SOURCES.batchDetails.name, batchAttempts, loadOptions);

            if (unitBatchRows.length) {
                unitBatchRows.forEach((row) => {
                    mappedHouses.push(mapBatchRow(row, findHouseForBatchRow(row, houseLookup), unit));
                });
                continue;
            }

            for (const house of unitHouses) {
                const houseValue = house.code || house.id;
                const perHouseAttempts = [];
                if (unit.value && houseValue) perHouseAttempts.push({ unit: unit.value, house: houseValue });
                if (house.unit && house.unit !== unit.value && houseValue) perHouseAttempts.push({ unit: house.unit, house: houseValue });
                if (unit.label && unit.label !== unit.value && houseValue) perHouseAttempts.push({ unit: unit.label, house: houseValue });
                const batchRows = await loadRowsFromAttempts(DATA_SOURCES.batchDetails.name, perHouseAttempts, loadOptions);

                if (batchRows.length) {
                    batchRows.forEach((row) => mappedHouses.push(mapBatchRow(row, house, unit)));
                } else {
                    mappedHouses.push(house);
                }
            }
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
        if (house.batchId || house.batchCode) {
            const batchId = house.batchId || house.batchCode;
            parameters.batchid = batchId;
            parameters.batch_id = batchId;
        }

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
            if (selectedHouseId && !findHouseByRecordId(selectedHouseId)) selectedHouseId = "";

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
        if (selectedUnit === "all") return true;

        const selectedLabel = getUnitLabelByValue(selectedUnit);
        const selectedMatches = [selectedUnit, selectedLabel].map(normalizeLookupValue).filter(Boolean);
        const houseMatches = [
            house && house.unit,
            house && house.unitName,
            getHouseUnitLabel(house),
        ].map(normalizeLookupValue).filter(Boolean);

        return houseMatches.some((houseValue) => selectedMatches.includes(houseValue));
    }

    function renderSearchControl() {
        return `
      <div class="search-box module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
        <input id="houseSearch" type="search" value="${escapeHtml(currentSearchValue)}" placeholder="Search grandparent houses..." aria-label="Search grandparent houses" />
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
        moduleCommand.dataset.grandparentUiVersion = GRANDPARENT_UI_VERSION;
        ensureMaterialCostEntryButton(house);
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
        const houseRecordId = getHouseRecordId(house);
        const batchId = house.batchId || house.batchCode || "";
        const transferStage = isReadyToHarvest(house);
        const stageClass = transferStage ? " live-transfer-card is-ready-to-transfer" : " ready-harvest-card";
        return `
      <article class="house-card${stageClass}" data-house-id="${escapeHtml(houseRecordId)}" data-batch-id="${escapeHtml(batchId)}" role="button" tabindex="0">
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
                ${getHouseActions(CARD_ACTIONS, house).map((action) => `<button type="button" data-tstruct-action="${action}" data-house-id="${escapeHtml(houseRecordId)}" data-batch-id="${escapeHtml(batchId)}">${escapeHtml(actionText(action))}</button>`).join("")}
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
        const houseRecordId = getHouseRecordId(house);
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!hasPlacementDone(house)) return "";
        if (isReadyToHarvest(house)) {
            return `
        <button class="command-button primary live-bird-transfer-button" type="button" data-tstruct-action="liveBirdTransferRequest" data-house-id="${escapeHtml(houseRecordId)}" data-batch-id="${escapeHtml(batchId)}" aria-label="Live Bird Transfer Request for ${escapeHtml(batchId || house.name)}">
          ${svgIcon("M5 12h14M13 6l6 6-6 6M5 6v12")}
          <span>Live Bird Transfer Request</span>
        </button>
      `;
        }

        return `
      <button class="command-button primary ready-to-transfer-button" type="button" data-ready-to-transfer data-house-id="${escapeHtml(houseRecordId)}" data-batch-id="${escapeHtml(batchId)}" ${batchId ? "" : "disabled"} aria-label="Ready To Transfer Update for ${escapeHtml(batchId || house.name)}">
        ${svgIcon("M12 5v14M5 12h14")}
        <span>Ready To Transfer Update</span>
      </button>
    `;
    }

    function renderEntryMenu(house) {
        const houseRecordId = getHouseRecordId(house);
        const batchId = house.batchId || house.batchCode || "";
        return `
      <details class="command-menu entry-menu">
        <summary class="command-button">
          ${svgIcon("M8 4h8l1 3H7l1-3zM6 7h12v13H6z")}
          <span>Entry</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div class="entry-grid-popover align-right">
          ${getHouseActions(DETAIL_ACTIONS, house).map((action) => `
            <button class="entry-grid-option" type="button" ${IVIEWS[action] ? `data-iview-action="${action}"` : `data-tstruct-action="${action}"`} data-house-id="${escapeHtml(houseRecordId)}" data-batch-id="${escapeHtml(batchId)}">
              <span class="entry-grid-icon">${svgIcon(ICONS[action] || ICONS.batchCreation)}</span>
              <span>${escapeHtml(actionText(action))}</span>
            </button>
          `).join("")}
        </div>
      </details>
    `;
    }

    function renderDayEndButton(house) {
        const houseRecordId = getHouseRecordId(house);
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        const completed = isDayEnded(house);
        const label = completed ? "Day End Completed" : "Day End";
        const icon = completed
            ? "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5V10zm7 4v2"
            : "M12 3v9M8 8l4 4 4-4M5 16v4h14v-4";

        return `
      <button class="command-button primary day-end-button ${completed ? "is-completed" : ""}" type="button" data-day-end data-house-id="${escapeHtml(houseRecordId)}" ${batchId && !completed ? "" : "disabled"} aria-label="${label}">
        ${svgIcon(icon)}
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

    function openDayEndConfirmation(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!house || !batchId || isDayEnded(house)) return;
        dayEndConfirmation = { houseId: getHouseRecordId(house), batchId, processing: false, error: "" };
        renderHouseDetail(getHouseRecordId(house));
    }

    function closeDayEndConfirmation(house) {
        dayEndConfirmation = null;
        if (house) renderHouseDetail(getHouseRecordId(house));
    }

    async function completeDayEnd(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!batchId || !dayEndConfirmation || dayEndConfirmation.houseId !== getHouseRecordId(house) || dayEndConfirmation.processing) return;

        dayEndConfirmation = Object.assign({}, dayEndConfirmation, { processing: true, error: "" });
        renderHouseDetail(getHouseRecordId(house));

        try {
            await window.GrandparentAPI.executeDayEnd({ batchid: batchId });
            house.dayEnd = true;
            dayEndConfirmation = null;
            renderHouseDetail(getHouseRecordId(house));
        } catch (error) {
            dayEndConfirmation = Object.assign({}, dayEndConfirmation, {
                processing: false,
                error: error && error.message ? error.message : "Day End could not be completed.",
            });
            renderHouseDetail(getHouseRecordId(house));
        }
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
            ? findHouseByRecordId(readyToTransferConfirmation.houseId)
            : null;
    }

    function openReadyToTransferConfirmation(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        if (!house || !batchId || isReadyToHarvest(house)) return;
        readyToTransferConfirmation = { houseId: getHouseRecordId(house), batchId, processing: false, error: "" };
        if (selectedHouseId === getHouseRecordId(house)) renderHouseDetail(getHouseRecordId(house));
        else renderHouses(currentSearchValue);
    }

    function closeReadyToTransferConfirmation(house) {
        readyToTransferConfirmation = null;
        if (house && selectedHouseId === getHouseRecordId(house)) renderHouseDetail(getHouseRecordId(house));
        else renderHouses(currentSearchValue);
    }

    async function completeReadyToTransfer(house) {
        const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
        const houseRecordId = getHouseRecordId(house);
        if (!house || !batchId || isReadyToHarvest(house) || !readyToTransferConfirmation || readyToTransferConfirmation.houseId !== houseRecordId || readyToTransferConfirmation.processing) return;

        readyToTransferConfirmation = Object.assign({}, readyToTransferConfirmation, { processing: true, error: "" });
        if (selectedHouseId === houseRecordId) renderHouseDetail(houseRecordId);
        else renderHouses(currentSearchValue);

        try {
            await window.GrandparentAPI.executeReadyToTransferUpdate({ batchid: batchId });
            house.readyToHarvest = true;
            readyToTransferConfirmation = null;
            if (selectedHouseId === houseRecordId) renderHouseDetail(houseRecordId);
            else renderHouses(currentSearchValue);
        } catch (error) {
            readyToTransferConfirmation = Object.assign({}, readyToTransferConfirmation, {
                processing: false,
                error: error && error.message ? error.message : "Ready To Transfer Update could not be completed.",
            });
            if (selectedHouseId === houseRecordId) renderHouseDetail(houseRecordId);
            else renderHouses(currentSearchValue);
            warnGrandparent("Ready To Transfer Update could not be completed.", error);
        }
    }

    function ensureMaterialCostEntryButton(house) {
        const action = "materialConsumptionCost";
        const popover = moduleCommand && moduleCommand.querySelector(".entry-grid-popover");
        if (!popover || popover.querySelector(`[data-iview-action="${action}"]`)) return;

        const houseRecordId = getHouseRecordId(house);
        const batchId = house && (house.batchId || house.batchCode || "");
        const button = document.createElement("button");
        button.className = "entry-grid-option";
        button.type = "button";
        button.dataset.iviewAction = action;
        button.dataset.houseId = houseRecordId;
        button.dataset.batchId = batchId || "";
        button.innerHTML = `
      <span class="entry-grid-icon">${svgIcon(ICONS[action] || ICONS.batchCreation)}</span>
      <span>${escapeHtml(actionText(action))}</span>
    `;
        popover.appendChild(button);
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
        const rangeButtons = Object.entries(CHART_RANGES).map((entry) => {
            const range = entry[0];
            const item = entry[1];
            const activeClass = selectedChartRange === range ? " is-active" : "";
            return '<button class="chart-range-button' + activeClass + '" type="button" data-chart-range="' + range + '">' + escapeHtml(item.label) + '</button>';
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
        ${chartCard("bodyWeight", "Body Weight", "Average grams")}
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

    function normalizeChartBatchId(value) {
        return String(value === undefined || value === null ? "" : value).trim().toLowerCase();
    }

    function mapChartRows(rows, batchId) {
        const selectedBatchId = normalizeChartBatchId(batchId);
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
            .filter((record) => {
                if (!record.dateValue && !record.label) return false;
                if (!selectedBatchId) return true;
                const recordBatchId = normalizeChartBatchId(record.batchId);
                return !recordBatchId || recordBatchId === selectedBatchId;
            })
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
        if (!batchId) return mapChartRows([], "");
        const parameters = { batchid: batchId, batch_id: batchId };
        const rows = await loadRows(DATA_SOURCES.charts.name, parameters, { forceReload: true });
        return mapChartRows(rows, batchId);
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

        Object.keys(chartOptions).forEach((key) => {
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
                <td>${renderScheduleStatusEditButton(index, rowId, status)}</td>
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

    function refreshFarmerActivityPanel(house) {
        if (!house || selectedActivityTab !== "farmerActivity" || selectedHouseId !== getHouseRecordId(house)) return;
        const activityPanels = houseDetail.querySelector(".activity-panels");
        if (activityPanels) activityPanels.innerHTML = renderFarmerActivityPanel(house);
    }

    function renderScheduleActivityPanel(house) {
        const houseRecordId = getHouseRecordId(house);
        const batchId = house.batchId || house.batchCode || "";
        return `
      <div class="activity-panel-body" role="tabpanel" aria-label="Schedule">
        <div class="table-panel-header activity-table-header">
          <div>
            <h3>Schedules</h3>
            <p>Medication, monitoring, and review actions attached to this grand parent batch.</p>
          </div>
          <div class="activity-header-actions">
            ${renderScheduleStatusFilter()}
            <button class="command-button" type="button" data-tstruct-action="feedMedication" data-house-id="${escapeHtml(houseRecordId)}" data-batch-id="${escapeHtml(batchId)}">Add Schedule</button>
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
            <p>Tasks, findings, and remarks attached to this grand parent batch.</p>
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
            <p>Track schedules and farmer activity for this grand parent batch.</p>
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
        const house = findHouseByRecordId(houseId);
        if (!house) return;

        const previousHouseId = selectedHouseId;
        selectedHouseId = getHouseRecordId(house);
        if (previousHouseId && previousHouseId !== selectedHouseId) {
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
        ${contextItem("Male live birds", formatNumber(house.maleLiveBirds), "M5 9c3 3 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Female live birds", formatNumber(house.femaleLiveBirds), "M5 9c3 3 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
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

        const detailRecordId = selectedHouseId;
        const drawSelectedHouseCharts = function () {
            if (selectedHouseId === detailRecordId) drawHouseCharts(house);
        };

        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(drawSelectedHouseCharts);
        } else {
            window.setTimeout(drawSelectedHouseCharts, 0);
        }

        loadCharts(house).then(function (chartMetrics) {
            if (selectedHouseId !== detailRecordId) return;
            house.metrics = chartMetrics;
            drawHouseCharts(house);
        }).catch(function (error) {
            warnGrandparent("Failed to load chart data.", error);
        });

        loadSchedules(house).then(function (schedules) {
            if (selectedHouseId !== detailRecordId) return;
            house.schedules = schedules;
            house.schedulesLoading = false;
            refreshScheduleActivityPanel(house);
        }).catch(function (error) {
            house.schedulesLoading = false;
            refreshScheduleActivityPanel(house);
            warnGrandparent("Failed to load schedule data.", error);
        });

        loadFarmerActivities(house).then(function (activities) {
            if (selectedHouseId !== detailRecordId) return;
            house.farmerActivities = activities;
            house.farmerActivitiesLoading = false;
            refreshFarmerActivityPanel(house);
        }).catch(function (error) {
            house.farmerActivitiesLoading = false;
            refreshFarmerActivityPanel(house);
            warnGrandparent("Failed to load farmer activity data.", error);
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

    function mergeTstructTargetParams(baseParams, entries) {
        const contextKeys = new Set([
            "unit", "unitid", "unitname",
            "house", "houseid", "housecode", "housename",
            "batch", "batchid", "batchcode",
            "schedule", "scheduleid", "scheduledate", "scheduleage", "schedulestatus",
            "fromhouse", "fromsubunit", "tobatch",
        ]);
        const baseParts = splitTstructTargetParams(baseParams)
            .filter((part) => !contextKeys.has(normalizeTstructParamKey(part)));
        const existingKeys = new Set(baseParts.map(normalizeTstructParamKey).filter(Boolean));
        const generatedParts = entries
            .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "")
            .filter((entry) => {
                const key = normalizeTstructParamKey(entry[0]);
                return contextKeys.has(key) || !existingKeys.has(key);
            })
            .map((entry) => `${entry[0]}=${String(entry[1])}`);

        return baseParts.concat(generatedParts).join("&");
    }

    function buildTstructTargetParams(transid, context) {
        if (!context) return "";

        const unitTargetValue = context.unitName || context.unitId;
        const houseTargetValue = context.houseName || context.houseCode || context.houseId;
        const batchTargetValue = context.batchCode || context.batchId;

        if (transid === "btplc") {
            return batchTargetValue ? `batchid=${String(batchTargetValue)}` : "";
        }

        let entries = [];

        if (transid === "layer") {
            entries = [
                ["currentbatch", batchTargetValue],
            ];
        } else if (transid === "morta") {
            entries = [
                ["batch", batchTargetValue],
            ];}
            else if (transid==="batcr"){
            entries =[["itemgroup", "GP CHICKS"],]
            }

            else if (transid==="house"){
            entries =[["category", "GRAND PARENT"],]
            }
        else if (transid === "fdcon") {
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
                ["sublocation", context.houseName],
            ];
        } else if (transid === "bdwgt") {
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
                ["batch", batchTargetValue],
                ["sublocation", context.houseName],
            ];
        } else if (transid === "water") {
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
                ["batch", batchTargetValue],
                ["sublocation", context.houseName],
            ];
        } else if (transid === "eggcl") {
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
                ["birdbatch", batchTargetValue],
                ["sublocation", context.houseName],
            ];
        } else if (transid === "light" || transid === "envnm") {
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
                ["batch", batchTargetValue],
                ["sublocation", context.houseName],
            ];
        } else {
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
                ["batchid", batchTargetValue],
                ["sublocation", context.houseName],
                ["schedule", context.scheduleName],
                ["scheduleid", context.scheduleId],
                ["scheduledate", context.scheduleDate],
                ["scheduleage", context.scheduleAge],
                ["schedulestatus", context.scheduleStatus],
            ];
        }

        const existingTargetParams = cleanTargetParams(context.targetParams || context.targetparams);
        if (existingTargetParams) return mergeTstructTargetParams(existingTargetParams, entries);

        const cachedTargetParams = getCachedTargetParams(context);
        if (cachedTargetParams) return mergeTstructTargetParams(cachedTargetParams, entries);

        return mergeTstructTargetParams("", entries);
    }

    function buildTstructUrl(transid, context) {
        const targetParams = buildTstructTargetParams(transid, context);
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
        const elementWindow = element.ownerDocument && element.ownerDocument.defaultView;
        const EventConstructor = elementWindow ? elementWindow.Event : Event;

        ["input", "change", "blur"].forEach((eventName) => {
            try {
                element.dispatchEvent(new EventConstructor(eventName, { bubbles: true }));
            } catch (error) {
                debugGrandparent("dispatchInputEvents skipped", error);
            }
        });

        try {
            if (elementWindow && elementWindow.jQuery) {
                const $el = elementWindow.jQuery(element);
                $el.trigger("change.select2");
                if ($el.data && $el.data("select2")) {
                    try {
                        $el.trigger({ type: "select2:select", params: { data: { id: element.value, text: element.options && element.options[element.selectedIndex] ? element.options[element.selectedIndex].text : element.value } } });
                    } catch (error) {
                        debugGrandparent("select2:select trigger skipped", error);
                    }
                }
            }
        } catch (error) {
            debugGrandparent("Select2 dispatchInputEvents skipped", error);
        }
    }

    function normalizeSelectMatchValue(value) {
        return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
    }

    function findSelectOption(element, value, displayText) {
        const targets = [value, displayText].map(normalizeSelectMatchValue).filter(Boolean);
        if (!targets.length || !element || !element.options) return null;

        const options = Array.from(element.options);

        const exact = options.find((item) => {
            const optionValues = [
                item.value,
                item.text,
                item.getAttribute && item.getAttribute("data-value"),
                item.getAttribute && item.getAttribute("data-key"),
                item.getAttribute && item.getAttribute("title"),
            ].map(normalizeSelectMatchValue).filter(Boolean);
            return optionValues.some((optionValue) => targets.includes(optionValue));
        });
        if (exact) return exact;

        return options.find((item) => {
            const text = normalizeSelectMatchValue(item.text);
            const val = normalizeSelectMatchValue(item.value);
            return targets.some((target) => target && (text.startsWith(target) || val.startsWith(target) || target.startsWith(val)));
        }) || null;
    }

    function setElementValue(element, value, displayText) {
        if (!element || value === undefined || value === null || value === "") return false;

        const tagName = (element.tagName || "").toLowerCase();
        const elementWindow = element.ownerDocument && element.ownerDocument.defaultView;

        if (tagName === "select") {
            let option = findSelectOption(element, value, displayText);

            if (!option && elementWindow) {
                try {
                    const OptionConstructor = elementWindow.Option || Option;
                    option = new OptionConstructor(displayText || value, value, true, true);
                    element.add(option);
                } catch (error) {
                    debugGrandparent("Option injection skipped", error);
                    return false;
                }
            }
            if (!option) return false;

            element.value = option.value;

            try {
                if (elementWindow && elementWindow.jQuery) {
                    const $el = elementWindow.jQuery(element);
                    if ($el.data && $el.data("select2")) {
                        $el.val(option.value).trigger("change");
                    } else {
                        $el.val(option.value).trigger("change").trigger("change.select2");
                    }
                    try {
                        $el.trigger({ type: "select2:select", params: { data: { id: option.value, text: option.text || option.value } } });
                    } catch (error) {
                        debugGrandparent("select2:select trigger skipped in setElementValue", error);
                    }
                    return true;
                }
            } catch (error) {
                debugGrandparent("jQuery select2 setElementValue skipped", error);
            }
        } else {
            element.value = value;
        }

        dispatchInputEvents(element);
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
                        debugGrandparent("Axpert setter skipped", { setterName, fieldName, error });
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
            const tagName = (field.tagName || "").toLowerCase();

            try {
                if (typeof field.onchange === "function") field.onchange();
            } catch (error) {
                debugGrandparent("field onchange skipped", error);
            }

            try {
                dispatchInputEvents(field);
                if (frameWindow && frameWindow.jQuery) {
                    const $field = frameWindow.jQuery(field);
                    $field.trigger("change").trigger("change.select2");

                    if (tagName === "select" && $field.data && $field.data("select2")) {
                        try {
                            $field.val(field.value).trigger("change");

                            let s2Data;
                            try { s2Data = $field.select2("data"); } catch (e) { s2Data = null; }
                            const s2Item = Array.isArray(s2Data) ? s2Data[0] : s2Data;
                            const selectedId = (s2Item && (s2Item.id || s2Item.Id)) || field.value;
                            const selectedText = (s2Item && (s2Item.text || s2Item.Text)) ||
                                (field.options && field.selectedIndex >= 0 ? field.options[field.selectedIndex].text : field.value);

                            $field.trigger({
                                type: "select2:select",
                                params: { data: { id: selectedId, text: selectedText } },
                            });
                        } catch (error) {
                            debugGrandparent("Select2 programmatic trigger skipped", error);
                        }
                    }
                }
            } catch (error) {
                debugGrandparent("dependent change skipped", error);
            }

            reloadFns.forEach((fnName) => {
                const fn = frameWindow && frameWindow[fnName];
                if (typeof fn !== "function") return;

                try {
                    fn.call(frameWindow, fieldName);
                } catch (error) {
                    debugGrandparent("Axpert dependent reload skipped", { fnName, fieldName, error });
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

    function applyPlacementBatchHeaderToTstruct(frameDocument, value, displayText) {
        if (!frameDocument || !value) return false;

        const field = findFieldByLabel(frameDocument, "Batch ID") ||
            findFieldByCandidates(frameDocument, ["batchid", "batchid000F1"]);
        if (!field) return false;

        return setElementValue(field, value, displayText || value);
    }

    function schedulePrefillReload(context, stageKey, frameWindow, frameDocument, config) {
        const flagName = `_${stageKey}ReloadTriggered`;
        if (context[flagName]) return;

        context[flagName] = true;
        window.setTimeout(() => {
            triggerAxpertDependentReload(frameWindow, frameDocument, config);
        }, 150);
    }

    function getPlacementOriginFieldCandidates(frameDocument, config) {
        const fields = getContextFieldCandidates(frameDocument, config);
        const seen = new Set(fields);
        const addField = (field) => {
            if (!field) return;
            if (seen.has(field)) return;
            seen.add(field);
            fields.push(field);
        };

        if (config.origin === "unit" && !fields.some((field) => /fromunit|fromsubunit/i.test(field.getAttribute("name") || field.id || ""))) {
            const duplicateUnitFields = Array.from(frameDocument.querySelectorAll("input, select, textarea"))
                .filter((field) => /^(unit|unit000f1)$/i.test(field.getAttribute("name") || field.id || ""));
            addField(duplicateUnitFields[duplicateUnitFields.length - 1]);
        }

        if (config.origin === "house" && !fields.some((field) => /fromhouse|fromsubunit|fromsublocation/i.test(field.getAttribute("name") || field.id || ""))) {
            const duplicateHouseFields = Array.from(frameDocument.querySelectorAll("input, select, textarea"))
                .filter((field) => /^(sublocation|sublocation000f1)$/i.test(field.getAttribute("name") || field.id || ""));
            addField(duplicateHouseFields[duplicateHouseFields.length - 1]);
        }

        return fields;
    }

    function clearPlacementOriginFields(frameWindow, frameDocument) {
        if (!frameDocument) return false;

        const fieldConfigs = [
            {
                fieldNames: ["fromunit", "fromunitid", "fromunitcode", "fromsubunit"],
                labels: ["From Unit", "From Location"],
                keywords: ["fromunit", "fromsubunit"],
                origin: "unit",
            },
            {
                fieldNames: [
                    "fromhouse", "fromhouseid", "fromhousecode", "fromsubunit",
                    "fromsublocation", "fromsublocationid", "fromsublocationcode",
                ],
                labels: ["From House", "From Sub Unit", "From Location"],
                keywords: ["fromhouse", "fromsubunit", "fromsublocation"],
                origin: "house",
            },
        ];

        let cleared = false;
        fieldConfigs.forEach((config) => {
            getPlacementOriginFieldCandidates(frameDocument, config).forEach((field) => {
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
                    debugGrandparent("placement origin clear skipped", error);
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
            warnGrandparent("Unable to access TStruct iframe for context prefill.", error);
            return null;
        }

        if (!frameWindow || !frameDocument || !frameDocument.body) return null;

        const isPlacement = context.transid === "btplc";
        let unitApplied = Boolean(context._unitApplied);
        let houseApplied = Boolean(context._houseApplied);
        let fromHouseApplied = !isPlacement || Boolean(context._fromHouseApplied);
        let batchApplied = Boolean(context._batchApplied);

        if (isPlacement) {
            context._unitApplied = true;
            context._houseApplied = true;
            context._fromHouseApplied = true;
            unitApplied = true;
            houseApplied = true;
            fromHouseApplied = true;
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
                return { complete: false, unitApplied, fromHouseApplied, houseApplied, batchApplied, stage: "unit" };
            }
        }

        if (isPlacement && !context._fromHouseApplied) {
            const fromHouseValue = context.houseName || context.houseCode || context.houseId;
            if (fromHouseValue) {
                const fromHouseConfig = {
                    value: fromHouseValue,
                    displayText: context.houseCode || context.houseId,
                    fieldNames: ["fromhouse", "fromsubunit", "fromhouseid", "fromhousecode"],
                    labels: ["From House", "From Sub Unit", "From Location"],
                    keywords: ["fromhouse", "fromsubunit"],
                };
                applyFieldContextToTstruct(frameWindow, frameDocument, fromHouseConfig);
                schedulePrefillReload(context, "fromHouse", frameWindow, frameDocument, fromHouseConfig);
            }
            context._fromHouseApplied = true;
            fromHouseApplied = true;
            return { complete: false, unitApplied, fromHouseApplied, houseApplied, batchApplied, stage: "fromHouse" };
        }

        const houseNeeded = Boolean(context.houseName || context.houseCode || context.houseId);
        if (houseNeeded && !context._houseApplied) {
            const houseConfig = {
                value: context.houseName || context.houseCode || context.houseId,
                displayText: context.houseCode || context.houseId,
                fieldNames: isPlacement
                    ? ["house", "houseid", "housename", "housecode", "fromhouse", "fromsubunit"]
                    : ["house", "houseid", "housename", "housecode"],
                labels: isPlacement ? ["House", "From House", "House Name"] : ["House", "House Name"],
                keywords: ["house"],
            };

            if (applyFieldContextToTstruct(frameWindow, frameDocument, houseConfig)) {
                context._houseApplied = true;
                houseApplied = true;
                schedulePrefillReload(context, "house", frameWindow, frameDocument, houseConfig);
                return { complete: false, unitApplied, fromHouseApplied, houseApplied, batchApplied, stage: "house" };
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
            } else {
                // Only fill the designated main batch field for the given transid
                // to prevent dropdown from loading all batch IDs
                let batchFieldNames;
                const transid = context.transid || "";
                if (isPlacement) {
                    batchFieldNames = ["batchid", "batchid000F1"];
                } else if (transid === "layer") {
                    batchFieldNames = ["currentbatch", "currentbatch000F1"];
                } else if (transid === "morta") {
                    batchFieldNames = ["batch", "batch000F1"];
                } else if (transid === "fdcon") {
                    batchFieldNames = ["tobatch", "tobatch000F1"];
                } else if (transid === "eggcl") {
                    batchFieldNames = ["birdbatch", "birdbatch000F1"];
                } else {
                    batchFieldNames = ["batch", "batch000F1", "batchid", "batchno", "batchnumber"];
                }
                const batchConfig = {
                    value: batchValue,
                    displayText: context.batchCode || context.batchId,
                    fieldNames: batchFieldNames,
                    labels: ["Batch", "Batch No", "Batch No."],
                    keywords: isPlacement ? ["batchid"] : ["batch"],
                };
                const batchAppliedNow = isPlacement
                    ? applyPlacementBatchHeaderToTstruct(frameDocument, batchConfig.value, batchConfig.displayText)
                    : applyFieldContextToTstruct(frameWindow, frameDocument, batchConfig);
                if (batchAppliedNow) {
                    context._batchApplied = true;
                    batchApplied = true;
                    schedulePrefillReload(context, "batch", frameWindow, frameDocument, batchConfig);
                    schedulePlacementOriginClear(context, frameWindow, frameDocument);
                    return { complete: false, unitApplied, fromHouseApplied, houseApplied, batchApplied, stage: "batch" };
                }
            }
        }

        const complete = context._unitApplied && context._houseApplied && context._batchApplied;
        return { complete, unitApplied, fromHouseApplied, houseApplied, batchApplied };
    }

    function prefillTstructUnitContext() {
        const startedAt = Date.now();
        const maxWaitMs = 8000;
        const pollDelayMs = 300;
        let completedAt = 0;
        const postCompletePollMs = 1200;

        const poll = () => {
            if (!pendingTstructContext) return;
            const status = applyContextToTstruct();

            if (status && status.complete) {
                if (!completedAt) completedAt = Date.now();
                if (Date.now() - completedAt < postCompletePollMs) {
                    window.setTimeout(poll, pollDelayMs);
                }
                return;
            }

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
            debugGrandparent("iView jQuery change skipped", error);
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
            warnGrandparent("Unable to access iView iframe for context prefill.", error);
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
        if (!window.GrandparentAPI || typeof window.GrandparentAPI.loadTargetParamsForHouse !== "function") return context;

        try {
            const targetParams = await window.GrandparentAPI.loadTargetParamsForHouse({
                id: context.houseId,
                code: context.houseCode,
                name: context.houseName,
                unit: context.unitId,
                unitName: context.unitName,
                batchId: context.batchId,
                batchCode: context.batchCode,
            });

            if (targetParams) {
                context.targetParams = targetParams;
                const house = findHouseByRecordId(context.houseRecordId || context.houseId, context.batchId || context.batchCode);
                rememberTargetParamsForHouse(house || context, targetParams);
            }
        } catch (error) {
            warnGrandparent("Failed to load TStruct target params.", error);
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
            openReadyToTransferConfirmation(findHouseByRecordId(readyToTransferButton.dataset.houseId || ""));
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
            const house = findHouseByRecordId(dayEndButton.dataset.houseId || "");
            openDayEndConfirmation(house);
            return;
        }

        const dayEndCancelButton = event.target.closest("[data-day-end-cancel]");
        if (dayEndCancelButton) {
            closeDayEndConfirmation(findHouseByRecordId(selectedHouseId));
            return;
        }

        const dayEndConfirmButton = event.target.closest("[data-day-end-confirm]");
        if (dayEndConfirmButton) {
            completeDayEnd(findHouseByRecordId(selectedHouseId));
            return;
        }

        const rangeButton = event.target.closest("[data-chart-range]");
        if (rangeButton) {
            selectedChartRange = rangeButton.dataset.chartRange;
            if (selectedHouseId) renderHouseDetail(selectedHouseId);
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
            const schedule = getScheduleRowFromButton(house, scheduleEditButton);
            if (!schedule || normalizeActivityStatus(schedule.status) !== "Pending") return;
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

        const iviewButton = event.target.closest("[data-iview-action]");
        if (iviewButton) {
            event.preventDefault();
            event.stopPropagation();
            const house = findHouseByElement(iviewButton);
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

        if (event.target.closest(".card-menu") || event.target.closest(".entry-menu")) return;

        const houseCard = event.target.closest("[data-house-id]");
        if (houseCard) {
            const house = findHouseByElement(houseCard);
            if (house) renderHouseDetail(getHouseRecordId(house));
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
            closeDayEndConfirmation(findHouseByRecordId(selectedHouseId));
            return;
        }

        if (event.key === "Escape" && scheduleStatusEditor) {
            const house = findHouseByRecordId(selectedHouseId);
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
            const house = findHouseByElement(event.target.closest(".house-card"));
            if (house) renderHouseDetail(getHouseRecordId(house));
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
            const house = findHouseByRecordId(selectedHouseId);
            if (house) drawHouseCharts(house);
        }
    }

    function handleInput(event) {
        if (event.target && event.target.id === "houseSearch") {
            currentSearchValue = event.target.value;
            if (!selectedHouseId) renderHouses(currentSearchValue);
        }
    }

    window.GrandparentAPI = {
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
            getHouseRecordId,
            findHouseByRecordId,
            findHouseByElement,
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
        warnGrandparent("Required grandparent screen DOM elements are missing.");
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
    window.dispatchEvent(new CustomEvent("GrandparentAPIReady", { detail: window.GrandparentAPI }));
})();
