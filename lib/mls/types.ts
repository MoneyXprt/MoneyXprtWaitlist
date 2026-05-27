export interface MLSPlayer {
  id: string;
  name: string;
  teamId: string;
  position: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST' | 'LM' | 'RM';
  nationality: string;
  age: number;
  guaranteedComp: number; // annual guaranteed compensation (USD)
  budgetCharge: number; // MLS budget charge (actual cap hit)
  isDesignatedPlayer: boolean;
  isTAM: boolean; // Targeted Allocation Money player
  stats: {
    gamesPlayed: number;
    gamesStarted: number;
    minutesPlayed: number;
    goals: number;
    assists: number;
    xG: number;
    xA: number;
    keyPasses: number;
    dribbles: number;
    tackles: number;
    interceptions: number;
    passAccuracy: number; // percentage
    shots: number;
    shotsOnTarget: number;
  };
  season: string; // e.g. "2024"
}

export interface MLSTeam {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  city: string;
  conference: 'Eastern' | 'Western';
  primaryColor: string;
  secondaryColor: string;
  stadium: string;
  stadiumCapacity: number;
  foundedYear: number;
  estimatedRevenue: number; // USD
  estimatedMarketValue: number; // USD
  standingsPoints: number;
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  leaguePosition: number;
  season: string;
}

export interface TeamFinancials {
  teamId: string;
  totalPayroll: number;
  dpCount: number;
  dpCost: number;
  tamPlayerCount: number;
  tamCost: number;
  seniorBudgetUsed: number;
  seniorBudgetMax: number; // $5,255,000 in 2025
  payrollRank: number; // 1 = highest payroll in league
  costPerGoal: number;
  costPerPoint: number;
  costPerAssist: number;
  payrollAsRevenuePct: number;
  valueRating: number; // (goals+assists) per $M spent
}

export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram';

export interface SocialPost {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  metrics: string[]; // key metrics cited
}

// ─── Live ESPN + MLSPA enriched types ────────────────────────────────────────

export interface ESPNPlayerStats {
  goals: number;
  assists: number;
  gamesPlayed: number;
  minutesPlayed: number;
  shots: number;
  shotsOnTarget: number;
  passAccuracy: number;
}

export interface EnrichedPlayer {
  /** ESPN athlete ID */
  espnId: string;
  name: string;
  /** Position abbreviation (GK, CB, LB, etc.) */
  position: string;
  /** Internal team slug e.g. "inter-miami" */
  teamId: string;
  teamName: string;
  age?: number;
  nationality?: string;
  /** From MLSPA disclosure — 0 if not in salary dataset */
  guaranteedComp: number;
  /** MLS cap charge — 0 if not in salary dataset */
  budgetCharge: number;
  isDesignatedPlayer: boolean;
  isTAM: boolean;
  /** Live stats from ESPN roster endpoint (may be sparse) */
  stats: ESPNPlayerStats;
  /** Composite 0–100 value score */
  valueScore: number;
  /** guaranteedComp / (goals + assists), or 0 if no contributions */
  costPerGoalContribution: number;
}

export interface LiveTeamData {
  /** ESPN team ID string */
  espnId: string;
  name: string;
  abbreviation: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  /** Standing position in conference */
  position: number;
  conference: string;
}
