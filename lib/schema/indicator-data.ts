export const INDICATOR_ORGANIZATIONS = ["NEDI", "PIA", "GSI", "NYSS", "NSC", "NYC"] as const;
export const INDICATOR_CATEGORIES = ["finance", "training", "sport_financing"] as const;

export type IndicatorCategory = (typeof INDICATOR_CATEGORIES)[number];
export type IndicatorOrganization = (typeof INDICATOR_ORGANIZATIONS)[number];

export const INDICATOR_REGIONS = [
  "BJL",
  "KM",
  "GBA",
  "WCR",
  "NBR",
  "LRR",
  "CRR",
  "URR",
  "National",
] as const;
