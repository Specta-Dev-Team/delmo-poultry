(function () {
  const AXPERT_TSTRUCT_OPTIONS = {
    basePath: "../../aspx/tstruct.aspx",
    openerIV: "",
    passContextInQuery: false,
  };

  const AXPERT_TSTRUCTS = {
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
    hatcherTransfer: { title: "Transfer To Hatcher", transid: "hatch" },
    candleTest: { title: "Candle Test", transid: "candl" },
    chickPullOut: { title: "Chick Pull Out", transid: "pullo" },
  };

  const QUICK_ENTRY_ACTIONS = [
    { key: "eggCollection", icon: "M4 9h16M5 9l2 10h10l2-10M8 6h8M9 13h.01M12 13h.01M15 13h.01" },
    { key: "mortality", icon: "M12 3 3 20h18L12 3zM12 9v5M12 17h.01" },
    { key: "feedMedication", icon: "M4 8h16M6 8l1 12h10l1-12M9 4h6M9 12h6M10 16h4" },
    { key: "bodyWeight", icon: "M7 20h10l-1-11H8L7 20zM9 9a3 3 0 0 1 6 0" },
    { key: "lighting", icon: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1.5 2 1.5 3h5c0-1 0.5-2 1.5-3a7 7 0 0 0-4-12z" },
    { key: "environment", icon: "M12 2v20M5 8a7 7 0 0 0 14 0M5 16a7 7 0 0 1 14 0" },
    { key: "water", icon: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" },
    // { key: "eggAllotment", icon: "M12 4c4 0 7 4 7 9a7 7 0 0 1-14 0c0-5 3-9 7-9z" },
    // { key: "hatcherTransfer", icon: "M5 12h14M13 6l6 6-6 6M5 5v14" },
    // { key: "candleTest", icon: "M12 3v5M8 8h8l-1 13h-6L8 8zM9 3h6" },
    // { key: "chickPullOut", icon: "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z" },
  ];

  const CHART_RANGES = {
    month: { label: "Monthly" },
    year: { label: "Yearly" },
  };

  const MONTH_OPTIONS = [
    { key: "2025-06", label: "Jun 2025" },
    { key: "2025-07", label: "Jul 2025" },
    { key: "2025-08", label: "Aug 2025" },
    { key: "2025-09", label: "Sep 2025" },
    { key: "2025-10", label: "Oct 2025" },
    { key: "2025-11", label: "Nov 2025" },
    { key: "2025-12", label: "Dec 2025" },
    { key: "2026-01", label: "Jan 2026" },
    { key: "2026-02", label: "Feb 2026" },
    { key: "2026-03", label: "Mar 2026" },
    { key: "2026-04", label: "Apr 2026" },
    { key: "2026-05", label: "May 2026" },
  ];

  const YEAR_OPTIONS = [
    { key: "2022", label: "2022" },
    { key: "2023", label: "2023" },
    { key: "2024", label: "2024" },
    { key: "2025", label: "2025" },
    { key: "2026", label: "2026" },
  ];

  const outGrowerHouses = [
    {
      id: "OGH001",
      code: "OGH001",
      name: "Out Grower House Alpha",
      stage: "Grower",
      farmerId: "farmer1",
      farmerName: "Farmer 1",
      status: "Active",
      users: 4,
      houseCost: 64000,
      batchId: "OG BATCH 001",
      flockAge: "42 weeks",
      birdsHoused: 4800,
      femaleBirds: 4320,
      maleBirds: 480,
      liveHens: 4320,
      totalEggsProduced: 3890,
      totalFeedGivenKg: 624,
      deadBirds: 1,
      totalBirds: 4800,
      sampledBirds: 240,
      birdsWithinTargetWeight: 218,
      mortalityToday: 1,
      trays: { standard: 5200, reject: 15 },
      weightKg: 1450,
      feedIndent: "OGIND000001",
      healthTasks: 2,
      metrics: {
        labels: ["04 May", "05 May", "06 May", "07 May", "08 May", "09 May", "10 May", "11 May"],
        birds: [4794, 4793, 4792, 4791, 4790, 4789, 4788, 4788],
        mortality: [1, 0, 1, 0, 1, 0, 1, 1],
        feedKg: [0.48, 0.52, 0.55, 0.58, 0.62, 0.65, 0.68, 0.7],
        bodyWeight: [960, 1000, 1040, 1080, 1120, 1160, 1200, 1235],
        trays: [5100, 5120, 5150, 5170, 5180, 5190, 5200, 5200],
      },
      schedules: [
        { id: 1, age: 18, date: "05/11/2026", name: "Out grower feed review", dose: "Batch", method: "Supervisor", description: "Weekly out grower feed allocation review", status: "Due today" },
      ],
    },
    {
      id: "OGH002",
      code: "OGH002",
      name: "Out Grower House Beta",
      stage: "Layer",
      farmerId: "farmer2",
      farmerName: "Farmer 2",
      status: "Active",
      users: 5,
      houseCost: 78500,
      batchId: "OG BATCH 002",
      flockAge: "48 weeks",
      birdsHoused: 5200,
      femaleBirds: 4680,
      maleBirds: 520,
      liveHens: 4680,
      totalEggsProduced: 4260,
      totalFeedGivenKg: 780,
      deadBirds: 2,
      totalBirds: 5200,
      sampledBirds: 260,
      birdsWithinTargetWeight: 237,
      mortalityToday: 2,
      trays: { standard: 6800, reject: 22 },
      weightKg: 2100,
      feedIndent: "OGIND000002",
      healthTasks: 1,
      metrics: {
        labels: ["04 May", "05 May", "06 May", "07 May", "08 May", "09 May", "10 May", "11 May"],
        birds: [5186, 5184, 5182, 5180, 5178, 5176, 5174, 5174],
        mortality: [2, 1, 2, 1, 2, 1, 2, 2],
        feedKg: [0.78, 0.82, 0.85, 0.88, 0.92, 0.95, 0.98, 1.0],
        bodyWeight: [1800, 1850, 1900, 1950, 2000, 2050, 2100, 2130],
        trays: [6680, 6700, 6720, 6750, 6770, 6780, 6800, 6800],
      },
      schedules: [
        { id: 1, age: 35, date: "05/12/2026", name: "Collection audit", dose: "Batch", method: "Supervisor", description: "Verify tray allocation and reject count", status: "Planned" },
      ],
    },
    {
      id: "OGH003",
      code: "OGH003",
      name: "Out Grower House Gamma",
      stage: "Grower",
      farmerId: "farmer3",
      farmerName: "Farmer 3",
      status: "Active",
      users: 3,
      houseCost: 71200,
      batchId: "OG BATCH 003",
      flockAge: "36 weeks",
      birdsHoused: 5000,
      femaleBirds: 4500,
      maleBirds: 500,
      liveHens: 4500,
      totalEggsProduced: 3720,
      totalFeedGivenKg: 690,
      deadBirds: 1,
      totalBirds: 5000,
      sampledBirds: 250,
      birdsWithinTargetWeight: 226,
      mortalityToday: 1,
      trays: { standard: 6100, reject: 18 },
      weightKg: 1760,
      feedIndent: "OGIND000003",
      healthTasks: 2,
      metrics: {
        labels: ["04 May", "05 May", "06 May", "07 May", "08 May", "09 May", "10 May", "11 May"],
        birds: [4996, 4995, 4994, 4993, 4992, 4991, 4990, 4990],
        mortality: [0, 1, 0, 1, 0, 1, 0, 1],
        feedKg: [0.62, 0.66, 0.68, 0.7, 0.72, 0.74, 0.76, 0.78],
        bodyWeight: [1420, 1460, 1505, 1540, 1580, 1620, 1660, 1695],
        trays: [5900, 5940, 5980, 6020, 6060, 6080, 6100, 6100],
      },
      schedules: [
        { id: 1, age: 28, date: "05/14/2026", name: "Uniformity sampling", dose: "Sample", method: "Supervisor", description: "Review weight spread before feed plan update", status: "Scheduled" },
      ],
    },
  ];

  const moduleCommand = document.getElementById("moduleCommand");
  const categoryFilterBar = document.getElementById("categoryFilterBar");
  const houseGrid = document.getElementById("houseGrid");
  const houseDetail = document.getElementById("houseDetail");
  const tstructPanel = document.getElementById("tstructPanel");
  const tstructFrame = document.getElementById("tstructFrame");
  const closeTstruct = document.getElementById("closeTstruct");
  let selectedHouseId = "";
  let selectedChartRange = "month";
  let selectedFarmer = "all";
  let currentSearchValue = "";
  let selectedMonthFrom = "2025-06";
  let selectedMonthTo = "2026-05";
  let selectedYearFrom = "2022";
  let selectedYearTo = "2026";

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    }).format(value);
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

  function renderListActions() {
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
            <button type="button" data-tstruct-action="batchCreation">Batch Creation</button>
            <button type="button" data-tstruct-action="feedMedication">Feed Consumption / Medication</button>
            <button type="button" data-tstruct-action="environment">Environment Monitoring</button>
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
        <h2>${house.name} <span class="house-code-pill">${house.code}</span></h2>
        <p>${house.batchId} / ${house.stage} / Feed indent: ${house.feedIndent}</p>
      </div>
      ${renderSearchControl()}
      <div class="command-actions">
        ${renderQuickEntryMenu(house)}
        <button class="command-button" type="button" data-tstruct-action="hatcherTransfer" data-house-id="${house.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6M5 5v14" /></svg>
          <span>Batch Transfer</span>
        </button>
      </div>
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

    if (AXPERT_TSTRUCT_OPTIONS.openerIV) {
      params.set("openerIV", AXPERT_TSTRUCT_OPTIONS.openerIV);
    }

    if (AXPERT_TSTRUCT_OPTIONS.passContextInQuery) {
      if (context && context.houseId) params.set("houseid", context.houseId);
      if (context && context.batchId) params.set("batchid", context.batchId);
      if (context && context.module) params.set("module", context.module);
    }

    return `${AXPERT_TSTRUCT_OPTIONS.basePath}?${params.toString()}`;
  }

  function openTstruct(actionKey, context) {
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;

    tstructFrame.src = buildTstructUrl(action.transid, context || { module: "outgrower" });
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
  }

  function closeTstructPanel() {
    tstructPanel.classList.remove("is-open");
    tstructPanel.setAttribute("aria-hidden", "true");
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
    return house.birdsHoused ? house.totalFeedGivenKg / house.birdsHoused : 0;
  }

  function mortalityRate(house) {
    return house.totalBirds ? (house.deadBirds / house.totalBirds) * 100 : 0;
  }

  function bodyWeightUniformity(house) {
    return house.sampledBirds ? (house.birdsWithinTargetWeight / house.sampledBirds) * 100 : 0;
  }

  function actionContext(house) {
    return {
      module: "outgrower",
      houseId: house ? house.id : "",
      batchId: house ? house.batchId : "",
    };
  }

  function svgIcon(path) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
  }

  function actionLabel(actionKey) {
    return AXPERT_TSTRUCTS[actionKey] ? AXPERT_TSTRUCTS[actionKey].title : actionKey;
  }

  function renderHouseCard(house) {
    return `
      <article class="house-card" data-house-id="${house.id}" role="button" tabindex="0">
        <div class="house-card-header">
          <div>
            <h3>
              <span>${house.name}</span>
              <span class="house-code-pill">${house.code}</span>
            </h3>
            <small>${house.stage} house</small>
          </div>
          <div class="house-tools">
            <div class="house-tag-row house-tag-row-primary">
              <span class="status-badge">${house.status}</span>
              <span class="batch-badge">${house.batchId}</span>
              <span class="flock-age-badge">Flock age: ${house.flockAge}</span>
            </div>
            <div class="house-tag-row">
              <span class="house-meta-tag">LKR House Cost: ${formatNumber(house.houseCost)}</span>
            </div>
            <details class="card-menu">
              <summary aria-label="House actions">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg>
              </summary>
              <div class="command-popover align-right">
                <button type="button" data-tstruct-action="batchCreation" data-house-id="${house.id}">Batch Creation</button>
                <button type="button" data-tstruct-action="eggCollection" data-house-id="${house.id}">Egg Collection</button>
                <button type="button" data-tstruct-action="mortality" data-house-id="${house.id}">Mortality</button>
                <button type="button" data-tstruct-action="feedMedication" data-house-id="${house.id}">Feed / Medication</button>
                <button type="button" data-tstruct-action="bodyWeight" data-house-id="${house.id}">Body Weight</button>
                <button type="button" data-tstruct-action="water" data-house-id="${house.id}">Water Consumption</button>
              </div>
            </details>
          </div>
        </div>
        <div class="metric-grid">
          ${metric("Batch No", house.batchId)}
          ${metric("Bird count", birdCountLabel(house))}
          ${metric("Egg Production", percentLabel(eggProductionPercent(house)))}
          ${metric("Feed / Bird", `${formatNumber(feedPerBird(house), 3)} kg`)}
          ${metric("Mortality Rate", percentLabel(mortalityRate(house)))}
          ${metric("Body Weight Uniformity", percentLabel(bodyWeightUniformity(house)))}
        </div>
      </article>
    `;
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
          ${QUICK_ENTRY_ACTIONS.map((action) => `
            <button class="entry-grid-option" type="button" data-tstruct-action="${action.key}" data-house-id="${house.id}">
              <span class="entry-grid-icon">${svgIcon(action.icon)}</span>
              <span>${actionLabel(action.key)}</span>
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

  function renderScheduleTable(house) {
    if (!house.schedules.length) {
      return `<div class="empty-state">No schedules assigned to this house.</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Age</th>
              <th>Sch. Date</th>
              <th>Name</th>
              <th>Dose</th>
              <th>Method</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${house.schedules
              .map((item) => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.age}</td>
                  <td>${item.date}</td>
                  <td>${item.name}</td>
                  <td>${item.dose}</td>
                  <td>${item.method}</td>
                  <td>${item.description}</td>
                  <td><span class="status-badge">${item.status}</span></td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderHouseDetail(houseId) {
    const house = outGrowerHouses.find((item) => item.id === houseId);
    if (!house) return;

    selectedHouseId = house.id;
    renderDetailNavbar(house);
    moduleCommand.hidden = false;
    categoryFilterBar.hidden = true;
    houseGrid.hidden = true;
    houseDetail.hidden = false;

    houseDetail.innerHTML = `
      <section class="context-strip">
        ${contextItem("Batch birds", formatNumber(house.birdsHoused), "M5 9c3 0 5-1 7-4 1 3 3 5 7 5-1 5-4 8-9 8H7l2-3c-3-1-4-3-4-6z")}
        ${contextItem("Body weight", `${formatNumber(house.weightKg, 3)} kg`, "M7 20h10l-1-11H8L7 20zM9 9a3 3 0 0 1 6 0")}
        ${contextItem("Health tasks", `${formatNumber(house.healthTasks)} open`, "M12 3 3 20h18L12 3zM12 9v5M12 17h.01")}
      </section>

      ${renderChartToolbar()}

      <section class="chart-grid">
        ${chartCard("birds", "Birds Housed", "Count (Nos)")}
        ${chartCard("mortality", "Mortality", "Count (Nos)")}
        ${chartCard("feedKg", "Feed Consumption", "Feed Consumption (kg)")}
        ${chartCard("bodyWeight", "Body Weight", "Average grams")}
      </section>

      <section class="table-panel">
        <div class="table-panel-header">
          <div>
            <h2>Schedules</h2>
            <p>Medication, monitoring, and review actions attached to this out grower batch.</p>
          </div>
          <button class="command-button" type="button" data-tstruct-action="feedMedication" data-house-id="${house.id}">Add Schedule</button>
        </div>
        ${renderScheduleTable(house)}
      </section>
    `;

    requestAnimationFrame(function () {
      drawHouseCharts(house);
    });
  }

  function renderHouseList() {
    selectedHouseId = "";
    renderListNavbar();
    moduleCommand.hidden = false;
    categoryFilterBar.hidden = false;
    houseGrid.hidden = false;
    houseDetail.hidden = true;
    houseDetail.innerHTML = "";
  }

  function renderHouses(query) {
    const search = (query || "").trim().toLowerCase();
    const visibleHouses = outGrowerHouses.filter((house) => {
      const matchesFarmer = selectedFarmer === "all" || house.farmerId === selectedFarmer;
      const matchesSearch = !search || [house.name, house.code, house.stage, house.batchId, house.status, house.farmerName]
        .join(" ")
        .toLowerCase()
        .includes(search);

      return matchesFarmer && matchesSearch;
    });

    document.getElementById("activeHouseCount").textContent = formatNumber(outGrowerHouses.filter((house) => house.status === "Active").length);
    document.getElementById("birdTotal").textContent = formatNumber(outGrowerHouses.reduce((sum, house) => sum + house.birdsHoused, 0));

    if (!visibleHouses.length) {
      houseGrid.innerHTML = `<div class="empty-state">No out grower houses found.</div>`;
      return;
    }

    houseGrid.innerHTML = visibleHouses.map(renderHouseCard).join("");
  }

  document.addEventListener("click", function (event) {
    const activeMenu = event.target.closest("details");
    closeOpenMenus(activeMenu);

    const refreshButton = event.target.closest("#refreshBtn");
    if (refreshButton) {
      reloadCurrentFrame();
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
      selectedFarmer = event.target.value;
      renderHouses(currentSearchValue);
    }
  });

  closeTstruct.addEventListener("click", closeTstructPanel);

  window.outGrowerOps = {
    openTstruct,
    openHouse: renderHouseDetail,
    backToHouses: function () {
      renderHouseList();
      renderHouses(currentSearchValue);
    },
    tstructs: AXPERT_TSTRUCTS,
    houses: outGrowerHouses,
  };

  renderHouseList();
  renderHouses(currentSearchValue);

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
    const baseValues = house.metrics[key];

    if (range === "month") {
      const months = getSelectedPeriodItems(MONTH_OPTIONS, selectedMonthFrom, selectedMonthTo);
      return {
        labels: months.map((item) => item.label),
        values: makeRangeValues(baseValues, key, range, months.length),
      };
    }

    if (range === "year") {
      const years = getSelectedPeriodItems(YEAR_OPTIONS, selectedYearFrom, selectedYearTo);
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


