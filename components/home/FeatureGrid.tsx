import React from "react";

export default function FeatureGrid() {
  const items = [
    {
      title: "Advanced strategies",
      body:
        "QBI, PTET, cost segregation, REP/STR, Augusta rule, employ children, charitable planning, entity optimization.",
    },
    {
      title: "Scenario + Playbook",
      body:
        "Stack strategies, view conflicts, and export a step-by-step plan with docs, deadlines, and risk notes.",
    },
    {
      title: "Built for pros",
      body:
        "Share CPA-ready assumptions and evidence checklists. Tamper-evident report options.",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((it) => (
        <article key={it.title} className="rounded-xl border bg-white/70 p-5">
          <h3 className="text-base font-semibold">{it.title}</h3>
          <p className="mt-2 text-sm text-gray-600">{it.body}</p>
        </article>
      ))}
    </section>
  );
}

