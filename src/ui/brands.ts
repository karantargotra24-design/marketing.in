import type { SavedBrand } from "@/services/brandProfile";

export const BRANDS_KEY = "agency-os-mock-brands-v1";

export const SEED_BRANDS: SavedBrand[] = [
  {
    id: "seed-1", name: "Jammu Motors (example)", industry: "Car dealership", city: "Jammu",
    audience: "First-time car buyers, 25-45, Jammu region", tone: "friendly", language: "hinglish",
    usps: ["Free test drive at your doorstep"], doNot: ["fixed price", "guaranteed"], competitors: [],
    goal: "More showroom visits", monthlyLeadTarget: 40, brandColors: ["#C2410C"],
  },
  {
    id: "seed-2", name: "Dogra Sweets (example)", industry: "Food & retail", city: "Jammu",
    audience: "Families, festival shoppers", tone: "local & warm", language: "hinglish",
    usps: ["Fresh every morning"], doNot: [], competitors: [], goal: "Festival season orders",
    monthlyLeadTarget: null, brandColors: [],
  },
];
