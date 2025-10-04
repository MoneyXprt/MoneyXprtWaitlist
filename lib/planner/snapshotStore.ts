"use client";

const KEY = "planner:snapshot";

export type Snapshot = any;

export function saveSnapshot(s: Snapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function loadSnapshot(): Snapshot | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function clearSnapshot() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

