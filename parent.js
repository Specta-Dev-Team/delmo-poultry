(function () {
  const CONFIG = {
    key: "parent",
    title: "Parent Operations",
    listLabel: "Parent houses",
    emptyLabel: "No parent houses found.",
    scheduleCopy: "Medication, monitoring, and review actions attached to this parent batch.",
    exposeName: "parentOps",
    tstructOptions: {
      basePath: "../../aspx/tstruct.aspx",
      openerIV: "",
      passContextInQuery: false,
    },
    cardActions: ["batchCreation", "eggCollection", "mortality", "feedMedication", "bodyWeight", "water", "eggAllotment"],
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

  const houses = [
    {
      id: "HUS001",
      code: "HUS001",
      name: "Parent Brooding House",
      stage: "Brooding",
      status: "Active",
      users: 4,
      houseCost: 0,
      batchId: "BR BATCH 001",
      flockAge: "26 weeks",
      feedIndent: "IND000002",
      birdsHoused: 5100,
      femaleBirds: 4590,
      maleBirds: 510,
      liveHens: 4590,
      totalEggsProduced: 0,
      totalFeedGivenKg: 612,
      deadBirds: 0,
      totalBirds: 5100,
      sampledBirds: 260,
      birdsWithinTargetWeight: 238,
      mortalityToday: 0,
      trays: {
        standard: 5710,
        reject: 10
      },
      weightKg: 1100,
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
          5100,
          5100,
          5100,
          5100,
          5100,
          5100,
          5100,
          5100
        ],
        mortality: [
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          0
        ],
        feedKg: [
          0.18,
          0.22,
          0.24,
          0.27,
          0.3,
          0.32,
          0.33,
          0.34
        ],
        bodyWeight: [
          74,
          80,
          86,
          92,
          98,
          105,
          112,
          118
        ],
        trays: [
          5690,
          5695,
          5700,
          5704,
          5708,
          5710,
          5710,
          5710
        ]
      },
      schedules: [
        {
          id: 1,
          age: 5,
          date: "05/03/2026",
          name: "Some medication",
          dose: "1",
          method: "Eye drops",
          description: "Starter health protocol",
          status: "Due today"
        },
        {
          id: 2,
          age: 7,
          date: "05/05/2026",
          name: "Body weight sample",
          dose: "10 birds",
          method: "Scale",
          description: "Weekly parent weight reading",
          status: "Planned"
        },
        {
          id: 3,
          age: 10,
          date: "05/08/2026",
          name: "ND vaccine review",
          dose: "Batch",
          method: "Water line",
          description: "Verify intake before dosing",
          status: "Planned"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS002",
      code: "HUS002",
      name: "Parent Grower Annex",
      stage: "Grower",
      status: "Active",
      users: 3,
      houseCost: 0,
      batchId: "BR BATCH 002",
      flockAge: "18 weeks",
      feedIndent: "IND000004",
      birdsHoused: 5150,
      femaleBirds: 4635,
      maleBirds: 515,
      liveHens: 4635,
      totalEggsProduced: 0,
      totalFeedGivenKg: 566.5,
      deadBirds: 1,
      totalBirds: 5150,
      sampledBirds: 250,
      birdsWithinTargetWeight: 224,
      mortalityToday: 1,
      trays: {
        standard: 200,
        reject: 0
      },
      weightKg: 1080,
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
          5157,
          5157,
          5156,
          5155,
          5154,
          5152,
          5151,
          5150
        ],
        mortality: [
          1,
          0,
          1,
          1,
          1,
          2,
          1,
          1
        ],
        feedKg: [
          0.23,
          0.26,
          0.28,
          0.3,
          0.31,
          0.33,
          0.35,
          0.37
        ],
        bodyWeight: [
          86,
          92,
          99,
          106,
          113,
          121,
          128,
          136
        ],
        trays: [
          196,
          197,
          198,
          198,
          199,
          199,
          200,
          200
        ]
      },
      schedules: [
        {
          id: 1,
          age: 8,
          date: "05/06/2026",
          name: "Feed allocation review",
          dose: "Batch",
          method: "Supervisor",
          description: "Compare feed curve against parent target",
          status: "Due"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS003",
      code: "HUS003",
      name: "Parent Pre Layer House",
      stage: "Pre Layer",
      status: "Active",
      users: 5,
      houseCost: 68400,
      batchId: "GP BATCH 014",
      flockAge: "44 weeks",
      feedIndent: "IND000009",
      birdsHoused: 8200,
      femaleBirds: 7380,
      maleBirds: 820,
      liveHens: 7380,
      totalEggsProduced: 6620,
      totalFeedGivenKg: 1107,
      deadBirds: 2,
      totalBirds: 8200,
      sampledBirds: 320,
      birdsWithinTargetWeight: 294,
      mortalityToday: 2,
      trays: {
        standard: 1960,
        reject: 18
      },
      weightKg: 1740,
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
          8204,
          8202,
          8200,
          8200,
          8200,
          8200,
          8200,
          8200
        ],
        mortality: [
          2,
          2,
          0,
          0,
          0,
          0,
          0,
          2
        ],
        feedKg: [
          0.55,
          0.57,
          0.58,
          0.6,
          0.62,
          0.64,
          0.65,
          0.66
        ],
        bodyWeight: [
          261,
          270,
          279,
          288,
          296,
          305,
          313,
          321
        ],
        trays: [
          1904,
          1918,
          1930,
          1942,
          1950,
          1955,
          1958,
          1960
        ]
      },
      schedules: [
        {
          id: 1,
          age: 32,
          date: "05/11/2026",
          name: "Uniformity check",
          dose: "7% sample",
          method: "Manual scale",
          description: "Record male and female weights",
          status: "Due today"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS004",
      code: "HUS004",
      name: "Parent Layer House",
      stage: "Layer",
      status: "Active",
      users: 5,
      houseCost: 72000,
      batchId: "GP BATCH 015",
      flockAge: "48 weeks",
      feedIndent: "IND000010",
      birdsHoused: 7900,
      femaleBirds: 7110,
      maleBirds: 790,
      liveHens: 7110,
      totalEggsProduced: 6420,
      totalFeedGivenKg: 1082.3,
      deadBirds: 2,
      totalBirds: 7900,
      sampledBirds: 315,
      birdsWithinTargetWeight: 286,
      mortalityToday: 2,
      trays: {
        standard: 1880,
        reject: 16
      },
      weightKg: 1760,
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
          7908,
          7906,
          7904,
          7902,
          7900,
          7900,
          7900,
          7900
        ],
        mortality: [
          1,
          2,
          1,
          2,
          2,
          1,
          2,
          2
        ],
        feedKg: [
          0.56,
          0.58,
          0.6,
          0.62,
          0.64,
          0.66,
          0.67,
          0.68
        ],
        bodyWeight: [
          268,
          276,
          284,
          293,
          301,
          310,
          318,
          328
        ],
        trays: [
          1820,
          1830,
          1842,
          1855,
          1864,
          1872,
          1878,
          1880
        ]
      },
      schedules: [
        {
          id: 1,
          age: 36,
          date: "05/13/2026",
          name: "Layer production check",
          dose: "Batch",
          method: "Supervisor",
          description: "Review egg production and reject trays",
          status: "Planned"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS005",
      code: "HUS005",
      name: "Parent Brooding House",
      stage: "Brooding",
      status: "Active",
      users: 4,
      houseCost: 0,
      batchId: "BR BATCH 001",
      flockAge: "26 weeks",
      feedIndent: "IND000002",
      birdsHoused: 5100,
      femaleBirds: 4590,
      maleBirds: 510,
      liveHens: 4590,
      totalEggsProduced: 0,
      totalFeedGivenKg: 612,
      deadBirds: 0,
      totalBirds: 5100,
      sampledBirds: 260,
      birdsWithinTargetWeight: 238,
      mortalityToday: 0,
      trays: {
        standard: 5710,
        reject: 10
      },
      weightKg: 1100,
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
          5100,
          5100,
          5100,
          5100,
          5100,
          5100,
          5100,
          5100
        ],
        mortality: [
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          0
        ],
        feedKg: [
          0.18,
          0.22,
          0.24,
          0.27,
          0.3,
          0.32,
          0.33,
          0.34
        ],
        bodyWeight: [
          74,
          80,
          86,
          92,
          98,
          105,
          112,
          118
        ],
        trays: [
          5690,
          5695,
          5700,
          5704,
          5708,
          5710,
          5710,
          5710
        ]
      },
      schedules: [
        {
          id: 1,
          age: 5,
          date: "05/03/2026",
          name: "Some medication",
          dose: "1",
          method: "Eye drops",
          description: "Starter health protocol",
          status: "Due today"
        },
        {
          id: 2,
          age: 7,
          date: "05/05/2026",
          name: "Body weight sample",
          dose: "10 birds",
          method: "Scale",
          description: "Weekly parent weight reading",
          status: "Planned"
        },
        {
          id: 3,
          age: 10,
          date: "05/08/2026",
          name: "ND vaccine review",
          dose: "Batch",
          method: "Water line",
          description: "Verify intake before dosing",
          status: "Planned"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS006",
      code: "HUS006",
      name: "Parent Grower Annex",
      stage: "Grower",
      status: "Active",
      users: 3,
      houseCost: 0,
      batchId: "BR BATCH 002",
      flockAge: "18 weeks",
      feedIndent: "IND000004",
      birdsHoused: 5150,
      femaleBirds: 4635,
      maleBirds: 515,
      liveHens: 4635,
      totalEggsProduced: 0,
      totalFeedGivenKg: 566.5,
      deadBirds: 1,
      totalBirds: 5150,
      sampledBirds: 250,
      birdsWithinTargetWeight: 224,
      mortalityToday: 1,
      trays: {
        standard: 200,
        reject: 0
      },
      weightKg: 1080,
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
          5157,
          5157,
          5156,
          5155,
          5154,
          5152,
          5151,
          5150
        ],
        mortality: [
          1,
          0,
          1,
          1,
          1,
          2,
          1,
          1
        ],
        feedKg: [
          0.23,
          0.26,
          0.28,
          0.3,
          0.31,
          0.33,
          0.35,
          0.37
        ],
        bodyWeight: [
          86,
          92,
          99,
          106,
          113,
          121,
          128,
          136
        ],
        trays: [
          196,
          197,
          198,
          198,
          199,
          199,
          200,
          200
        ]
      },
      schedules: [
        {
          id: 1,
          age: 8,
          date: "05/06/2026",
          name: "Feed allocation review",
          dose: "Batch",
          method: "Supervisor",
          description: "Compare feed curve against parent target",
          status: "Due"
        }
      ],
      unit: "WPA"
    },
    {
      id: "HUS007",
      code: "HUS007",
      name: "Parent Pre Layer House",
      stage: "Pre Layer",
      status: "Active",
      users: 5,
      houseCost: 68400,
      batchId: "GP BATCH 014",
      flockAge: "44 weeks",
      feedIndent: "IND000009",
      birdsHoused: 8200,
      femaleBirds: 7380,
      maleBirds: 820,
      liveHens: 7380,
      totalEggsProduced: 6620,
      totalFeedGivenKg: 1107,
      deadBirds: 2,
      totalBirds: 8200,
      sampledBirds: 320,
      birdsWithinTargetWeight: 294,
      mortalityToday: 2,
      trays: {
        standard: 1960,
        reject: 18
      },
      weightKg: 1740,
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
          8204,
          8202,
          8200,
          8200,
          8200,
          8200,
          8200,
          8200
        ],
        mortality: [
          2,
          2,
          0,
          0,
          0,
          0,
          0,
          2
        ],
        feedKg: [
          0.55,
          0.57,
          0.58,
          0.6,
          0.62,
          0.64,
          0.65,
          0.66
        ],
        bodyWeight: [
          261,
          270,
          279,
          288,
          296,
          305,
          313,
          321
        ],
        trays: [
          1904,
          1918,
          1930,
          1942,
          1950,
          1955,
          1958,
          1960
        ]
      },
      schedules: [
        {
          id: 1,
          age: 32,
          date: "05/11/2026",
          name: "Uniformity check",
          dose: "7% sample",
          method: "Manual scale",
          description: "Record male and female weights",
          status: "Due today"
        }
      ],
      unit: "WPO"
    },
    {
      id: "HUS008",
      code: "HUS008",
      name: "Parent Layer House",
      stage: "Layer",
      status: "Active",
      users: 5,
      houseCost: 72000,
      batchId: "GP BATCH 015",
      flockAge: "48 weeks",
      feedIndent: "IND000010",
      birdsHoused: 7900,
      femaleBirds: 7110,
      maleBirds: 790,
      liveHens: 7110,
      totalEggsProduced: 6420,
      totalFeedGivenKg: 1082.3,
      deadBirds: 2,
      totalBirds: 7900,
      sampledBirds: 315,
      birdsWithinTargetWeight: 286,
      mortalityToday: 2,
      trays: {
        standard: 1880,
        reject: 16
      },
      weightKg: 1760,
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
          7908,
          7906,
          7904,
          7902,
          7900,
          7900,
          7900,
          7900
        ],
        mortality: [
          1,
          2,
          1,
          2,
          2,
          1,
          2,
          2
        ],
        feedKg: [
          0.56,
          0.58,
          0.6,
          0.62,
          0.64,
          0.66,
          0.67,
          0.68
        ],
        bodyWeight: [
          268,
          276,
          284,
          293,
          301,
          310,
          318,
          328
        ],
        trays: [
          1820,
          1830,
          1842,
          1855,
          1864,
          1872,
          1878,
          1880
        ]
      },
      schedules: [
        {
          id: 1,
          age: 36,
          date: "05/13/2026",
          name: "Layer production check",
          dose: "Batch",
          method: "Supervisor",
          description: "Review egg production and reject trays",
          status: "Planned"
        }
      ],
      unit: "WPO"
    },
    {
      id: "HUS009",
      code: "HUS009",
      name: "Parent Brooding House",
      stage: "Brooding",
      status: "Active",
      users: 4,
      houseCost: 0,
      batchId: "BR BATCH 001",
      flockAge: "26 weeks",
      feedIndent: "IND000002",
      birdsHoused: 5100,
      femaleBirds: 4590,
      maleBirds: 510,
      liveHens: 4590,
      totalEggsProduced: 0,
      totalFeedGivenKg: 612,
      deadBirds: 0,
      totalBirds: 5100,
      sampledBirds: 260,
      birdsWithinTargetWeight: 238,
      mortalityToday: 0,
      trays: {
        standard: 5710,
        reject: 10
      },
      weightKg: 1100,
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
          5100,
          5100,
          5100,
          5100,
          5100,
          5100,
          5100,
          5100
        ],
        mortality: [
          0,
          0,
          1,
          0,
          1,
          0,
          0,
          0
        ],
        feedKg: [
          0.18,
          0.22,
          0.24,
          0.27,
          0.3,
          0.32,
          0.33,
          0.34
        ],
        bodyWeight: [
          74,
          80,
          86,
          92,
          98,
          105,
          112,
          118
        ],
        trays: [
          5690,
          5695,
          5700,
          5704,
          5708,
          5710,
          5710,
          5710
        ]
      },
      schedules: [
        {
          id: 1,
          age: 5,
          date: "05/03/2026",
          name: "Some medication",
          dose: "1",
          method: "Eye drops",
          description: "Starter health protocol",
          status: "Due today"
        },
        {
          id: 2,
          age: 7,
          date: "05/05/2026",
          name: "Body weight sample",
          dose: "10 birds",
          method: "Scale",
          description: "Weekly parent weight reading",
          status: "Planned"
        },
        {
          id: 3,
          age: 10,
          date: "05/08/2026",
          name: "ND vaccine review",
          dose: "Batch",
          method: "Water line",
          description: "Verify intake before dosing",
          status: "Planned"
        }
      ],
      unit: "WPO"
    }
  ];

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
  let currentSearchValue = "";
  let unitOptions = [];
  let unitsLoadedFromDataSource = false;
  let selectedMonthFrom = "2025-06";
  let selectedMonthTo = "2026-05";
  let selectedYearFrom = "2022";
  let selectedYearTo = "2026";
  let pendingTstructContext = null;

  async function loadUnitOptionsFromDataSource() {
    try {
      if (!window.ParentAPI || typeof window.ParentAPI.loadUnitOptions !== "function") {
        debugTstruct("ParentAPI is not available yet, unit datasource was not called", {
          hasParentAPI: Boolean(window.ParentAPI),
          scriptHint: "ParentAPI is now merged into parent.js. Check whether the latest parent.js is uploaded and cache-busted in Axpert.",
        });
        return;
      }
      const mappedUnits = await window.ParentAPI.loadUnitOptions();
      if (!mappedUnits.length) {
        debugTstruct("unit datasource returned no mapped rows", {
          dataSource: window.ParentAPI.dataSources && window.ParentAPI.dataSources.units,
        });
        return;
      }

      unitOptions = mappedUnits;
      unitsLoadedFromDataSource = true;
      debugTstruct("unit datasource loaded", mappedUnits);
      updateUnitFilters();
    } catch (error) {
      console.warn("[Parent Operations] Failed to load units from ParentAPI.", error);
    }
  }

  async function loadHousesFromDataSource() {
    try {
      if (!window.ParentAPI || typeof window.ParentAPI.loadHouses !== "function") return;
      const currentUnit = getCurrentUnitValue();
      const selectedUnitOptions = currentUnit
        ? getActiveUnitOptions().filter(function (unit) { return unit.value === currentUnit; })
        : getActiveUnitOptions();
      const dataSourceHouses = await window.ParentAPI.loadHouses({
        unit: currentUnit,
        unitOptions: selectedUnitOptions,
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
      } else {
        renderHouseList();
        renderHouses(currentSearchValue);
      }
    } catch (error) {
      console.warn("[Parent Operations] Failed to load houses from ParentAPI.", error);
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
    if (!window.ParentAPI) return;

    let shouldRender = false;

    try {
      if (typeof window.ParentAPI.loadSchedules === "function") {
        const schedules = await window.ParentAPI.loadSchedules({ house_id: house.id, batch_id: house.batchId });
        if (schedules.length) {
          house.schedules = schedules;
          shouldRender = true;
        }
      }
    } catch (error) {
      console.warn("[Parent Operations] Failed to load schedules from ParentAPI.", error);
    }

    try {
      if (typeof window.ParentAPI.loadCharts === "function") {
        const chartMetrics = await window.ParentAPI.loadCharts(getCurrentChartParameters(house));
        if (hasChartRows(chartMetrics)) {
          house.metrics = chartMetrics;
          shouldRender = true;
        }
      }
    } catch (error) {
      console.warn("[Parent Operations] Failed to load charts from ParentAPI.", error);
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

  window.addEventListener("ParentAPIReady", function (event) {
    debugTstruct("ParentAPIReady received", event.detail && event.detail.dataSources);
    loadScreenDataFromDataSource();
  });

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

  function getUnitLabelByValue(unitValue) {
    if (!unitValue || unitValue === "all") return "";

    const option = getActiveUnitOptions().find(function (opt) {
      return opt.value === unitValue;
    });

    return option ? option.label : unitValue;
  }

  function getCurrentUnitValue() {
    if (selectedUnit && selectedUnit !== "all") return selectedUnit;

    const houseUnitValues = Array.from(new Set(houses.map(getHouseUnitValue).filter(Boolean)));
    if (houseUnitValues.length === 1) return houseUnitValues[0];

    const options = getActiveUnitOptions();
    if (options.length === 1) return options[0].value;

    return "";
  }

  function houseMatchesSelectedUnit(house) {
    if (selectedUnit === "all") return true;
    return getHouseUnitValue(house) === selectedUnit;
  }

  function formatNumber(value, decimals) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    }).format(value);
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
      ? ["batchCreation", "eggAllotment", "hatcherTransfer"]
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

    if (CONFIG.tstructOptions.openerIV) params.set("openerIV", CONFIG.tstructOptions.openerIV);
    if (context && context.module) params.set("module", context.module);

    if (context && context.houseId) {
      params.set("house", context.houseId);
      params.set("houseid", context.houseId);
    }

    if (context && context.houseCode) {
      params.set("housecode", context.houseCode);
    }

    if (context && context.houseName) {
      params.set("housename", context.houseName);
    }

    if (context && context.batchId) {
      params.set("batch", context.batchId);
      params.set("batchid", context.batchId);
    }

    if (context && context.unitId) {
      params.set("unit", context.unitId);
      params.set("unitid", context.unitId);
    }

    if (context && context.unitName) {
      params.set("unitname", context.unitName);
    }

    return `${CONFIG.tstructOptions.basePath}?${params.toString()}`;
  }

  function openTstruct(actionKey, context) {
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;

    pendingTstructContext = Object.assign({ module: CONFIG.key }, context || {}, {
      actionKey,
      transid: action.transid,
      title: action.title,
    });
    const url = buildTstructUrl(action.transid, pendingTstructContext);
    debugTstruct("opening", {
      actionKey,
      transid: action.transid,
      title: action.title,
      context: pendingTstructContext,
      url,
    });
    tstructFrame.src = url;
    tstructPanel.classList.add("is-open");
    tstructPanel.setAttribute("aria-hidden", "false");
    prefillTstructUnitContext();
  }

  function closeTstructPanel() {
    debugTstruct("closing", pendingTstructContext);
    tstructPanel.classList.remove("is-open");
    tstructPanel.setAttribute("aria-hidden", "true");
    pendingTstructContext = null;
    tstructFrame.src = "about:blank";
  }

  function dispatchInputEvents(element) {
    const EventConstructor = element.ownerDocument && element.ownerDocument.defaultView
      ? element.ownerDocument.defaultView.Event
      : Event;
    ["input", "change", "blur"].forEach(function (eventName) {
      element.dispatchEvent(new EventConstructor(eventName, { bubbles: true }));
    });
  }

  function setElementValue(element, value, displayText) {
    if (!element || value === undefined || value === null || value === "") return false;

    const tagName = (element.tagName || "").toLowerCase();
    const elementWindow = element.ownerDocument && element.ownerDocument.defaultView;
    if (element.getAttribute("type") === "hidden") return false;

    if (tagName === "select") {
      const option = Array.from(element.options).find(function (item) {
        return item.value === value || item.text.trim() === value || item.text.trim() === displayText;
      });

      if (option) {
        element.value = option.value;
      } else {
        return false;
      }

      dispatchInputEvents(element);
      if (elementWindow && elementWindow.jQuery) {
        elementWindow.jQuery(element).trigger("change");
      }
      return true;
    }

    element.value = value;
    if (displayText && element.getAttribute("type") !== "hidden") {
      element.value = displayText;
    }
    dispatchInputEvents(element);
    if (elementWindow && elementWindow.jQuery) {
      elementWindow.jQuery(element).trigger("change");
    }
    return true;
  }

  function findFieldByCandidates(frameDocument, candidates) {
    for (const candidate of candidates) {
      const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(candidate) : candidate.replace(/"/g, '\\"');
      const field = frameDocument.querySelector([
        `[name="${escaped}"]`,
        `[id="${escaped}"]`,
        `[data-field="${escaped}"]`,
        `[data-axfield="${escaped}"]`,
        `[data-fieldname="${escaped}"]`,
        `[name^="${escaped}"]`,
        `[id^="${escaped}"]`,
      ].join(","));

      if (field) return field;
    }

    return null;
  }

  function describeField(field) {
    if (!field) return null;
    return {
      tag: (field.tagName || "").toLowerCase(),
      id: field.id || "",
      name: field.getAttribute("name") || "",
      type: field.getAttribute("type") || "",
      value: field.value || "",
      placeholder: field.getAttribute("placeholder") || "",
      title: field.getAttribute("title") || "",
      ariaLabel: field.getAttribute("aria-label") || "",
    };
  }

  function getPossibleContextFields(frameDocument, keywords) {
    const normalizedKeywords = keywords.map(function (keyword) {
      return keyword.toLowerCase();
    });

    return Array.from(frameDocument.querySelectorAll("input, select, textarea"))
      .filter(function (field) {
        const text = [
          field.id,
          field.getAttribute("name"),
          field.getAttribute("data-field"),
          field.getAttribute("data-axfield"),
          field.getAttribute("data-fieldname"),
          field.getAttribute("placeholder"),
          field.getAttribute("title"),
          field.getAttribute("aria-label"),
        ].join(" ").toLowerCase();
        return normalizedKeywords.some(function (keyword) {
          return text.includes(keyword);
        });
      })
      .slice(0, 20)
      .map(describeField);
  }

  function findFieldByLabel(frameDocument, labelText) {
    const normalizedLabel = labelText.trim().toLowerCase();
    const labels = Array.from(frameDocument.querySelectorAll("label, span, div, td, th")).filter(function (item) {
      return item.textContent && item.textContent.trim().toLowerCase() === normalizedLabel;
    });

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

    for (const setterName of setterNames) {
      const setter = frameWindow[setterName];
      if (typeof setter !== "function") continue;

      for (const fieldName of fieldNames) {
        try {
          setter.call(frameWindow, fieldName, value);
          didCallSetter = true;
          debugTstruct("called Axpert setter", { setterName, fieldName, value });
        } catch (error) {
          // Try the next field/function signature.
        }

        try {
          setter.call(frameWindow, fieldName, value, displayText);
          didCallSetter = true;
          debugTstruct("called Axpert setter with display text", { setterName, fieldName, value, displayText });
        } catch (error) {
          // Try the next field/function signature.
        }

        if (displayText) {
          try {
            setter.call(frameWindow, fieldName, displayText);
            didCallSetter = true;
            debugTstruct("called Axpert setter with display value", { setterName, fieldName, displayText });
          } catch (error) {
            // Try the next field/function signature.
          }
        }
      }
    }

    return didCallSetter;
  }

  function applyFieldContextToTstruct(frameWindow, frameDocument, config) {
    if (!config.value) return false;

    let candidateField = null;
    config.labels.forEach(function (label) {
      candidateField = candidateField || findFieldByLabel(frameDocument, label);
    });
    candidateField = candidateField || findFieldByCandidates(frameDocument, config.fieldNames);

    debugTstruct(`${config.logName} candidate field`, describeField(candidateField));
    if (setElementValue(candidateField, config.value, config.displayText)) {
      debugTstruct(`${config.logName} applied`, describeField(candidateField));
      return true;
    }

    const visibleInputs = Array.from(frameDocument.querySelectorAll("input, select")).filter(function (field) {
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

      return config.keywords.some(function (keyword) {
        return text.includes(keyword.toLowerCase());
      });
    });

    for (const field of visibleInputs) {
      if (setElementValue(field, config.value, config.displayText)) {
        debugTstruct(`${config.logName} applied to visible field`, describeField(field));
        return true;
      }
      if (config.displayText && setElementValue(field, config.displayText, config.displayText)) {
        debugTstruct(`${config.logName} display text applied to visible field`, describeField(field));
        return true;
      }
    }

    debugTstruct(`${config.logName} did not find writable field`, {
      possibleFields: getPossibleContextFields(frameDocument, config.keywords),
    });
    return false;
  }

  function applyContextToTstruct() {
    const context = pendingTstructContext;
    if (!context) return;
    if (!context.unitId && !context.houseId && !context.batchId) {
      debugTstruct("skip context prefill because no card context was resolved", {
        actionKey: context.actionKey,
        transid: context.transid,
        selectedUnit,
        unitOptions,
        houseUnits: Array.from(new Set(houses.map(getHouseUnitValue).filter(Boolean))),
      });
      return;
    }

    let frameWindow;
    let frameDocument;

    try {
      frameWindow = tstructFrame.contentWindow;
      frameDocument = tstructFrame.contentDocument || (frameWindow && frameWindow.document);
    } catch (error) {
      console.warn("[Parent Operations] Unable to access TStruct iframe for context prefill.", error);
      return;
    }

    if (!frameWindow || !frameDocument || !frameDocument.body) {
      debugTstruct("iframe document not ready for context prefill");
      return;
    }

    debugTstruct("attempting context prefill", {
      actionKey: context.actionKey,
      transid: context.transid,
      unitId: context.unitId,
      unitName: context.unitName,
      houseId: context.houseId,
      houseCode: context.houseCode,
      houseName: context.houseName,
      batchId: context.batchId,
      frameTitle: frameDocument.title,
      possibleUnitFields: getPossibleContextFields(frameDocument, ["unit", "location"]),
      possibleUnitOnlyFields: getPossibleContextFields(frameDocument, ["unit"]),
      possibleHouseFields: getPossibleContextFields(frameDocument, ["house"]),
    });

    applyFieldContextToTstruct(frameWindow, frameDocument, {
      logName: "unit prefill",
      value: context.unitId,
      displayText: context.unitName || context.unitId,
      fieldNames: ["unit", "unitname"],
      labels: context.transid === "house" ? ["Unit Name", "Unit"] : ["Unit", "Unit Name"],
      keywords: ["unit"],
    });

    window.setTimeout(function () {
      applyFieldContextToTstruct(frameWindow, frameDocument, {
        logName: "house prefill",
        value: context.houseId || context.houseCode,
        displayText: context.houseName || context.houseCode || context.houseId,
        fieldNames: ["house", "houseid", "housename", "housecode"],
        labels: ["House", "House Name"],
        keywords: ["house"],
      });
    }, 250);
  }

  function prefillTstructUnitContext() {
    [100, 500, 1200, 2500, 5000].forEach(function (delay) {
      window.setTimeout(applyContextToTstruct, delay);
    });
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
    const unitId = house ? getHouseUnitValue(house) : getCurrentUnitValue();
    const unitName = house ? getHouseUnitLabel(house) : getUnitLabelByValue(unitId);
    const context = {
      module: CONFIG.key,
      houseId: house ? house.id : "",
      houseCode: house ? house.code : "",
      houseName: house ? house.name : "",
      batchId: house ? house.batchId : "",
      unitId,
      unitName,
    };

    debugTstruct("resolved action context", {
      hasHouse: Boolean(house),
      selectedUnit,
      context,
      unitOptions,
      houseUnitValues: Array.from(new Set(houses.map(getHouseUnitValue).filter(Boolean))),
    });

    return context;
  }

  function metric(label, value) {
    return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
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
              <h3><span>${house.name}</span><span class="house-code-pill">${house.code}</span></h3>
              <small>${house.stage} house</small>
            </div>
            <div class="house-tools">
              <div class="house-tag-row house-tag-row-primary">
                <span class="status-badge">${house.status}</span>
                <span class="batch-badge">${house.batchId}</span>
                <span class="flock-age-badge">Flock age: ${house.flockAge}</span>
              </div>
              <details class="card-menu">
                <summary aria-label="House actions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12h.01M19 12h.01M5 12h.01" /></svg></summary>
                <div class="command-popover align-right">
                  ${CONFIG.cardActions.map((action) => `<button type="button" data-tstruct-action="${action}" data-house-id="${house.id}">${actionText(action)}</button>`).join("")}
                </div>
              </details>
            </div>
          </div>
          <div class="metric-grid">
            ${metric("Batch No", house.batchId)}
            ${metric("Bird count", birdCountLabel(house))}
            ${metric("Placement Date", getHousePlacementDate(house))}
            ${metric("Mortality Count", formatNumber(house.deadBirds))}
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
                <span>${actionText(action.key)}</span>
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
            <div><h3>${title}</h3><p>${axis}</p></div>
          </div>
          <div class="chart-scroll">
            <canvas class="chart-canvas" data-chart="${key}"></canvas>
          </div>
        </article>
      `;
  }

  function renderScheduleTable(house) {
    if (!house.schedules.length) return `<div class="empty-state">No schedules assigned to this house.</div>`;

    return `
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Age</th><th>Sch. Date</th><th>Name</th><th>Dose</th><th>Method</th><th>Description</th><th>Status</th></tr></thead>
            <tbody>
              ${house.schedules.map((item) => `
                <tr>
                  <td>${item.id}</td><td>${item.age}</td><td>${item.date}</td><td>${item.name}</td>
                  <td>${item.dose}</td><td>${item.method}</td><td>${item.description}</td>
                  <td><span class="status-badge">${item.status}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
  }

  function renderHouseDetail(houseId, options) {
    const house = houses.find((item) => item.id === houseId);
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
            <div><h2>Schedules</h2><p>${CONFIG.scheduleCopy}</p></div>
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
  tstructFrame.addEventListener("load", function () {
    debugTstruct("iframe loaded", {
      src: tstructFrame.getAttribute("src"),
      context: pendingTstructContext,
    });
    prefillTstructUnitContext();
  });

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

// ---- Merged Axpert datasource API from parentapi.js ----
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
      name: "poultry_unit_filter",
      valueField: "locationcode",
      labelField: "locationname",
    },
    houses: { name: "poultry_house_details" },
    parentBatchDetails: { name: "poultry_parent_batch_details" },
    charts: { name: "poultry_parent_charts" },
    schedules: { name: "poultry_parent_schedules" },
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
      // Cross-window access can be blocked outside Axpert preview.
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
    debugAPI("checking injected datasource stores", { dataSourceName });

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
        if (rows.length) {
          debugAPI("found injected datasource rows", {
            dataSourceName,
            rowCount: rows.length,
            firstRow: rows[0],
          });
          return rows;
        }
      }
    }

    debugAPI("no injected datasource rows found", { dataSourceName });
    return [];
  }

  function serializeDataSourceParameters(parameters) {
    if (!parameters || typeof parameters !== "object") return "";
    return Object.keys(parameters)
      .filter((key) => parameters[key] !== undefined && parameters[key] !== null)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
      .join("&");
  }

  function normalizeAxListRows(payload) {
    let parsed = parseMaybeJson(payload);
    if (parsed && parsed.d && typeof parsed.d === "string") {
      parsed = parseMaybeJson(parsed.d);
    }

    let rows = [];
    const resultData = parsed && parsed.result && parsed.result.data;

    if (Array.isArray(resultData)) {
      resultData.forEach(function (item) {
        if (item && Array.isArray(item.data)) {
          rows = rows.concat(item.data);
        }
      });
    }

    return rows.length ? rows : normalizeDataSourceRows(parsed);
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
          const rows = normalizeAxListRows(payload);
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

  async function loadRows(dataSourceName, parameters) {
    const hasParameters = parameters && Object.keys(parameters).some(function (key) {
      return parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "";
    });
    let rows = hasParameters ? [] : readInjectedDataSource(dataSourceName);

    if (!rows.length) {
      try {
        rows = normalizeDataSourceRows(await callAxpertDataSourceFunction(dataSourceName, parameters));
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
    return rows;
  }

  function toNumber(value, fallback) {
    if (value === undefined || value === null || value === "") return fallback || 0;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function getCurrentDateParameter() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function uniqueNonEmpty(values) {
    return Array.from(new Set(values.map(function (value) {
      return String(value || "").trim();
    }).filter(Boolean)));
  }

  function getGlobalValueCandidates(keys) {
    const values = [];

    getAxpertWindows().forEach(function (frameWindow) {
      keys.forEach(function (key) {
        const addValue = function (value) {
          if (typeof value !== "string" && typeof value !== "number") return;
          const normalizedValue = String(value).trim();
          if (!normalizedValue || /^https?:\/\//i.test(normalizedValue)) return;
          values.push(normalizedValue);
        };

        try {
          if (typeof frameWindow.AxGetGlobalVar === "function") {
            addValue(frameWindow.AxGetGlobalVar(key));
          }
        } catch (error) {
          // Ignore unavailable Axpert globals.
        }

        try {
          addValue(frameWindow[key]);
        } catch (error) {
          // Ignore inaccessible frame properties.
        }
      });
    });

    return uniqueNonEmpty(values);
  }

  function looksLikeLocationCode(value) {
    const text = String(value || "").trim();
    return Boolean(text) && !/\s/.test(text) && text.length <= 30 && !/^https?:\/\//i.test(text);
  }

  function onlyLocationCodes(values) {
    return uniqueNonEmpty(values).filter(looksLikeLocationCode);
  }

  function getMergedRowValue(primaryRow, secondaryRow, possibleFieldNames) {
    return getRowValue(primaryRow, possibleFieldNames) || getRowValue(secondaryRow, possibleFieldNames);
  }

  function getMergedNumber(primaryRow, secondaryRow, possibleFieldNames, fallback) {
    return toNumber(getMergedRowValue(primaryRow, secondaryRow, possibleFieldNames), fallback);
  }

  function getRowValueAt(row, index) {
    if (!row || typeof row !== "object") return "";
    const value = Object.values(row)[index];
    return value === undefined || value === null ? "" : String(value);
  }

  function resolveUnitValue(rawValue, unitOption) {
    if (unitOption && (!rawValue || rawValue === unitOption.label || rawValue === unitOption.value)) {
      return unitOption.value || unitOption.label || "";
    }

    return rawValue || "";
  }

  function mapHouseRow(houseRow, context) {
    const options = context || {};
    const batchRow = options.batchRow || {};
    const unitOption = options.unitOption || null;
    const sourceRow = Object.keys(batchRow).length ? batchRow : houseRow;
    const id = getMergedRowValue(houseRow, batchRow, [
      "id", "houseId", "house_id", "houseid", "sublocationid", "sub_location_id",
      "sublocationcode", "sub_location_code", "houseCode", "house_code", "housecode",
    ]) || getRowValueAt(sourceRow, 5);
    const code = getMergedRowValue(houseRow, batchRow, [
      "code", "houseCode", "house_code", "housecode", "sublocationcode", "sub_location_code",
      "sublocation", "subLocation",
    ]) || getRowValueAt(sourceRow, 5) || id;
    const name = getMergedRowValue(houseRow, batchRow, [
      "name", "houseName", "house_name", "housename", "sublocationname", "sub_location_name",
      "subLocationName", "description", "sublocation",
    ]) || getRowValueAt(sourceRow, 4) || code || id;
    const unitRaw = getMergedRowValue(houseRow, batchRow, [
      "unit", "unitcode", "unit_code", "unitid", "unit_id", "locationcode", "location_code",
      "location", "locationid", "location_id", "locationname", "location_name",
    ]) || getRowValueAt(sourceRow, 3) || getRowValueAt(sourceRow, 2);
    const batchId = getMergedRowValue(batchRow, houseRow, [
      "batchId", "batch_id", "batchid", "batch", "batchNo", "batch_no", "batchno",
      "batchNumber", "batch_number", "batchcode", "batch_code",
    ]) || getRowValueAt(sourceRow, 7) || getRowValueAt(sourceRow, 6);
    const femaleBirds = getMergedNumber(batchRow, houseRow, [
      "femaleBirds", "female_birds", "femalebirds", "female", "femaleCount", "female_count",
      "hen", "hens", "liveHens", "live_hens",
    ], toNumber(getRowValueAt(sourceRow, 10)));
    const maleBirds = getMergedNumber(batchRow, houseRow, [
      "maleBirds", "male_birds", "malebirds", "male", "maleCount", "male_count", "cock", "cocks",
    ], toNumber(getRowValueAt(sourceRow, 11)));
    const birdsHoused = getMergedNumber(batchRow, houseRow, [
      "birdsHoused", "birds_housed", "birdshoused", "birdCount", "bird_count", "birdcount",
      "totalBirds", "total_birds", "totalbirds", "liveBirds", "live_birds", "livebirds",
      "noOfBirds", "no_of_birds", "quantity", "qty",
    ], toNumber(getRowValueAt(sourceRow, 12), femaleBirds + maleBirds));
    const deadBirds = getMergedNumber(batchRow, houseRow, [
      "deadBirds", "dead_birds", "deadbirds", "mortality", "mortalityCount", "mortality_count",
      "dead", "death", "deaths",
    ]);
    const totalBirds = getMergedNumber(batchRow, houseRow, [
      "totalBirds", "total_birds", "totalbirds", "birdsHoused", "birds_housed", "birdCount",
      "bird_count",
    ], birdsHoused || femaleBirds + maleBirds);
    const sampledBirds = getMergedNumber(batchRow, houseRow, [
      "sampledBirds", "sampled_birds", "sampledbirds", "sampleBirds", "sample_birds",
    ]);
    const birdsWithinTargetWeight = getMergedNumber(batchRow, houseRow, [
      "birdsWithinTargetWeight", "birds_within_target_weight", "withinTargetWeight",
      "within_target_weight", "uniformBirds", "uniform_birds",
    ]);

    return {
      unit: resolveUnitValue(unitRaw, unitOption),
      id: id || code,
      code: code || id,
      name,
      stage: getMergedRowValue(houseRow, batchRow, [
        "stage", "category", "batchStage", "batch_stage", "type", "subLocationType",
        "sub_location_type", "locationType", "location_type",
      ]) || getRowValueAt(sourceRow, 14) || getRowValueAt(sourceRow, 15),
      status: getMergedRowValue(batchRow, houseRow, ["status", "active", "batchStatus", "batch_status"]) || "Active",
      batchId,
      flockAge: getMergedRowValue(batchRow, houseRow, [
        "flockAge", "flock_age", "flockage", "age", "ageDays", "age_days",
      ]) || "0 days",
      birdsHoused,
      femaleBirds,
      maleBirds,
      liveHens: getMergedNumber(batchRow, houseRow, ["liveHens", "live_hens", "livehens"], femaleBirds || birdsHoused),
      totalEggsProduced: getMergedNumber(batchRow, houseRow, [
        "totalEggsProduced", "total_eggs_produced", "totaleggsproduced", "totalEggs",
        "total_eggs", "eggs", "eggCount", "egg_count", "production",
      ]),
      totalFeedGivenKg: getMergedNumber(batchRow, houseRow, [
        "totalFeedGivenKg", "total_feed_given_kg", "totalfeedgivenkg", "feedKg", "feed_kg",
        "feed", "feedConsumption", "feed_consumption", "totalFeed", "total_feed",
      ]),
      deadBirds,
      totalBirds,
      sampledBirds,
      birdsWithinTargetWeight,
      mortalityToday: getMergedNumber(batchRow, houseRow, ["mortalityToday", "mortality_today", "deadBirds", "dead_birds"]),
      trays: { standard: 0, reject: 0 },
      weightKg: getMergedNumber(batchRow, houseRow, ["weightKg", "weight_kg", "bodyWeight", "body_weight", "weight"], toNumber(getRowValueAt(sourceRow, 13))),
      feedIndent: getMergedRowValue(batchRow, houseRow, ["feedIndent", "feed_indent", "feedindent"]),
      healthTasks: getMergedNumber(batchRow, houseRow, ["healthTasks", "health_tasks", "healthtasks"]),
      placementDate: getMergedRowValue(batchRow, houseRow, [
        "placementDate", "placement_date", "placedDate", "placed_date", "dateOfPurchase",
        "date_of_purchase", "purchaseDate", "purchase_date",
      ]) || getRowValueAt(sourceRow, 8),
      houseCost: getMergedNumber(houseRow, batchRow, ["houseCost", "house_cost", "housecost", "cost"]),
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

    const mappedRows = rows
      .map(function (row) {
        const value = getRowValue(row, [AXPERT_DATASOURCES.units.valueField, "code", "value", "id"]);
        const label = getRowValue(row, [AXPERT_DATASOURCES.units.labelField, "name", "text", "label"]);
        if (!value && !label) return null;

        return {
          value: value || label,
          label: label || value,
          locationcode: value || label,
        };
      })
      .filter(Boolean);

    debugAPI("unit options mapped", {
      sourceRowCount: rows.length,
      mappedRowCount: mappedRows.length,
      firstSourceRow: rows[0],
      mappedRows,
    });

    return mappedRows;
  }

  async function loadHouseSourceRows(unitOptions) {
    const units = unitOptions && unitOptions.length ? unitOptions : [{ value: "", label: "" }];
    const items = [];

    for (const unitOption of units) {
      const parameters = unitOption.label ? { locationname: unitOption.label } : {};
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

  function getBatchUnitCandidates(house, houseRow, unitOption) {
    return uniqueNonEmpty([
      getRowValue(houseRow, ["unit", "unitcode", "unit_code", "locationcode", "location_code"]),
      house.unit,
      unitOption && unitOption.value,
      unitOption && unitOption.label,
    ]);
  }

  function getBatchSubLocationCandidates(house, houseRow) {
    return uniqueNonEmpty([
      getRowValue(houseRow, ["sublocation", "subLocation", "sublocationcode", "sub_location_code"]),
      getRowValue(houseRow, ["houseCode", "house_code", "housecode"]),
      getRowValue(houseRow, ["houseName", "house_name", "housename", "sublocationname", "sub_location_name"]),
      house.code,
      house.id,
      house.name,
    ]);
  }

  async function loadParentBatchRowsForHouse(house, houseRow, unitOption) {
    const unitCandidates = getBatchUnitCandidates(house, houseRow, unitOption);
    const attempts = [];

    console.log("[Parent API][poultry_parent_batch_details] preparing house lookup", {
      house: { id: house.id, code: house.code, name: house.name },
      unitCandidates,
    });

    unitCandidates.slice(0, 3).forEach(function (unit) {
      attempts.push({ unit });
    });

    for (const parameters of attempts) {
      const rows = await loadRows(AXPERT_DATASOURCES.parentBatchDetails.name, parameters);
      console.log("[Parent API][poultry_parent_batch_details] returned rows", {
        parameters,
        rowCount: rows.length,
        rows,
      });
      if (rows.length) {
        debugAPI("parent batch details matched house", {
          dataSource: AXPERT_DATASOURCES.parentBatchDetails.name,
          house: { id: house.id, code: house.code, name: house.name },
          parameters,
          rowCount: rows.length,
          firstRow: rows[0],
        });
        return rows;
      }
    }

    debugAPI("parent batch details returned no rows for house", {
      dataSource: AXPERT_DATASOURCES.parentBatchDetails.name,
      house: { id: house.id, code: house.code, name: house.name },
      attemptedParameters: attempts,
    });

    return [];
  }

  async function loadParentBatchRowsForUnits(unitOptions, options) {
    const loaderOptions = options || {};
    const units = unitOptions && unitOptions.length ? unitOptions : [];
    const items = [];
    const explicitUnitCandidates = onlyLocationCodes([
      loaderOptions.unit,
      loaderOptions.locationcode,
      loaderOptions.locationCode,
    ]);

    const sourceUnits = explicitUnitCandidates.length
      ? explicitUnitCandidates.map(function (unitCode) {
        return { value: unitCode, label: unitCode, locationcode: unitCode };
      })
      : units;

    console.log("[Parent API][poultry_parent_batch_details] unit source for card lookup", {
      selectedUnit: loaderOptions.unit || "",
      sourceUnits,
    });

    if (!sourceUnits.length) {
      console.warn("[Parent API][poultry_parent_batch_details] skipped card lookup because no locationcode/unit code was available.", {
        options: loaderOptions,
        unitOptions,
      });
      return [];
    }

    for (const unitOption of sourceUnits) {
      const unitCandidates = onlyLocationCodes([
        unitOption.locationcode,
        unitOption.value,
      ]);
      if (!unitCandidates.length) continue;

      for (const unit of unitCandidates) {
        const parameters = { unit };
        const rows = await loadRows(AXPERT_DATASOURCES.parentBatchDetails.name, parameters);

        console.log("[Parent API][poultry_parent_batch_details] unit-only card rows", {
          parameters,
          serializedParameters: serializeDataSourceParameters(parameters),
          rowCount: rows.length,
          rows,
        });

        rows.forEach(function (row) {
          items.push({ row, unitOption });
        });

        if (rows.length) break;
      }
    }

    debugAPI("parent batch details direct card lookup complete", {
      rowCount: items.length,
      firstItem: items[0],
    });

    return items;
  }

  async function loadHouses(options) {
    const unitOptions = options && Array.isArray(options.unitOptions) ? options.unitOptions : await loadUnitOptions();
    const directBatchItems = await loadParentBatchRowsForUnits(unitOptions, options || {});
    const seenHouses = new Set();
    const directHouses = directBatchItems
      .map(function (item) {
        return mapHouseRow(item.row, { unitOption: item.unitOption, batchRow: item.row });
      })
      .filter(function (house) {
        if (!house.id) return false;
        const houseKey = normalizeKey([house.unit, house.id, house.batchId].join("|"));
        if (seenHouses.has(houseKey)) return false;
        seenHouses.add(houseKey);
        return true;
      });

    debugAPI("parent houses mapped from batch details", {
      rowCount: directHouses.length,
      firstHouse: directHouses[0],
    });

    return directHouses;
  }

  async function loadHousesLegacyFallback() {
    const unitOptions = await loadUnitOptions();
    const houseItems = await loadHouseSourceRows(unitOptions);
    const mappedHouses = [];
    const seenHouses = new Set();

    for (const item of houseItems) {
      const baseHouse = mapHouseRow(item.row, { unitOption: item.unitOption });
      if (!baseHouse.id) continue;
      const houseKey = normalizeKey(baseHouse.id || baseHouse.code || baseHouse.name);
      if (seenHouses.has(houseKey)) continue;
      seenHouses.add(houseKey);

      const batchRows = await loadParentBatchRowsForHouse(baseHouse, item.row, item.unitOption);
      mappedHouses.push(mapHouseRow(item.row, {
        unitOption: item.unitOption,
        batchRow: batchRows[0] || {},
      }));
    }

    debugAPI("parent houses mapped", {
      rowCount: mappedHouses.length,
      firstHouse: mappedHouses[0],
    });

    return mappedHouses.filter((house) => house.id);
  }

  async function loadCharts(parameters) {
    return mapChartRows(await loadRows(AXPERT_DATASOURCES.charts.name, parameters));
  }

  async function loadSchedules(parameters) {
    return (await loadRows(AXPERT_DATASOURCES.schedules.name, parameters)).map(mapScheduleRow);
  }

  window.ParentAPI = {
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

  debugAPI("initialized", AXPERT_DATASOURCES);
  window.dispatchEvent(new CustomEvent("ParentAPIReady", { detail: window.ParentAPI }));
})();


