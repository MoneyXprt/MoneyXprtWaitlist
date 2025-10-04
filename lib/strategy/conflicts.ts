// lib/strategy/conflicts.ts
export type Conflict = { a: string; b: string; reason: string };

const HARD_CONFLICTS: Conflict[] = [
  { a: 'state_ptet', b: 'state_ptet', reason: 'PTET should not be elected twice' },
];

export function findConflicts(codes: string[]): Conflict[] {
  const res: Conflict[] = [];
  for (const c of HARD_CONFLICTS) {
    const countA = codes.filter((x) => x === c.a).length;
    const countB = codes.filter((x) => x === c.b).length;
    if (c.a === c.b && countA > 1) res.push(c);
    else if (c.a !== c.b && countA && countB) res.push(c);
  }
  return res;
}

