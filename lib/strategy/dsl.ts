// lib/strategy/dsl.ts
import { DslNode } from './types';

// Resolve a dotted path like "profile.agiEstimate" from a context object.
function getPath(obj: any, path: string): any {
  if (!path) return undefined;
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function evalPredicate(node: DslNode, ctx: Record<string, any>): boolean {
  const k = Object.keys(node)[0] as keyof DslNode;
  const val: any = (node as any)[k];

  switch (k) {
    case 'and':
      return (val as DslNode[]).every((n) => evalPredicate(n, ctx));
    case 'or':
      return (val as DslNode[]).some((n) => evalPredicate(n, ctx));
    case 'not':
      return !evalPredicate(val as DslNode, ctx);
    case 'gt': {
      const [path, rhs] = val as [string, number];
      const lhs = Number(getPath(ctx, path));
      return Number.isFinite(lhs) && lhs > rhs;
    }
    case 'gte': {
      const [path, rhs] = val as [string, number];
      const lhs = Number(getPath(ctx, path));
      return Number.isFinite(lhs) && lhs >= rhs;
    }
    case 'lt': {
      const [path, rhs] = val as [string, number];
      const lhs = Number(getPath(ctx, path));
      return Number.isFinite(lhs) && lhs < rhs;
    }
    case 'lte': {
      const [path, rhs] = val as [string, number];
      const lhs = Number(getPath(ctx, path));
      return Number.isFinite(lhs) && lhs <= rhs;
    }
    case 'eq': {
      const [path, rhs] = val as [string, any];
      const lhs = getPath(ctx, path);
      return lhs === rhs;
    }
    case 'in': {
      const [path, list] = val as [string, any[]];
      const lhs = getPath(ctx, path);
      return (list || []).some((v) => v === lhs);
    }
    case 'exists': {
      const [path] = val as [string];
      const lhs = getPath(ctx, path);
      return lhs !== undefined && lhs !== null;
    }
    default:
      return false;
  }
}

