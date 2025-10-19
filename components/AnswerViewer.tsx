'use client';
import { useMemo } from 'react';

/**
 * Splits a plain-text/markdown answer into sections by H2/H3 headings.
 * Example headings it catches:
 *   ## Profile Snapshot
 *   ## 2025 Estimate
 *   ## Top Strategies
 *   ### Strategy 1 — S-Corp Election
 */
function splitSections(answer: string) {
  if (!answer) return [] as Array<{ title: string; content: string[] }>;
  const lines = answer.split(/\r?\n/);
  const sections: { title: string; content: string[] }[] = [];
  let current = { title: 'Summary', content: [] as string[] };

  const pushCurrent = () => {
    if (current.content.length > 0) sections.push({ ...current, content: [...current.content] });
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)/);
    const h3 = line.match(/^###\s+(.*)/);
    if (h2) {
      pushCurrent();
      current = { title: h2[1].trim(), content: [] };
    } else if (h3) {
      pushCurrent();
      current = { title: h3[1].trim(), content: [] };
    } else {
      current.content.push(line);
    }
  }
  pushCurrent();
  return sections;
}

export default function AnswerViewer({ answer }: { answer: string }) {
  const sections = useMemo(() => splitSections(answer), [answer]);
  if (!answer) return null;

  return (
    <div className="space-y-4">
      {sections.map((s, i) => (
        <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">{s.title || 'Section'}</h2>
          <div className="prose max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {s.content.join('\n')}
          </div>
        </div>
      ))}
    </div>
  );
}

