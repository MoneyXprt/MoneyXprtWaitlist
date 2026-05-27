// Spring 2026 MLSPA Salary Disclosure — static baked-in data
// Source: Spring 2026 MLSPA Salary Guide as of 4/14/2026

export interface SalaryRecord {
  /** Full name as it would appear in ESPN data — used for matching */
  name: string;
  /** Internal team slug */
  teamSlug: string;
  /** 2026 guaranteed compensation (USD) */
  guaranteedComp: number;
  /** MLS budget charge (actual salary-cap hit, capped at DP threshold) */
  budgetCharge: number;
  isDesignatedPlayer: boolean;
  isTAM: boolean;
}

// MLS 2026 DP budget charge threshold: ~$703,125
const DP_BUDGET_CHARGE = 703_125;

export const MLSPA_SALARIES_2026: SalaryRecord[] = [
  // ─── INTER MIAMI CF ─────────────────────────────────────────────
  { name: 'Lionel Messi',            teamSlug: 'inter-miami', guaranteedComp: 28_330_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Rodrigo De Paul',         teamSlug: 'inter-miami', guaranteedComp:  9_690_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Germán Berterame',        teamSlug: 'inter-miami', guaranteedComp:  3_820_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Drake Callender',         teamSlug: 'inter-miami', guaranteedComp:    720_000, budgetCharge:    720_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Benjamin Cremaschi',      teamSlug: 'inter-miami', guaranteedComp:    600_000, budgetCharge:    600_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Gregore',                 teamSlug: 'inter-miami', guaranteedComp:  1_000_000, budgetCharge:  1_000_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'DeAndre Yedlin',          teamSlug: 'inter-miami', guaranteedComp:    700_000, budgetCharge:    700_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Facundo Farías',          teamSlug: 'inter-miami', guaranteedComp:  2_100_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Nicolás Freire',          teamSlug: 'inter-miami', guaranteedComp:    380_000, budgetCharge:    380_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Noah Allen',              teamSlug: 'inter-miami', guaranteedComp:    380_000, budgetCharge:    380_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Tomás Avilés',            teamSlug: 'inter-miami', guaranteedComp:    480_000, budgetCharge:    480_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── LA GALAXY ──────────────────────────────────────────────────
  { name: 'Riqui Puig',              teamSlug: 'la-galaxy', guaranteedComp: 5_790_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Joseph Paintsil',         teamSlug: 'la-galaxy', guaranteedComp: 4_500_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Klauss de Mello',         teamSlug: 'la-galaxy', guaranteedComp: 2_920_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Edwin Cerrillo',          teamSlug: 'la-galaxy', guaranteedComp: 1_050_000, budgetCharge: 1_050_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Gastón Brugman',          teamSlug: 'la-galaxy', guaranteedComp:   820_000, budgetCharge:   820_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'John Tolkin',             teamSlug: 'la-galaxy', guaranteedComp:   480_000, budgetCharge:   480_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Dejan Joveljić',          teamSlug: 'la-galaxy', guaranteedComp: 1_650_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Diego Fagúndez',          teamSlug: 'la-galaxy', guaranteedComp:   900_000, budgetCharge:   900_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'John Nelson',             teamSlug: 'la-galaxy', guaranteedComp:   500_000, budgetCharge:   500_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── LAFC ────────────────────────────────────────────────────────
  { name: 'Heung-min Son',           teamSlug: 'lafc', guaranteedComp: 11_150_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Denis Bouanga',           teamSlug: 'lafc', guaranteedComp:  4_940_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Hugo Lloris',             teamSlug: 'lafc', guaranteedComp:  3_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Timothy Tillman',         teamSlug: 'lafc', guaranteedComp:  1_500_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Stipe Biuk',              teamSlug: 'lafc', guaranteedComp:  1_200_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Ilie Sánchez',            teamSlug: 'lafc', guaranteedComp:    900_000, budgetCharge:   900_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Aaron Long',              teamSlug: 'lafc', guaranteedComp:  1_300_000, budgetCharge: 1_300_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Diego Palacios',          teamSlug: 'lafc', guaranteedComp:    920_000, budgetCharge:   920_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Maxime Chanot',           teamSlug: 'lafc', guaranteedComp:    670_000, budgetCharge:   670_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── SEATTLE SOUNDERS FC ─────────────────────────────────────────
  { name: 'Albert Rusnák',           teamSlug: 'seattle-sounders', guaranteedComp: 2_685_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Jordan Morris',           teamSlug: 'seattle-sounders', guaranteedComp: 2_370_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Jesús Ferreira',          teamSlug: 'seattle-sounders', guaranteedComp: 1_880_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'João Paulo',              teamSlug: 'seattle-sounders', guaranteedComp: 1_500_000, budgetCharge: 1_500_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Cristian Roldan',         teamSlug: 'seattle-sounders', guaranteedComp:   950_000, budgetCharge:   950_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Stefan Frei',             teamSlug: 'seattle-sounders', guaranteedComp:   980_000, budgetCharge:   980_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Xavier Arreaga',          teamSlug: 'seattle-sounders', guaranteedComp:   660_000, budgetCharge:   660_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Jackson Ragen',           teamSlug: 'seattle-sounders', guaranteedComp:   520_000, budgetCharge:   520_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Obed Vargas',             teamSlug: 'seattle-sounders', guaranteedComp:   420_000, budgetCharge:   420_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── ATLANTA UNITED FC ───────────────────────────────────────────
  { name: 'Miguel Almirón',          teamSlug: 'atlanta-united', guaranteedComp: 7_870_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Aleksey Miranchuk',       teamSlug: 'atlanta-united', guaranteedComp: 5_090_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Emmanuel Latte Lath',     teamSlug: 'atlanta-united', guaranteedComp: 3_740_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Brad Guzan',              teamSlug: 'atlanta-united', guaranteedComp:   800_000, budgetCharge:   800_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Brooks Lennon',           teamSlug: 'atlanta-united', guaranteedComp:   800_000, budgetCharge:   800_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Caleb Wiley',             teamSlug: 'atlanta-united', guaranteedComp:   420_000, budgetCharge:   420_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Stian Gregersen',         teamSlug: 'atlanta-united', guaranteedComp:   760_000, budgetCharge:   760_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Santiago Sosa',           teamSlug: 'atlanta-united', guaranteedComp:   660_000, budgetCharge:   660_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Tristan Muyumba',         teamSlug: 'atlanta-united', guaranteedComp:   360_000, budgetCharge:   360_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── PORTLAND TIMBERS ────────────────────────────────────────────
  { name: 'David Da Costa',          teamSlug: 'portland-timbers', guaranteedComp: 3_425_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Kristoffer Velde',        teamSlug: 'portland-timbers', guaranteedComp: 3_027_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Santiago Moreno',         teamSlug: 'portland-timbers', guaranteedComp: 2_750_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Dairon Asprilla',         teamSlug: 'portland-timbers', guaranteedComp: 1_400_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Jarosław Niezgoda',       teamSlug: 'portland-timbers', guaranteedComp:   860_000, budgetCharge:   860_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Kamal Miller',            teamSlug: 'portland-timbers', guaranteedComp:   810_000, budgetCharge:   810_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Cristhian Paredes',       teamSlug: 'portland-timbers', guaranteedComp:   460_000, budgetCharge:   460_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Eryk Williamson',         teamSlug: 'portland-timbers', guaranteedComp:   560_000, budgetCharge:   560_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Miguel Araujo',           teamSlug: 'portland-timbers', guaranteedComp:   660_000, budgetCharge:   660_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── FC CINCINNATI ──────────────────────────────────────────────
  { name: 'Evander',                 teamSlug: 'fc-cincinnati', guaranteedComp: 4_740_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Miles Robinson',          teamSlug: 'fc-cincinnati', guaranteedComp: 3_950_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Kévin Denkey',            teamSlug: 'fc-cincinnati', guaranteedComp: 3_810_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Roman Celentano',         teamSlug: 'fc-cincinnati', guaranteedComp:   660_000, budgetCharge:   660_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Obinna Nwobodo',          teamSlug: 'fc-cincinnati', guaranteedComp:   820_000, budgetCharge:   820_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Andrew Gutman',           teamSlug: 'fc-cincinnati', guaranteedComp:   380_000, budgetCharge:   380_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Nick Hagglund',           teamSlug: 'fc-cincinnati', guaranteedComp:   380_000, budgetCharge:   380_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Matt Miazga',             teamSlug: 'fc-cincinnati', guaranteedComp:   660_000, budgetCharge:   660_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Yuya Kubo',               teamSlug: 'fc-cincinnati', guaranteedComp: 1_260_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },

  // ─── COLUMBUS CREW ──────────────────────────────────────────────
  { name: 'Wessam Abou Ali',         teamSlug: 'columbus-crew', guaranteedComp: 3_610_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Diego Rossi',             teamSlug: 'columbus-crew', guaranteedComp: 3_480_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Dániel Gazdag',           teamSlug: 'columbus-crew', guaranteedComp: 2_650_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Aidan Morris',            teamSlug: 'columbus-crew', guaranteedComp: 1_300_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Patrick Schulte',         teamSlug: 'columbus-crew', guaranteedComp:   460_000, budgetCharge:   460_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Steven Moreira',          teamSlug: 'columbus-crew', guaranteedComp:   560_000, budgetCharge:   560_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Rudy Camacho',            teamSlug: 'columbus-crew', guaranteedComp:   380_000, budgetCharge:   380_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Jacen Russell-Rowe',      teamSlug: 'columbus-crew', guaranteedComp:   720_000, budgetCharge:   720_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── NEW ENGLAND REVOLUTION ──────────────────────────────────────
  { name: 'Carles Gil',              teamSlug: 'new-england-revolution', guaranteedComp: 4_950_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Nacho Gil',               teamSlug: 'new-england-revolution', guaranteedComp: 2_000_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Matt Turner',             teamSlug: 'new-england-revolution', guaranteedComp: 1_940_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Leonardo Campana',        teamSlug: 'new-england-revolution', guaranteedComp: 1_620_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Luca Langoni',            teamSlug: 'new-england-revolution', guaranteedComp: 1_350_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'DeJuan Jones',            teamSlug: 'new-england-revolution', guaranteedComp:   520_000, budgetCharge:   520_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Shaleum Logan',           teamSlug: 'new-england-revolution', guaranteedComp:   460_000, budgetCharge:   460_000,       isDesignatedPlayer: false, isTAM: false },

  // ─── NYCFC ──────────────────────────────────────────────────────
  { name: 'Nicolás Fernández Mercau', teamSlug: 'nycfc', guaranteedComp: 3_650_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Thiago Martins',           teamSlug: 'nycfc', guaranteedComp: 2_260_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Alonso Martínez',          teamSlug: 'nycfc', guaranteedComp: 1_820_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: true,  isTAM: false },
  { name: 'Talles Magno',             teamSlug: 'nycfc', guaranteedComp: 1_370_000, budgetCharge: DP_BUDGET_CHARGE, isDesignatedPlayer: false, isTAM: true  },
  { name: 'Matt Freese',              teamSlug: 'nycfc', guaranteedComp:   530_000, budgetCharge:   530_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Keaton Parks',             teamSlug: 'nycfc', guaranteedComp:   860_000, budgetCharge:   860_000,       isDesignatedPlayer: false, isTAM: false },
  { name: 'Julián Fernández',         teamSlug: 'nycfc', guaranteedComp:   660_000, budgetCharge:   660_000,       isDesignatedPlayer: false, isTAM: false },
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
    ? MLSPA_SALARIES_2026.filter(r => r.teamSlug === teamSlug)
    : MLSPA_SALARIES_2026;

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
  return MLSPA_SALARIES_2026.filter(r => r.teamSlug === teamSlug);
}
