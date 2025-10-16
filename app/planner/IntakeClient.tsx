"use client"
import { useSearchParams } from "next/navigation"

export default function IntakeClient({ profileId }: { profileId?: string }) {
  const sp = useSearchParams()
  const profileFromUrl = sp.get("profileId") ?? undefined
  const id = profileId || profileFromUrl
  return (
    <div className="p-6">
      <div className="mb-2 text-sm text-neutral-600">Intake</div>
      <div className="text-xs text-neutral-500">profileId: {id ?? "(none)"}</div>
      {/* TODO: render your existing intake form here */}
    </div>
  )
}

