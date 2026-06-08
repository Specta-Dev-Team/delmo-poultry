(function () {
  const CONFIG = {
    key: "breeder",
    title: "Breeder Operations",
    listLabel: "Breeder houses",
    emptyLabel: "No breeder houses found.",
    scheduleCopy: "Medication, monitoring, and review actions attached to this breeder batch.",
    exposeName: "breederOps",
    tstructOptions: {
      basePath: "../../aspx/tstruct.aspx",
      openerIV: "",
      passContextInQuery: false,
    },
    cardActions: ["batchCreation", "eggCollection", "mortality", "feedMedication", "bodyWeight", "water", "eggAllotment"],
    categoryFilters: [
      { key: "all", label: "All" },
      { key: "brooding", label: "Brooding" },
      { key: "grower", label: "Grower" },
      { key: "pre-layer", label: "Pre Layer" },
      { key: "layer", label: "Layer" },
    ],
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

  const houses = [
    {
        id: "HUS001",
        code: "HUS001",
        name: "Breeder Brooding House",
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
                description: "Weekly breeder weight reading",
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
        unit: "Unit 1"
    },
    {
        id: "HUS002",
        code: "HUS002",
        name: "Breeder Grower Annex",
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
                description: "Compare feed curve against breeder target",
                status: "Due"
            }
        ],
        unit: "Unit 1"
    },
    {
        id: "HUS003",
        code: "HUS003",
        name: "Breeder Pre Layer House",
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
        unit: "Unit 1"
    },
    {
        id: "HUS004",
        code: "HUS004",
        name: "Breeder Layer House",
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
        unit: "Unit 2"
    },
    {
        id: "HUS005",
        code: "HUS005",
        name: "Breeder Brooding House",
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
                description: "Weekly breeder weight reading",
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
        unit: "Unit 2"
    },
    {
        id: "HUS006",
        code: "HUS006",
        name: "Breeder Grower Annex",
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
                description: "Compare feed curve against breeder target",
                status: "Due"
            }
        ],
        unit: "Unit 2"
    },
    {
        id: "HUS007",
        code: "HUS007",
        name: "Breeder Pre Layer House",
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
        unit: "Unit 3"
    },
    {
        id: "HUS008",
        code: "HUS008",
        name: "Breeder Layer House",
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
        unit: "Unit 3"
    },
    {
        id: "HUS009",
        code: "HUS009",
        name: "Breeder Brooding House",
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
                description: "Weekly breeder weight reading",
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
        unit: "Unit 3"
    }
];

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

  function actionText(actionKey) {
    return AXPERT_TSTRUCTS[actionKey] ? AXPERT_TSTRUCTS[actionKey].title : actionKey;
  }

  function svgIcon(path) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" /></svg>`;
  }

  function categoryKey(value) {
    return String(value).trim().toLowerCase().replace(/\s+/g, "-");
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
    const moreActions = CONFIG.key === "breeder"
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
    if (CONFIG.tstructOptions.passContextInQuery) {
      if (context && context.houseId) params.set("houseid", context.houseId);
      if (context && context.batchId) params.set("batchid", context.batchId);
      if (context && context.module) params.set("module", context.module);
    }

    return `${CONFIG.tstructOptions.basePath}?${params.toString()}`;
  }

  function openTstruct(actionKey, context) {
    const action = AXPERT_TSTRUCTS[actionKey];
    if (!action) return;

    tstructFrame.src = buildTstructUrl(action.transid, context || { module: CONFIG.key });
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

  function actionContext(house) {
    return { module: CONFIG.key, houseId: house ? house.id : "", batchId: house ? house.batchId : "" };
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
            <div class="house-tag-row">
              <span class="house-meta-tag">LKR House Cost: ${formatNumber(house.houseCost)}</span>
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
          ${metric("Mortality Count", formatNumber(house.deadBirds))}
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

  function renderHouseDetail(houseId) {
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
    const unitCounts = houses.reduce((acc, house) => {
      acc.all = (acc.all || 0) + 1;
      acc[house.unit] = (acc[house.unit] || 0) + 1;
      return acc;
    }, { all: 0 });

    const unitSelect = document.getElementById("unitSelect");
    if (!unitSelect) return;
    
    const units = Object.keys(unitCounts).filter(u => u !== "all").sort();
    
    unitSelect.innerHTML = `<option value="all">All Units (${unitCounts.all})</option>` +
      units.map(unit => `<option value="${unit}">${unit} (${unitCounts[unit]})</option>`).join("");
      
    unitSelect.value = selectedUnit;
  }

  function renderHouses(query) {
    const search = (query || "").trim().toLowerCase();
    const visibleHouses = houses.filter((house) => {
      const matchesUnit = selectedUnit === "all" || house.unit === selectedUnit;
      const matchesSearch = !search || [house.name, house.code, house.stage, house.batchId, house.status, house.unit].join(" ").toLowerCase().includes(search);
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
        if (!acc[house.unit]) acc[house.unit] = [];
        acc[house.unit].push(house);
        return acc;
      }, {});
      
      const units = Object.keys(grouped).sort();
      let html = "";
      for (const unit of units) {
        html += `<div class="unit-separator"><h3>${unit}</h3><hr/></div>`;
        html += grouped[unit].map(renderHouseCard).join("");
      }
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

  window[CONFIG.exposeName] = {
    openTstruct,
    openHouse: renderHouseDetail,
    backToHouses: function () {
      renderHouseList();
      renderHouses(currentSearchValue);
    },
    tstructs: AXPERT_TSTRUCTS,
    houses,
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

