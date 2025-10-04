// lib/strategy/reco.ts
export type RecommendationItem = {
  code: string;
  name: string;
  category: string;
  savingsEst: number; // dollars
  risk: number; // 1–5
  steps: string[];
};

