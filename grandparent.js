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

  const AXPERT_DATASOURCES = {
    units: {
      name: "poultry_unit_filter",
      valueField: "locationcode",
      labelField: "locationname",
    },
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

  const grandparentHouses = [
    {
      id: "HUS001",
      code: "HUS001",
      name: "Parent House 001",
      stage: "Grower",
      status: "Active",
      users: 4,
      houseCost: 75000,
      batchId: "P BATCH 001",
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
      trays: {
        standard: 5200,
        reject: 15
      },
      weightKg: 1450,
      feedIndent: "IND000001",
      healthTasks: 2,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          4794,
          4793,
          4792,
          4791,
          4790,
          4789,
          4788,
          4788
        ],
        mortality: [
          1,
          0,
          1,
          0,
          1,
          0,
          1,
          1
        ],
        feedKg: [
          0.48,
          0.52,
          0.55,
          0.58,
          0.62,
          0.65,
          0.68,
          0.7
        ],
        bodyWeight: [
          960,
          1000,
          1040,
          1080,
          1120,
          1160,
          1200,
          1235
        ],
        trays: [
          5100,
          5120,
          5150,
          5170,
          5180,
          5190,
          5200,
          5200
        ]
      },
      schedules: [
        {
          id: 1,
          age: 18,
          date: "05/11/2026",
          name: "Parent feed review",
          dose: "Batch",
          method: "Supervisor",
          description: "Weekly parent stock feed allocation review",
          status: "Due today"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS002",
      code: "HUS002",
      name: "Parent House 002",
      stage: "Layer",
      status: "Active",
      users: 5,
      houseCost: 82000,
      batchId: "P BATCH 002",
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
      trays: {
        standard: 6800,
        reject: 22
      },
      weightKg: 2100,
      feedIndent: "IND000002",
      healthTasks: 1,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          5186,
          5184,
          5182,
          5180,
          5178,
          5176,
          5174,
          5174
        ],
        mortality: [
          2,
          1,
          2,
          1,
          2,
          1,
          2,
          2
        ],
        feedKg: [
          0.78,
          0.82,
          0.85,
          0.88,
          0.92,
          0.95,
          0.98,
          1
        ],
        bodyWeight: [
          1800,
          1850,
          1900,
          1950,
          2000,
          2050,
          2100,
          2130
        ],
        trays: [
          6680,
          6700,
          6720,
          6750,
          6770,
          6780,
          6800,
          6800
        ]
      },
      schedules: [
        {
          id: 1,
          age: 35,
          date: "05/12/2026",
          name: "Egg collection audit",
          dose: "Batch",
          method: "Supervisor",
          description: "Verify tray allocation and reject count",
          status: "Planned"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS003",
      code: "HUS003",
      name: "Parent House 003",
      stage: "Grower",
      status: "Active",
      users: 3,
      houseCost: 69500,
      batchId: "P BATCH 003",
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
      trays: {
        standard: 6100,
        reject: 18
      },
      weightKg: 1760,
      feedIndent: "IND000003",
      healthTasks: 2,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          4996,
          4995,
          4994,
          4993,
          4992,
          4991,
          4990,
          4990
        ],
        mortality: [
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          1
        ],
        feedKg: [
          0.62,
          0.66,
          0.68,
          0.7,
          0.72,
          0.74,
          0.76,
          0.78
        ],
        bodyWeight: [
          1420,
          1460,
          1505,
          1540,
          1580,
          1620,
          1660,
          1695
        ],
        trays: [
          5900,
          5940,
          5980,
          6020,
          6060,
          6080,
          6100,
          6100
        ]
      },
      schedules: [
        {
          id: 1,
          age: 28,
          date: "05/14/2026",
          name: "Uniformity sampling",
          dose: "Sample",
          method: "Supervisor",
          description: "Review weight spread before feed plan update",
          status: "Scheduled"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS004",
      code: "HUS004",
      name: "Parent House 004",
      stage: "Grower",
      status: "Active",
      users: 4,
      houseCost: 75000,
      batchId: "P BATCH 001",
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
      trays: {
        standard: 5200,
        reject: 15
      },
      weightKg: 1450,
      feedIndent: "IND000001",
      healthTasks: 2,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          4794,
          4793,
          4792,
          4791,
          4790,
          4789,
          4788,
          4788
        ],
        mortality: [
          1,
          0,
          1,
          0,
          1,
          0,
          1,
          1
        ],
        feedKg: [
          0.48,
          0.52,
          0.55,
          0.58,
          0.62,
          0.65,
          0.68,
          0.7
        ],
        bodyWeight: [
          960,
          1000,
          1040,
          1080,
          1120,
          1160,
          1200,
          1235
        ],
        trays: [
          5100,
          5120,
          5150,
          5170,
          5180,
          5190,
          5200,
          5200
        ]
      },
      schedules: [
        {
          id: 1,
          age: 18,
          date: "05/11/2026",
          name: "Parent feed review",
          dose: "Batch",
          method: "Supervisor",
          description: "Weekly parent stock feed allocation review",
          status: "Due today"
        }
      ],
      unit: "WPO"
    },
    {
      id: "HUS005",
      code: "HUS005",
      name: "Parent House 005",
      stage: "Layer",
      status: "Active",
      users: 5,
      houseCost: 82000,
      batchId: "P BATCH 002",
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
      trays: {
        standard: 6800,
        reject: 22
      },
      weightKg: 2100,
      feedIndent: "IND000002",
      healthTasks: 1,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          5186,
          5184,
          5182,
          5180,
          5178,
          5176,
          5174,
          5174
        ],
        mortality: [
          2,
          1,
          2,
          1,
          2,
          1,
          2,
          2
        ],
        feedKg: [
          0.78,
          0.82,
          0.85,
          0.88,
          0.92,
          0.95,
          0.98,
          1
        ],
        bodyWeight: [
          1800,
          1850,
          1900,
          1950,
          2000,
          2050,
          2100,
          2130
        ],
        trays: [
          6680,
          6700,
          6720,
          6750,
          6770,
          6780,
          6800,
          6800
        ]
      },
      schedules: [
        {
          id: 1,
          age: 35,
          date: "05/12/2026",
          name: "Egg collection audit",
          dose: "Batch",
          method: "Supervisor",
          description: "Verify tray allocation and reject count",
          status: "Planned"
        }
      ],
      unit: "WPO"
    },
    {
      id: "HUS006",
      code: "HUS006",
      name: "Parent House 006",
      stage: "Grower",
      status: "Active",
      users: 3,
      houseCost: 69500,
      batchId: "P BATCH 003",
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
      trays: {
        standard: 6100,
        reject: 18
      },
      weightKg: 1760,
      feedIndent: "IND000003",
      healthTasks: 2,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          4996,
          4995,
          4994,
          4993,
          4992,
          4991,
          4990,
          4990
        ],
        mortality: [
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          1
        ],
        feedKg: [
          0.62,
          0.66,
          0.68,
          0.7,
          0.72,
          0.74,
          0.76,
          0.78
        ],
        bodyWeight: [
          1420,
          1460,
          1505,
          1540,
          1580,
          1620,
          1660,
          1695
        ],
        trays: [
          5900,
          5940,
          5980,
          6020,
          6060,
          6080,
          6100,
          6100
        ]
      },
      schedules: [
        {
          id: 1,
          age: 28,
          date: "05/14/2026",
          name: "Uniformity sampling",
          dose: "Sample",
          method: "Supervisor",
          description: "Review weight spread before feed plan update",
          status: "Scheduled"
        }
      ],
      unit: "WPO"
    },
    {
      id: "HUS007",
      code: "HUS007",
      name: "Parent House 007",
      stage: "Grower",
      status: "Active",
      users: 4,
      houseCost: 75000,
      batchId: "P BATCH 001",
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
      trays: {
        standard: 5200,
        reject: 15
      },
      weightKg: 1450,
      feedIndent: "IND000001",
      healthTasks: 2,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          4794,
          4793,
          4792,
          4791,
          4790,
          4789,
          4788,
          4788
        ],
        mortality: [
          1,
          0,
          1,
          0,
          1,
          0,
          1,
          1
        ],
        feedKg: [
          0.48,
          0.52,
          0.55,
          0.58,
          0.62,
          0.65,
          0.68,
          0.7
        ],
        bodyWeight: [
          960,
          1000,
          1040,
          1080,
          1120,
          1160,
          1200,
          1235
        ],
        trays: [
          5100,
          5120,
          5150,
          5170,
          5180,
          5190,
          5200,
          5200
        ]
      },
      schedules: [
        {
          id: 1,
          age: 18,
          date: "05/11/2026",
          name: "Parent feed review",
          dose: "Batch",
          method: "Supervisor",
          description: "Weekly parent stock feed allocation review",
          status: "Due today"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS008",
      code: "HUS008",
      name: "Parent House 008",
      stage: "Layer",
      status: "Active",
      users: 5,
      houseCost: 82000,
      batchId: "P BATCH 002",
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
      trays: {
        standard: 6800,
        reject: 22
      },
      weightKg: 2100,
      feedIndent: "IND000002",
      healthTasks: 1,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          5186,
          5184,
          5182,
          5180,
          5178,
          5176,
          5174,
          5174
        ],
        mortality: [
          2,
          1,
          2,
          1,
          2,
          1,
          2,
          2
        ],
        feedKg: [
          0.78,
          0.82,
          0.85,
          0.88,
          0.92,
          0.95,
          0.98,
          1
        ],
        bodyWeight: [
          1800,
          1850,
          1900,
          1950,
          2000,
          2050,
          2100,
          2130
        ],
        trays: [
          6680,
          6700,
          6720,
          6750,
          6770,
          6780,
          6800,
          6800
        ]
      },
      schedules: [
        {
          id: 1,
          age: 35,
          date: "05/12/2026",
          name: "Egg collection audit",
          dose: "Batch",
          method: "Supervisor",
          description: "Verify tray allocation and reject count",
          status: "Planned"
        }
      ],
      unit: "WPO"
    },
    {
      id: "HUS009",
      code: "HUS009",
      name: "Parent House 009",
      stage: "Grower",
      status: "Active",
      users: 3,
      houseCost: 69500,
      batchId: "P BATCH 003",
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
      trays: {
        standard: 6100,
        reject: 18
      },
      weightKg: 1760,
      feedIndent: "IND000003",
      healthTasks: 2,
      metrics: {
        labels: [
          "04 May",
          "05 May",
          "06 May",
          "07 May",
          "08 May",
          "09 May",
          "10 May",
          "11 May"
        ],
        birds: [
          4996,
          4995,
          4994,
          4993,
          4992,
          4991,
          4990,
          4990
        ],
        mortality: [
          0,
          1,
          0,
          1,
          0,
          1,
          0,
          1
        ],
        feedKg: [
          0.62,
          0.66,
          0.68,
          0.7,
          0.72,
          0.74,
          0.76,
          0.78
        ],
        bodyWeight: [
          1420,
          1460,
          1505,
          1540,
          1580,
          1620,
          1660,
          1695
        ],
        trays: [
          5900,
          5940,
          5980,
          6020,
          6060,
          6080,
          6100,
          6100
        ]
      },
      schedules: [
        {
          id: 1,
          age: 28,
          date: "05/14/2026",
          name: "Uniformity sampling",
          dose: "Sample",
          method: "Supervisor",
          description: "Review weight spread before feed plan update",
          status: "Scheduled"
        }
      ],
      unit: "WPA"
    }
  ];

  grandparentHouses.forEach(function (house) {
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadUnitOptionsFromDataSource() {
    try {
      if (!window.GrandparentAPI || typeof window.GrandparentAPI.loadUnitOptions !== "function") return;
      const mappedUnits = await window.GrandparentAPI.loadUnitOptions();
      if (!mappedUnits.length) return;

      unitOptions = mappedUnits;
      unitsLoadedFromDataSource = true;
      updateUnitFilters();
    } catch (error) {
      console.warn("[Grand Parent Operations] Failed to load units from GrandparentAPI.", error);
    }
  }

  async function loadHousesFromDataSource() {
    try {
      if (!window.GrandparentAPI || typeof window.GrandparentAPI.loadHouses !== "function") return;
      const dataSourceHouses = await window.GrandparentAPI.loadHouses();
      if (!dataSourceHouses.length) return;

      dataSourceHouses.forEach(function (house) {
        house.stage = house.stage || getHouseStage(house);
      });

      grandparentHouses.splice(0, grandparentHouses.length, ...dataSourceHouses);

      if (selectedHouseId && !grandparentHouses.some((house) => house.id === selectedHouseId)) {
        selectedHouseId = "";
      }

      if (selectedHouseId) {
        renderHouseDetail(selectedHouseId, { skipDataLoad: true });
      } else {
        renderHouseList();
        renderHouses(currentSearchValue);
      }
    } catch (error) {
      console.warn("[Grand Parent Operations] Failed to load houses from GrandparentAPI.", error);
    }
  }

  function getCurrentChartParameters(house) {
    const rangeType = selectedChartRange === "year" ? "year" : "month";
    return {
      house_id: house.id,
      batch_id: house.batchId,
      range_type: rangeType,
      from_period: rangeType === "month" ? selectedMonthFrom : selectedYearFrom,
      to_period: rangeType === "month" ? selectedMonthTo : selectedYearTo,
    };
  }

  function hasChartRows(metrics) {
    return metrics && Array.isArray(metrics.labels) && metrics.labels.length > 0;
  }

  async function loadHouseDetailData(house) {
    if (!window.GrandparentAPI) return;

    let shouldRender = false;

    try {
      if (typeof window.GrandparentAPI.loadSchedules === "function") {
        const schedules = await window.GrandparentAPI.loadSchedules({ house_id: house.id, batch_id: house.batchId });
        if (schedules.length) {
          house.schedules = schedules;
          shouldRender = true;
        }
      }
    } catch (error) {
      console.warn("[Grand Parent Operations] Failed to load schedules from GrandparentAPI.", error);
    }

    try {
      if (typeof window.GrandparentAPI.loadCharts === "function") {
        const chartMetrics = await window.GrandparentAPI.loadCharts(getCurrentChartParameters(house));
        if (hasChartRows(chartMetrics)) {
          house.metrics = chartMetrics;
          shouldRender = true;
        }
      }
    } catch (error) {
      console.warn("[Grand Parent Operations] Failed to load charts from GrandparentAPI.", error);
    }

    if (shouldRender && selectedHouseId === house.id) {
      renderHouseDetail(house.id, { skipDataLoad: true });
    }
  }

  async function loadScreenDataFromDataSource() {
    await loadUnitOptionsFromDataSource();
    await loadHousesFromDataSource();
    if (selectedHouseId) {
      const house = grandparentHouses.find((item) => item.id === selectedHouseId);
      if (house) loadHouseDetailData(house);
    }
  }

  window.addEventListener("GrandparentAPIReady", loadScreenDataFromDataSource);

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
        <h2>Grand Parent Operations</h2>
        <p><span id="activeHouseCount">${formatNumber(grandparentHouses.filter((house) => house.status === "Active").length)}</span> active houses / <span id="birdTotal">${formatNumber(grandparentHouses.reduce((sum, house) => sum + house.birdsHoused, 0))}</span> birds housed</p>
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
          Grand Parent Operations
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

    tstructFrame.src = buildTstructUrl(action.transid, context || { module: "grandparent" });
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
      module: "grandparent",
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
          ${metric("Placement Date", getHousePlacementDate(house))}
          ${metric("Feed / Bird", `${formatNumber(feedPerBird(house), 3)} kg`)}
          ${metric("Mortality Rate", percentLabel(mortalityRate(house)))}
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

  function renderHouseDetail(houseId, options) {
    const house = grandparentHouses.find((item) => item.id === houseId);
    if (!house) return;

    selectedHouseId = house.id;
    renderDetailNavbar(house);
    moduleCommand.hidden = false;
    unitFilterBar.hidden = true;
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
            <p>Medication, monitoring, and review actions attached to this parent batch.</p>
          </div>
          <button class="command-button" type="button" data-tstruct-action="feedMedication" data-house-id="${house.id}">Add Schedule</button>
        </div>
        ${renderScheduleTable(house)}
      </section>
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
    renderListNavbar();
    moduleCommand.hidden = false;
    unitFilterBar.hidden = false;
    houseGrid.hidden = false;
    houseDetail.hidden = true;
    houseDetail.innerHTML = "";
  }

  function getMockUnitOptions() {
    return [
      { value: "WPA", label: "WARADALA POULTRY" },
      { value: "WPO", label: "WARADALA PULLOUT" }
    ];
  }

  function getActiveUnitOptions() {
    return unitOptions.length ? unitOptions : getMockUnitOptions();
  }

  function getHouseUnitValue(house) {
    return house.unit || "";
  }

  function getHouseUnitLabel(house) {
    if (!unitsLoadedFromDataSource) {
      const fallbackOpt = getMockUnitOptions().find(function (opt) {
        return opt.value === house.unit;
      });
      return fallbackOpt ? fallbackOpt.label : house.unit || "";
    }
    const option = unitOptions.find(function (opt) {
      return opt.value === house.unit;
    });
    return option ? option.label : house.unit || "";
  }

  function houseMatchesSelectedUnit(house) {
    if (selectedUnit === "all") return true;
    return getHouseUnitValue(house) === selectedUnit;
  }

  function updateUnitFilters() {
    const unitSelect = document.getElementById("unitSelect");
    if (!unitSelect) return;

    const options = getActiveUnitOptions();

    const unitCounts = {};
    grandparentHouses.forEach(function (house) {
      const key = getHouseUnitValue(house);
      if (key) unitCounts[key] = (unitCounts[key] || 0) + 1;
    });

    if (selectedUnit !== "all" && !options.some(function (opt) { return opt.value === selectedUnit; })) {
      selectedUnit = "all";
    }

    unitSelect.innerHTML = '<option value="all">All Units (' + grandparentHouses.length + ')</option>' +
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
    const visibleHouses = grandparentHouses.filter(function (house) {
      var matchesUnit = houseMatchesSelectedUnit(house);
      var matchesSearch = !search || [house.name, house.code, house.stage, house.batchId, house.status, getHouseUnitLabel(house)]
        .join(" ")
        .toLowerCase()
        .includes(search);
      return matchesUnit && matchesSearch;
    });

    document.getElementById("activeHouseCount").textContent = formatNumber(grandparentHouses.filter(function (h) { return h.status === "Active"; }).length);
    document.getElementById("birdTotal").textContent = formatNumber(grandparentHouses.reduce(function (sum, h) { return sum + h.birdsHoused; }, 0));
    updateUnitFilters();

    if (!visibleHouses.length) {
      houseGrid.innerHTML = '<div class="empty-state">No parent houses found.</div>';
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
      houseGrid.innerHTML = html;
    } else {
      houseGrid.innerHTML = visibleHouses.map(renderHouseCard).join("");
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
      const house = grandparentHouses.find((item) => item.id === houseId);
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

  window.grandparentOps = {
    openTstruct,
    openHouse: renderHouseDetail,
    reloadUnits: loadUnitOptionsFromDataSource,
    reloadData: loadScreenDataFromDataSource,
    backToHouses: function () {
      renderHouseList();
      renderHouses(currentSearchValue);
    },
    tstructs: AXPERT_TSTRUCTS,
    dataSources: AXPERT_DATASOURCES,
    houses: grandparentHouses,
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

  function getChartSeries(house, key, range) {
    const baseValues = house.metrics[key];

    if (range === "month") {
      const months = getSelectedPeriodItems(MONTH_OPTIONS, selectedMonthFrom, selectedMonthTo);
      if (house.metrics.fromDataSource && house.metrics.labels && baseValues.length === house.metrics.labels.length) {
        return { labels: house.metrics.labels, values: baseValues };
      }
      return {
        labels: months.map((item) => item.label),
        values: makeRangeValues(baseValues, key, range, months.length),
      };
    }

    if (range === "year") {
      const years = getSelectedPeriodItems(YEAR_OPTIONS, selectedYearFrom, selectedYearTo);
      if (house.metrics.fromDataSource && house.metrics.labels && baseValues.length === house.metrics.labels.length) {
        return { labels: house.metrics.labels, values: baseValues };
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

// ---- Merged Axpert datasource API from grandparentapi.js ----
(function () {
  const AXPERT_DATASOURCES = {
    units: {
      name: "poultry_unit_filter",
      valueField: "locationcode",
      labelField: "locationname",
    },
    houses: { name: "poultry_grandparent_houses" },
    charts: { name: "poultry_grandparent_charts" },
    schedules: { name: "poultry_grandparent_schedules" },
  };

  function getAxpertWindows() {
    const windows = [window];

    try {
      if (window.parent && window.parent !== window) windows.push(window.parent);
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

  function normalizeDataSourceRows(payload) {
    const parsed = parseMaybeJson(payload);

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === "object") {
      const nestedKeys = ["rows", "data", "result", "Result", "records", "Table", "table", "d"];
      for (const key of nestedKeys) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          const nestedRows = normalizeDataSourceRows(parsed[key]);
          if (nestedRows.length) return nestedRows;
        }
      }
    }

    return [];
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
        const rows = normalizeDataSourceRows(storeValue);
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

  function callAxpertDataSourceFunction(dataSourceName, parameters) {
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
        rows = normalizeDataSourceRows(await callAxpertDataSourceFunction(dataSourceName, parameters));
      } catch (error) {
        console.warn(`[Grandparent API] Unable to call Axpert data source '${dataSourceName}'.`, error);
      }
    }

    return rows;
  }

  function toNumber(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function mapHouseRow(row) {
    const id = getRowValue(row, ["id", "houseId", "house_id"]);
    const code = getRowValue(row, ["code", "houseCode", "house_code"]);
    const batchId = getRowValue(row, ["batchId", "batch_id", "batch"]);

    return {
      unit: getRowValue(row, ["unit", "locationcode", "locationCode"]),
      id: id || code,
      code: code || id,
      name: getRowValue(row, ["name", "houseName", "house_name"]) || code || id,
      stage: getRowValue(row, ["stage", "category"]),
      status: getRowValue(row, ["status"]) || "Active",
      batchId,
      flockAge: getRowValue(row, ["flockAge", "flock_age", "age"]) || "0 days",
      birdsHoused: toNumber(getRowValue(row, ["birdsHoused", "birds_housed"])),
      femaleBirds: toNumber(getRowValue(row, ["femaleBirds", "female_birds"])),
      maleBirds: toNumber(getRowValue(row, ["maleBirds", "male_birds"])),
      liveHens: toNumber(getRowValue(row, ["liveHens", "live_hens"])),
      totalEggsProduced: toNumber(getRowValue(row, ["totalEggsProduced", "total_eggs_produced"])),
      totalFeedGivenKg: toNumber(getRowValue(row, ["totalFeedGivenKg", "total_feed_given_kg"])),
      deadBirds: toNumber(getRowValue(row, ["deadBirds", "dead_birds"])),
      totalBirds: toNumber(getRowValue(row, ["totalBirds", "total_birds"])),
      sampledBirds: toNumber(getRowValue(row, ["sampledBirds", "sampled_birds"])),
      birdsWithinTargetWeight: toNumber(getRowValue(row, ["birdsWithinTargetWeight", "birds_within_target_weight"])),
      mortalityToday: toNumber(getRowValue(row, ["deadBirds", "mortalityToday", "mortality_today"])),
      trays: { standard: 0, reject: 0 },
      weightKg: toNumber(getRowValue(row, ["weightKg", "weight_kg"])),
      feedIndent: getRowValue(row, ["feedIndent", "feed_indent"]),
      healthTasks: toNumber(getRowValue(row, ["healthTasks", "health_tasks"])),
      placementDate: getRowValue(row, ["placementDate", "placement_date"]),
      houseCost: toNumber(getRowValue(row, ["houseCost", "house_cost"])),
      metrics: { labels: [], birds: [], mortality: [], feedKg: [], bodyWeight: [] },
      schedules: [],
    };
  }

  function mapChartRows(rows) {
    return {
      fromDataSource: true,
      labels: rows.map((row) => getRowValue(row, ["periodLabel", "period_label", "label"])),
      birds: rows.map((row) => toNumber(getRowValue(row, ["birds"]))),
      mortality: rows.map((row) => toNumber(getRowValue(row, ["mortality"]))),
      feedKg: rows.map((row) => toNumber(getRowValue(row, ["feedKg", "feed_kg"]))),
      bodyWeight: rows.map((row) => toNumber(getRowValue(row, ["bodyWeight", "body_weight"]))),
    };
  }

  function mapScheduleRow(row) {
    return {
      id: getRowValue(row, ["id"]) || "",
      age: getRowValue(row, ["age"]) || "",
      date: getRowValue(row, ["date", "scheduleDate", "schedule_date"]) || "",
      name: getRowValue(row, ["name"]) || "",
      dose: getRowValue(row, ["dose"]) || "",
      method: getRowValue(row, ["method"]) || "",
      description: getRowValue(row, ["description"]) || "",
      status: getRowValue(row, ["status"]) || "",
    };
  }

  async function loadUnitOptions() {
    const dataSourceName = AXPERT_DATASOURCES.units.name;
    const rows = await loadRows(dataSourceName);

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

  async function loadHouses() {
    return (await loadRows(AXPERT_DATASOURCES.houses.name)).map(mapHouseRow).filter((house) => house.id);
  }

  async function loadCharts(parameters) {
    return mapChartRows(await loadRows(AXPERT_DATASOURCES.charts.name, parameters));
  }

  async function loadSchedules(parameters) {
    return (await loadRows(AXPERT_DATASOURCES.schedules.name, parameters)).map(mapScheduleRow);
  }

  window.GrandparentAPI = {
    loadUnitOptions: loadUnitOptions,
    loadHouses: loadHouses,
    loadCharts: loadCharts,
    loadSchedules: loadSchedules,
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

  window.dispatchEvent(new CustomEvent("GrandparentAPIReady", { detail: window.GrandparentAPI }));
})();



