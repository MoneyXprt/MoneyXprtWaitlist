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
  seniorBudgetMax: number; // $5,255,000 in 2024
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
