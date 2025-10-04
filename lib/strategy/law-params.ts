// lib/strategy/law-params.ts
export const LAW_2025 = {
  marginalHigh: 0.35,
  marginalTop: 0.37,
  qbiPct: 0.2,
  bonusPct: 0.6, // example phase-down
  augustaDaily: 800,
  ptetRates: {
    CA: 0.093,
    NY: 0.10,
    TX: 0.0,
    FL: 0.0,
    WA: 0.0,
    IL: 0.048,
    MN: 0.0965,
  } as Record<string, number>,
};

