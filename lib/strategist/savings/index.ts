import type { UserProfile } from '../gates';
import { estLLCQBI } from './llc-qbi';
import { estAugusta } from './augusta';
import { estSTR } from './str';

export function estimate(estFormula: string, profile: UserProfile): number {
  switch (estFormula) {
    case 'llc-qbi':
      return estLLCQBI(profile);
    case 'augusta':
      return estAugusta(profile);
    case 'str':
      return estSTR(profile);
    case 'cost-seg':
    case 'megabackdoor':
    case 'nqdc':
    default:
      return 0; // stub or unknown formula
  }
}
