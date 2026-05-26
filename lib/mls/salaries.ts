// 2025 MLSPA Salary Disclosure — static baked-in data
// Source: May 2025 MLSPA public salary disclosure (approximate figures)

export interface SalaryRecord {
  /** Full name as it would appear in ESPN data — used for matching */
  name: string;
  /** Internal team slug */
  teamSlug: string;
  /** 2025 guaranteed compensation (USD) */
  guaranteedComp: number;
  /** MLS budget charge (actual salary-cap hit, capped at DP threshold) */
  budgetCharge: number;
  isDesignatedPlayer: boolean;
  isTAM: boolean;
}

// MLS 2025 DP budget charge threshold: ~$683,750
const DP_BUDGET_CHARGE = 683_750;

export const MLSPA_SALARIES_2025: SalaryRecord[] = [
  // ─── INTER MIAMI CF ─────────────────────────────────────────────
  { name: 'Lionel Messi',            teamSlug: 'inter-miami', guaranteedComp: 21_100_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Sergio Busquets',         teamSlug: 'inter-miami', guaranteedComp:  8_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Jordi Alba',              teamSlug: 'inter-miami', guaranteedComp:  3_800_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Drake Callender',         teamSlug: 'inter-miami', guaranteedComp:    520_000, budgetCharge:    520_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'DeAndre Yedlin',          teamSlug: 'inter-miami', guaranteedComp:    650_000, budgetCharge:    650_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Benjamin Cremaschi',      teamSlug: 'inter-miami', guaranteedComp:    450_000, budgetCharge:    450_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Gregore',                 teamSlug: 'inter-miami', guaranteedComp:    900_000, budgetCharge:    900_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Facundo Farías',          teamSlug: 'inter-miami', guaranteedComp:  1_600_000, budgetCharge:    683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Matías Rojas',            teamSlug: 'inter-miami', guaranteedComp:  1_400_000, budgetCharge:    683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Nicolás Freire',          teamSlug: 'inter-miami', guaranteedComp:    300_000, budgetCharge:    300_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Leandro González Pirez',  teamSlug: 'inter-miami', guaranteedComp:    400_000, budgetCharge:    400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Noah Allen',              teamSlug: 'inter-miami', guaranteedComp:    300_000, budgetCharge:    300_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Robert Taylor',           teamSlug: 'inter-miami', guaranteedComp:    300_000, budgetCharge:    300_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Robbie Robinson',         teamSlug: 'inter-miami', guaranteedComp:    600_000, budgetCharge:    600_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── LA GALAXY ──────────────────────────────────────────────────
  { name: 'Riqui Puig',              teamSlug: 'la-galaxy', guaranteedComp: 4_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Joseph Paintsil',         teamSlug: 'la-galaxy', guaranteedComp: 2_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Gabriel Pec',             teamSlug: 'la-galaxy', guaranteedComp: 2_400_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Gastón Brugman',          teamSlug: 'la-galaxy', guaranteedComp:   750_000, budgetCharge:   750_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Edwin Cerrillo',          teamSlug: 'la-galaxy', guaranteedComp:   950_000, budgetCharge:   950_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'John Tolkin',             teamSlug: 'la-galaxy', guaranteedComp:   400_000, budgetCharge:   400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Dejan Joveljić',          teamSlug: 'la-galaxy', guaranteedComp: 1_500_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Diego Fagúndez',          teamSlug: 'la-galaxy', guaranteedComp:   850_000, budgetCharge:   850_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'John Nelson',             teamSlug: 'la-galaxy', guaranteedComp:   450_000, budgetCharge:   450_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── LAFC ────────────────────────────────────────────────────────
  { name: 'Denis Bouanga',           teamSlug: 'lafc', guaranteedComp: 3_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Olivier Giroud',          teamSlug: 'lafc', guaranteedComp: 4_000_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Hugo Lloris',             teamSlug: 'lafc', guaranteedComp: 3_500_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Timothy Tillman',         teamSlug: 'lafc', guaranteedComp: 1_400_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Stipe Biuk',              teamSlug: 'lafc', guaranteedComp: 1_100_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Ilie Sánchez',            teamSlug: 'lafc', guaranteedComp:   850_000, budgetCharge:   850_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Aaron Long',              teamSlug: 'lafc', guaranteedComp: 1_200_000, budgetCharge: 1_200_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Diego Palacios',          teamSlug: 'lafc', guaranteedComp:   850_000, budgetCharge:   850_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── SEATTLE SOUNDERS FC ─────────────────────────────────────────
  { name: 'Nicolás Lodeiro',         teamSlug: 'seattle-sounders', guaranteedComp: 2_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Raúl Ruidíaz',            teamSlug: 'seattle-sounders', guaranteedComp: 2_800_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Jordan Morris',           teamSlug: 'seattle-sounders', guaranteedComp: 1_800_000, budgetCharge: 1_800_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Albert Rusnák',           teamSlug: 'seattle-sounders', guaranteedComp: 1_300_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'João Paulo',              teamSlug: 'seattle-sounders', guaranteedComp: 1_400_000, budgetCharge: 1_400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Cristian Roldan',         teamSlug: 'seattle-sounders', guaranteedComp:   900_000, budgetCharge:   900_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Stefan Frei',             teamSlug: 'seattle-sounders', guaranteedComp:   950_000, budgetCharge:   950_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Xavier Arreaga',          teamSlug: 'seattle-sounders', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Nouhou Tolo',             teamSlug: 'seattle-sounders', guaranteedComp:   500_000, budgetCharge:   500_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Jackson Ragen',           teamSlug: 'seattle-sounders', guaranteedComp:   400_000, budgetCharge:   400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Obed Vargas',             teamSlug: 'seattle-sounders', guaranteedComp:   300_000, budgetCharge:   300_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── ATLANTA UNITED FC ───────────────────────────────────────────
  { name: 'Giorgos Giakoumakis',     teamSlug: 'atlanta-united', guaranteedComp: 3_500_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Xande Silva',             teamSlug: 'atlanta-united', guaranteedComp: 2_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Edwin Mosquera',          teamSlug: 'atlanta-united', guaranteedComp: 2_000_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Brad Guzan',              teamSlug: 'atlanta-united', guaranteedComp:   750_000, budgetCharge:   750_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Brooks Lennon',           teamSlug: 'atlanta-united', guaranteedComp:   750_000, budgetCharge:   750_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Caleb Wiley',             teamSlug: 'atlanta-united', guaranteedComp:   300_000, budgetCharge:   300_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Stian Gregersen',         teamSlug: 'atlanta-united', guaranteedComp:   700_000, budgetCharge:   700_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Santiago Sosa',           teamSlug: 'atlanta-united', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Tristan Muyumba',         teamSlug: 'atlanta-united', guaranteedComp:   300_000, budgetCharge:   300_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── PORTLAND TIMBERS ────────────────────────────────────────────
  { name: 'Evander',                 teamSlug: 'portland-timbers', guaranteedComp: 3_800_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Santiago Moreno',         teamSlug: 'portland-timbers', guaranteedComp: 2_600_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Dairon Asprilla',         teamSlug: 'portland-timbers', guaranteedComp: 1_300_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Jarosław Niezgoda',       teamSlug: 'portland-timbers', guaranteedComp:   800_000, budgetCharge:   800_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Kamal Miller',            teamSlug: 'portland-timbers', guaranteedComp:   750_000, budgetCharge:   750_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Diego Chará',             teamSlug: 'portland-timbers', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Cristhian Paredes',       teamSlug: 'portland-timbers', guaranteedComp:   400_000, budgetCharge:   400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Eryk Williamson',         teamSlug: 'portland-timbers', guaranteedComp:   500_000, budgetCharge:   500_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Miguel Araujo',           teamSlug: 'portland-timbers', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── FC CINCINNATI ──────────────────────────────────────────────
  { name: 'Luciano Acosta',          teamSlug: 'fc-cincinnati', guaranteedComp: 4_500_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Brandon Vásquez',         teamSlug: 'fc-cincinnati', guaranteedComp: 3_000_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Álvaro Barreal',          teamSlug: 'fc-cincinnati', guaranteedComp: 2_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Roman Celentano',         teamSlug: 'fc-cincinnati', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Obinna Nwobodo',          teamSlug: 'fc-cincinnati', guaranteedComp:   750_000, budgetCharge:   750_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Andrew Gutman',           teamSlug: 'fc-cincinnati', guaranteedComp:   350_000, budgetCharge:   350_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Nick Hagglund',           teamSlug: 'fc-cincinnati', guaranteedComp:   350_000, budgetCharge:   350_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Gerardo Valenzuela',      teamSlug: 'fc-cincinnati', guaranteedComp:   400_000, budgetCharge:   400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Matt Miazga',             teamSlug: 'fc-cincinnati', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Yuya Kubo',               teamSlug: 'fc-cincinnati', guaranteedComp: 1_200_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },

  // ─── COLUMBUS CREW ──────────────────────────────────────────────
  { name: 'Cucho Hernández',         teamSlug: 'columbus-crew', guaranteedComp: 5_000_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Diego Rossi',             teamSlug: 'columbus-crew', guaranteedComp: 3_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Lucas Zelarayán',         teamSlug: 'columbus-crew', guaranteedComp: 2_300_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Aidan Morris',            teamSlug: 'columbus-crew', guaranteedComp: 1_200_000, budgetCharge: 1_200_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Yaw Yeboah',              teamSlug: 'columbus-crew', guaranteedComp: 1_400_000, budgetCharge: 1_400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Patrick Schulte',         teamSlug: 'columbus-crew', guaranteedComp:   400_000, budgetCharge:   400_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Steven Moreira',          teamSlug: 'columbus-crew', guaranteedComp:   500_000, budgetCharge:   500_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Jonathan Mensah',         teamSlug: 'columbus-crew', guaranteedComp:   500_000, budgetCharge:   500_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Rudy Camacho',            teamSlug: 'columbus-crew', guaranteedComp:   350_000, budgetCharge:   350_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Jacen Russell-Rowe',      teamSlug: 'columbus-crew', guaranteedComp:   600_000, budgetCharge:   600_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── NEW ENGLAND REVOLUTION ──────────────────────────────────────
  { name: 'Giacomo Vrioni',          teamSlug: 'new-england-revolution', guaranteedComp: 2_400_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Nacho Gil',               teamSlug: 'new-england-revolution', guaranteedComp: 1_800_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Luca Langoni',            teamSlug: 'new-england-revolution', guaranteedComp: 1_200_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
  { name: 'Carles Gil',              teamSlug: 'new-england-revolution', guaranteedComp: 2_800_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Djordje Petrovic',        teamSlug: 'new-england-revolution', guaranteedComp:   800_000, budgetCharge:   800_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── NYCFC ──────────────────────────────────────────────────────
  { name: 'Mitja Ilenič',            teamSlug: 'nycfc', guaranteedComp: 2_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Alonso Martínez',         teamSlug: 'nycfc', guaranteedComp: 3_000_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Kevin O\'Toole',          teamSlug: 'nycfc', guaranteedComp:   450_000, budgetCharge:   450_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Hannes Wolf',             teamSlug: 'nycfc', guaranteedComp: 1_400_000, budgetCharge:   683_750,       isDesignatedPlayer: false, isTAM: true  },
];

// ─── Name-matching helpers ───────────────────────────────────────────────────

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Find a salary record by player name.
 * Strategy:
 *   1. Exact normalized match
 *   2. Last-name exact match (handles "L. Messi" → "Lionel Messi")
 *   3. Last-name contains match
 */
export function findSalaryRecord(
  playerName: string,
  teamSlug?: string
): SalaryRecord | undefined {
  const normalizedInput = normalize(playerName);
  const candidates = teamSlug
    ? MLSPA_SALARIES_2025.filter(r => r.teamSlug === teamSlug)
    : MLSPA_SALARIES_2025;

  // 1. Exact match
  const exact = candidates.find(r => normalize(r.name) === normalizedInput);
  if (exact) return exact;

  // 2. Last-name match (handles abbreviated first names like "L. Messi")
  const inputParts = normalizedInput.split(/\s+/);
  const inputLast = inputParts[inputParts.length - 1];

  const lastNameMatch = candidates.find(r => {
    const parts = normalize(r.name).split(/\s+/);
    return parts[parts.length - 1] === inputLast;
  });
  if (lastNameMatch) return lastNameMatch;

  // 3. Partial match — input last name contained in record name
  const partialMatch = candidates.find(r => normalize(r.name).includes(inputLast) && inputLast.length > 3);
  if (partialMatch) return partialMatch;

  return undefined;
}

/** Get all salary records for a team slug */
export function getSalariesForTeam(teamSlug: string): SalaryRecord[] {
  return MLSPA_SALARIES_2025.filter(r => r.teamSlug === teamSlug);
}
