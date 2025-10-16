"use client"
export default function ScenariosClient({ q }: { q?: string }) {
  return (
    <div className="p-6 text-sm">
      Scenarios {q ? `(filter: ${q})` : ""}
      {/* TODO: fetch and render user scenarios */}
    </div>
  )
}

