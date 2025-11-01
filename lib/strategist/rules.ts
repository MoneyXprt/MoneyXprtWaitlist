import fs from 'node:fs/promises';
import path from 'node:path';
import type { StrategyRule } from './types';

const RULES_DIR = path.join(process.cwd(), 'data', 'strategy_rules', 'v1');

let cachedRules: StrategyRule[] | null = null;

/**
 * Load and cache all strategy rule JSON files from data/strategy_rules/v1.
 * - Includes only files ending with .json
 * - Excludes files whose names start with an underscore (_)
 */
export async function loadRules(): Promise<StrategyRule[]> {
  if (cachedRules) return cachedRules;

  let dirents: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    // @ts-ignore Node 18 types: withFileTypes supported
    dirents = await fs.readdir(RULES_DIR, { withFileTypes: true });
  } catch (err) {
    console.warn(`rules: directory not found or unreadable: ${RULES_DIR}`);
    cachedRules = [];
    return cachedRules;
  }

  const files = (dirents as unknown as { name: string; isFile: () => boolean }[])
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => name.endsWith('.json'))
    .filter((name) => !name.startsWith('_'))
    .sort();

  const rules: StrategyRule[] = [];

  await Promise.all(
    files.map(async (file) => {
      const full = path.join(RULES_DIR, file);
      try {
        const raw = await fs.readFile(full, 'utf8');
        const parsed = JSON.parse(raw);
        // Minimal runtime sanity checks; rely on TS for shape during dev
        if (
          parsed &&
          typeof parsed.code === 'string' &&
          typeof parsed.title === 'string' &&
          typeof parsed.category === 'string'
        ) {
          rules.push(parsed as StrategyRule);
        } else {
          console.warn(`rules: skipped invalid rule file: ${file}`);
        }
      } catch (e) {
        console.warn(`rules: failed to load ${file}:`, e);
      }
    })
  );

  cachedRules = rules;
  return cachedRules;
}

