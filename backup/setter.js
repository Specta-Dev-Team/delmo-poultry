(function () {
  const AXPERT_TSTRUCT_OPTIONS = {
    basePath: "../../aspx/tstruct.aspx",
    openerIV: "",
    passContextInQuery: false,
  };

  const AXPERT_TSTRUCTS = {
    eggAllotment: { title: "Egg Allotment", transid: "eggal" },
    candleTest: { title: "Candle Test", transid: "candl" },
    hatcherTransfer: { title: "Transfer To Hatcher", transid: "hatch" },
  };

  const setterBatches = [
    {
      id: "SET001",
      batchNo: "SET BATCH 001",
      name: "Setter Batch Alpha",
      status: "Active",
      noOfDays: 7,
      eggCount: 12800,
      setterNo: "Setter 01",
      feedIndent: "SETIND000001",
    },
    {
      id: "SET002",
      batchNo: "SET BATCH 002",
      name: "Setter Batch Beta",
      status: "Active",
      noOfDays: 10,
      eggCount: 10400,
      setterNo: "Setter 02",
      feedIndent: "SETIND000002",
    },
    {
      id: "SET003",
      batchNo: "SET BATCH 003",
      name: "Setter Batch Gamma",
      status: "Planned",
      noOfDays: 4,
      eggCount: 9600,
      setterNo: "Setter 03",
      feedIndent: "SETIND000003",
    },
  ];

  const moduleCommand = document.getElementById("moduleCommand");
  const houseGrid = document.getElementById("houseGrid");
  const tstructPanel = document.getElementById("tstructPanel");
  const tstructFrame = document.getElementById("tstructFrame");
  const closeTstruct = document.getElementById("closeTstruct");
  let currentSearchValue = "";

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
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
        <input id="batchSearch" type="search" value="${escapeAttribute(currentSearchValue)}" placeholder="Search setter batches..." aria-label="Search setter batches" />
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
        <button class="command-button primary" type="button" data-tstruct-action="eggAllotment">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c4 0 7 4 7 9a7 7 0 0 1-14 0c0-5 3-9 7-9z" /></svg>
          <span>Egg Allotment</span>
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
        <h2>Setter Operations</h2>
        <p>${formatNumber(setterBatches.length)} active batches / ${formatNumber(setterBatches.reduce((sum, item) => sum + item.eggCount, 0))} eggs set</p>
      </div>
      ${renderSearchControl()}
      ${renderListActions()}
      ${renderNavTools()}
    `;
  }

  function buildTstructUrl(transid, context) {
    const params = new URLSearchParams({
      transid,
      isIV: "false",
      isDupTab: "false",
      dummyload: "false",
      hdnbElapsTime: "0",
    });

    if (AXPERT_TSTRUCT_OPTIONS.openerIV) params.set("openerIV", AXPERT_TSTRUCT_OPTIONS.openerIV);
    if (AXPERT_TSTRUCT_OPTIONS.passContextInQuery && context) {
      Object.keys(context).forEach(function (key) {
        if (context[key] !== undefined && context[key] !== null) params.set(key, context[key]);
      });
    }

    return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${params.toString()}`;
  }

  function openTstruct(actionKey, context) {
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;
    tstructFrame.src = buildTstructUrl(action.transid, context || { module: "setter" });
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
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `;
  }

  function renderBatchCard(batch) {
    return `
      <article class="house-card">
        <div class="house-card-header">
          <div>
            <h3>${batch.name} <span class="house-code-pill">${batch.id}</span></h3>
            <small>${batch.setterNo}</small>
          </div>
        </div>
        <div class="house-tag-row house-tag-row-primary">
          <span class="status-badge">${batch.status}</span>
          <span class="batch-badge">${batch.batchNo}</span>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", batch.batchNo)}
          ${metric("No of days", `${formatNumber(batch.noOfDays)} days`)}
          ${metric("Egg count", formatNumber(batch.eggCount))}
        </div>
        <button class="command-button primary" type="button" data-tstruct-action="hatcherTransfer" data-batch-id="${batch.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6M5 5v14" /></svg>
          <span>Transfer</span>
        </button>
      </article>
    `;
  }

  function renderBatches(query) {
    const search = (query || "").trim().toLowerCase();
    const visibleBatches = setterBatches.filter((batch) => {
      return !search || [batch.name, batch.id, batch.batchNo, batch.status, batch.setterNo]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

    houseGrid.innerHTML = visibleBatches.length
      ? visibleBatches.map(renderBatchCard).join("")
      : `<div class="empty-state">No setter batches found.</div>`;
  }

  document.addEventListener("click", function (event) {
    const refreshButton = event.target.closest("#refreshBtn");
    if (refreshButton) {
      reloadCurrentFrame();
      return;
    }

    const actionButton = event.target.closest("[data-tstruct-action]");
    if (actionButton) {
      const batch = setterBatches.find((item) => item.id === actionButton.dataset.batchId);
      openTstruct(actionButton.dataset.tstructAction, batch);
    }
  });

  document.addEventListener("input", function (event) {
    if (event.target && event.target.id === "batchSearch") {
      currentSearchValue = event.target.value;
      renderBatches(currentSearchValue);
    }
  });

  closeTstruct.addEventListener("click", closeTstructPanel);

  window.setterOps = {
    openTstruct,
    tstructs: AXPERT_TSTRUCTS,
    batches: setterBatches,
  };

  renderNavbar();
  renderBatches(currentSearchValue);
})();
