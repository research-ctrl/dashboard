import type { Chapter } from "@/data/types";

export const portugal: Chapter = {
  id: "portugal",
  name: "Portugal Chapter",
  accent: "indigo",
  timeZone: "Europe/Lisbon",
  timeZoneLabel: "Portugal",

  projects: [
    {
      id: "pt-p1",
      name: "Project One",
      completion: 91,
      soldAssets: 14,
      inventory: 2,
      expectedOutcome: 120_000_000,
      expectedHandover: "Jan 2026",
      repaidToFirstProject: 30_000_000,
      yearStarted: 2022,
      comments: "Snagging under way, handover set for January.",
    },
    {
      id: "pt-p2",
      name: "Project Two",
      completion: 47,
      soldAssets: 9,
      inventory: 12,
      expectedOutcome: 210_000_000,
      expectedHandover: "Nov 2026",
      repaidToFirstProject: 15_000_000,
      yearStarted: 2024,
      comments: "Facade works started; sales pace steady.",
    },
    {
      id: "pt-p3",
      name: "Project Three",
      completion: 12,
      soldAssets: 3,
      inventory: 19,
      expectedOutcome: 260_000_000,
      expectedHandover: "Q4 2027",
      repaidToFirstProject: 0,
      yearStarted: 2025,
      comments: "Excavation stage.",
    },
  ],

  pipeline: [
    {
      id: "pt-pl1",
      name: "Pipeline One",
      onward: "Jun 2026",
      inventory: 22,
      ticketSize: 28_000_000,
      constructionCost: 300_000_000,
      planned: 22,
      status: "Land acquired",
    },
    {
      id: "pt-pl2",
      name: "Pipeline Two",
      onward: "Q1 2027",
      inventory: 16,
      ticketSize: 35_000_000,
      constructionCost: 340_000_000,
      planned: 20,
      status: "Approvals in progress",
    },
  ],

  opex: [
    {
      id: "pt-o1",
      name: "Site office",
      amount: 800_000,
      extra: 90_000,
      remark: "Shared with Project Two.",
    },
    {
      id: "pt-o2",
      name: "Marketing",
      amount: 2_100_000,
      extra: 260_000,
      remark: "Portal listings added.",
    },
    {
      id: "pt-o3",
      name: "Salaries",
      amount: 5_600_000,
      extra: 0,
      remark: "",
    },
    {
      id: "pt-o4",
      name: "Maintenance",
      amount: 620_000,
      extra: 40_000,
      remark: "Landscaping contract.",
    },
  ],

  crm: {
    year: 2026,
    // amounts[project id][month] — leave a month out to show a dash.
    amounts: {
      "pt-p1": {
        Jan: 4_800_000,
        Feb: 5_200_000,
        Mar: 4_100_000,
        Apr: 3_600_000,
        May: 2_900_000,
        Jun: 2_200_000,
      },
      "pt-p2": {
        Jan: 3_100_000,
        Feb: 2_800_000,
        Mar: 3_700_000,
        Apr: 4_200_000,
        May: 3_900_000,
        Jun: 4_500_000,
        Jul: 3_300_000,
        Aug: 4_800_000,
      },
      "pt-p3": {
        Jun: 900_000,
        Jul: 1_600_000,
        Aug: 2_100_000,
      },
    },
  },
};
