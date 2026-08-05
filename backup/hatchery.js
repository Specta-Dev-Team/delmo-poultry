(function () {
  const AXPERT_TSTRUCT_OPTIONS = {
    basePath: "../../aspx/tstruct.aspx",
    openerIV: "",
    passContextInQuery: true,
  };
 
  const AXPERT_TSTRUCTS = {
    eggGrading: { title: "Egg Grading", transid: "eggal" },
    eggAllotment: { title: "Egg Allotment", transid: "egall" },
    materialConsumption: { title: "Material Consumption Note", transid: "fdcon" },
    candleTest: { title: "Candle Test", transid: "candl" },
    chickPullOut: { title: "Chick Pull Out", transid: "chplo" },
  };
 
//   const setterBatches = [
//     {
//       id: "SET001",
//       batchNo: "SET BATCH 001",
//       name: "Setter Batch Alpha",
//       status: "Active",
//       noOfDays: 7,
//       eggCount: 12800,
//       eggAllotmentNo: "EA-001",
//       setterNo: "Setter 01",
//       feedIndent: "SETIND000001",
//     },
//     {
//       id: "SET002",
//       batchNo: "SET BATCH 002",
//       name: "Setter Batch Beta",
//       status: "Active",
//       noOfDays: 10,
//       eggCount: 10400,
//       eggAllotmentNo: "EA-002",
//       setterNo: "Setter 02",
//       feedIndent: "SETIND000002",
//     },
//     {
//       id: "SET003",
//       batchNo: "SET BATCH 003",
//       name: "Setter Batch Gamma",
//       status: "Planned",
//       noOfDays: 4,
//       eggCount: 9600,
//       eggAllotmentNo: "EA-003",
//       setterNo: "Setter 03",
//       feedIndent: "SETIND000003",
//     },
//   ];
 
 const setterBatches =[];
 
async function LoadRows(){
 
    const batch = await getGlobalVariableValue("M_BRANCH");
    console.log("batch name is",batch);
   
     const params = {
        adsNames: ["poultry_setter_card_details"],
        refreshCache: false,
        sqlParams: {
            m_branch:batch,
            house:""
        },
        props: { ADS: true, pageno: 1, pagesize: 500 }
    };
 
    const caller = (typeof parent !== 'undefined' && parent.GetDataFromAxList) ? parent : window;
 
    caller.GetDataFromAxList(params, function (resp) {
        try {
            let parsed = resp;
            if (typeof resp === "string") parsed = JSON.parse(resp);
            if (parsed && parsed.d && typeof parsed.d === "string") parsed = JSON.parse(parsed.d);
 
            let listRaw = [];
            if (parsed && parsed.result && Array.isArray(parsed.result.data)) {
                parsed.result.data.forEach((it) => {
                    if (Array.isArray(it.data)) listRaw = listRaw.concat(it.data);
                });
            }
 
            if (listRaw.length === 0 && parsed && parsed.result && parsed.result.data &&
                parsed.result.data[0] && Array.isArray(parsed.result.data[0].data)) {
                listRaw = parsed.result.data[0].data;
            }
 
            console.log("datasourse data",listRaw)
            listRaw.forEach(item => {
    setterBatches.push(item);
 
    renderBatches(currentSearchValue);
});
        } catch (e) {
            console.warn("loadCustomers parse failed", listRaw );
        }
    }, function (err) {
        console.warn("loadCustomers failed", err);
    });
  }
 
 function getGlobalVariableValue(key) {
    if (typeof parent !== 'undefined' && typeof parent.AxGetGlobalVar === 'function') {
        var GlobalData = parent.AxGetGlobalVar();
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
  const moduleCommand = document.getElementById("moduleCommand");
  const houseGrid = document.getElementById("houseGrid");
  const tstructPanel = document.getElementById("tstructPanel");
  const tstructFrame = document.getElementById("tstructFrame");
  const closeTstruct = document.getElementById("closeTstruct");
  let currentSearchValue = "";
 
  function displayNumber(value) {
    if (value === undefined || value === null || value === "") return 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(displayNumber(value));
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

  function firstValue(source, keys, fallback) {
    for (const key of keys) {
      if (source && source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
    }
    return fallback;
  }

  function cleanTargetParams(value) {
    return String(value || "").trim().replace(/^\?/, "");
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

  function buildTstructTargetParams(transid, context) {
    if (!context) return "";

    const batchTargetValue = context.batchId || context.setterBatch || context.batchCode;
    if (transid === "fdcon") {
      return [["tobatch", batchTargetValue]]
        .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "" && entry[1] !== "-")
        .map((entry) => `${entry[0]}=${String(entry[1])}`)
        .join("&");
    }

    const existingTargetParams = cleanTargetParams(context.targetParams || context.targetparams || context.target_params);
    if (existingTargetParams) return existingTargetParams;

    const eggAllotmentNo = context.eggAllotmentNo || context.eggallotmentno;
    const setterTargetValue = context.setterName || context.setterCode;
    const entries = [
      ["module", context.module],
      ["batch", batchTargetValue],
      ["batch000F1", batchTargetValue],
      ["batchid", context.batchId],
      ["batchcode", context.batchCode],
      ["setterbatch", context.setterBatch],
      ["setterbatch000F1", context.setterBatch],
      ["setter", setterTargetValue],
      ["setter000F1", setterTargetValue],
      ["setterid", context.setterId],
      ["settercode", context.setterCode],
      ["settername", context.setterName],
      ["eggallotment", eggAllotmentNo],
      ["eggallotment000F1", eggAllotmentNo],
      ["eggallotmentno", eggAllotmentNo],
      ["eggallotmentno000F1", eggAllotmentNo],
      ["egg_allotment_no", eggAllotmentNo],
      ["eggalno", eggAllotmentNo],
      ["allotmentno", eggAllotmentNo],
    ];

    return entries
      .filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "" && entry[1] !== "-")
      .map((entry) => `${entry[0]}=${String(entry[1])}`)
      .join("&");
  }

  function actionContext(batch) {
    if (!batch) return { module: "setter" };

    const batchId = firstValue(batch, ["id", "batchid", "batchId", "batch"], "");
    const setterBatch = firstValue(batch, ["setterbatch", "setterBatch", "batchid", "batchId", "batch"], "");
    const setterCode = firstValue(batch, ["settercode", "setterCode", "code"], "");
    const setterName = firstValue(batch, ["settername", "setterName", "name"], "");
    const setterId = firstValue(batch, ["setterid", "setterId", "setter"], "");
    const eggAllotmentNo = firstValue(batch, ["eggallotmentno", "eggAllotmentNo", "egg_allotment_no", "eggalno", "allotmentno"], "");

    return {
      module: "setter",
      batchId,
      batchCode: batchId || setterBatch,
      setterBatch,
      setterId,
      setterCode,
      setterName,
      eggAllotmentNo,
      eggallotmentno: eggAllotmentNo,
      targetParams: firstValue(batch, ["targetParams", "targetparams", "target_params", "openerIV", "openeriv"], ""),
    };
  }
 
  function currentDateLabel() {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date()).replace(/ /g, " ");
  }
 
  function renderSearchControl() {
    return `
      <div class="search-box module-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
        </svg>
        <input id="batchSearch" type="search" value="${escapeAttribute(currentSearchValue)}" placeholder="Search hatchery batches..." aria-label="Search hatchery batches" />
      </div>
    `;
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
    return `
      <div class="command-actions">
        <button class="command-button primary" type="button" data-tstruct-action="eggGrading">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c4 0 7 4 7 9a7 7 0 0 1-14 0c0-5 3-9 7-9z" /></svg>
          <span>Egg Grading</span>
        </button>
        <button class="command-button" type="button" data-tstruct-action="eggAllotment">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c4 0 7 4 7 9a7 7 0 0 1-14 0c0-5 3-9 7-9z" /></svg>
          <span>Add Egg Allotment</span>
        </button>
        <button class="command-button" type="button" data-tstruct-action="candleTest">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v5M8 8h8l-1 13h-6L8 8zM9 3h6" /></svg>
          <span>Candle Test</span>
        </button>
      </div>
    `;
  }
 
  function renderNavbar() {
    moduleCommand.innerHTML = `
      <div class="module-copy">
        <h2>Hatchery Operations</h2>
        <p>${formatNumber(setterBatches.length)} active batches / ${formatNumber(setterBatches.reduce((sum, item) => sum + displayNumber(firstValue(item, ["eggCount", "totalallotedqty", "totalAllotedQty"], 0)), 0))} eggs set</p>
      </div>
      ${renderSearchControl()}
      ${renderListActions()}
      ${renderNavTools()}
    `;
  }
 
  function buildTstructUrl(transid, context) {
    const targetParams = buildTstructTargetParams(transid, context);
    const encodedParams = encodeTstructTargetParams(targetParams);
    const baseParams = [
      `transid=${encodeURIComponent(transid)}`,
      "isIV=false",
      "isDupTab=false",
      "dummyload=false",
      "hdnbElapsTime=0",
    ].join("&");
    const openerParam = AXPERT_TSTRUCT_OPTIONS.openerIV
      ? `&openerIV=${encodeURIComponent(AXPERT_TSTRUCT_OPTIONS.openerIV)}`
      : "";

    if (AXPERT_TSTRUCT_OPTIONS.passContextInQuery && encodedParams) {
      return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${baseParams}${openerParam}&${encodedParams}&act=open`;
    }

    return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${baseParams}${openerParam}&act=open`;
  }
 
  function openTstruct(actionKey, context) {
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;
    const tstructContext = context && context.module ? context : actionContext(context);
    tstructFrame.src = buildTstructUrl(action.transid, tstructContext);

    console.log("malintha url is", tstructFrame.src)
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
  }
 
  function closeTstructPanel() {
    tstructPanel.classList.remove("is-open");
    tstructPanel.setAttribute("aria-hidden", "true");
    tstructFrame.src = "about:blank";
  }
 
  function reloadCurrentFrame() {
    window.location.reload();
  }
 
  function metric(label, value) {
    return `
      <div class="metric">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }
 
  function renderBatchCard(batch) {
    console.log("malintha batches are",batch)
    const batchId = firstValue(batch, ["id", "setterbatch", "setterBatch", "batchid", "batchId"], "");
    const setterName = firstValue(batch, ["settername", "setterName", "name"], "-");
    const setterCode = firstValue(batch, ["settercode", "setterCode", "code"], "-");
    const setterBatch = firstValue(batch, ["setterbatch", "setterBatch", "batchid", "batchId"], "-");
    const dayCount = firstValue(batch, ["noOfDays", "noofdays", "no_of_days", "days"], 0);
    const eggCount = firstValue(batch, ["totalallotedqty", "totalAllotedQty", "eggCount", "eggcount"], 0);
    const eggAllotmentNo = firstValue(batch, ["eggallotmentno", "eggAllotmentNo", "egg_allotment_no"], "-");
    return `
      <article class="house-card">
        <div class="house-card-header">
          <div class="house-card-copy">
            <h3>${escapeHtml(setterName)} <span class="house-code-pill">${escapeHtml(setterCode)}</span></h3>
            <div class="house-subline">
              <small>Hatchery batch</small>
            </div>
          </div>
          <div class="house-tools">
            <details class="card-menu">
              <summary aria-label="Batch actions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg></summary>
              <div class="command-popover align-right">
                <button type="button" data-tstruct-action="materialConsumption" data-batch-id="${escapeAttribute(batchId)}">Material Consumption Note</button>
              </div>
            </details>
          </div>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", setterBatch)}
          ${metric("No of days", `${formatNumber(dayCount)} days`)}
          ${metric("Egg count", formatNumber(eggCount))}
          ${metric("Egg Grading No", eggAllotmentNo)}
        </div>
        <button class="command-button primary" type="button" data-tstruct-action="chickPullOut" data-batch-id="${escapeAttribute(batchId)}" data-egg-allotment-no="${escapeAttribute(eggAllotmentNo)}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z" /></svg>
          <span>Chick Pull Out</span>
        </button>
      </article>
    `;
  }
 
  function renderBatches(query) {
 
    console.log("malintha quary",query);
    const search = (query || "").trim().toLowerCase();
    const visibleBatches = setterBatches.filter((batch) => {
      return !search || [batch.settername]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
 
    houseGrid.innerHTML = visibleBatches.length
      ? visibleBatches.map(renderBatchCard).join("")
      : `<div class="empty-state">No hatchery batches found.</div>`;
  }
 
  document.addEventListener("click", function (event) {
    const refreshButton = event.target.closest("#refreshBtn");
    if (refreshButton) {
      reloadCurrentFrame();
      return;
    }
 
    const actionButton = event.target.closest("[data-tstruct-action]");
    if (actionButton) {
      event.preventDefault();
      event.stopPropagation();
      const requestedBatchId = String(actionButton.dataset.batchId || "");
      const batch = setterBatches.find((item) => [
        "id", "setterbatch", "setterBatch", "batchid", "batchId", "batch", "eggallotmentno", "EggAllotmentNo", "eggAllotmentNo", "egg_allotment_no",
      ].some((key) => String(item && item[key] || "") === requestedBatchId));
      const context = actionContext(batch);
      const clickedEggAllotmentNo = actionButton.dataset.eggAllotmentNo || "";
      if (clickedEggAllotmentNo && clickedEggAllotmentNo !== "-") {
        context.eggAllotmentNo = clickedEggAllotmentNo;
        context.eggallotmentno = clickedEggAllotmentNo;
      }
      openTstruct(actionButton.dataset.tstructAction, context);
    }
  });
 
  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "batchSearch") {
      currentSearchValue = event.target.value;
      LoadRows();
      renderBatches(currentSearchValue);
    }
  });
 
  closeTstruct.addEventListener("click", closeTstructPanel);
 
  window.setterOps = {
    openTstruct,
    tstructs: AXPERT_TSTRUCTS,
    batches: setterBatches,
  };
 
  LoadRows();
  renderNavbar();
 
})();
 
 
 








