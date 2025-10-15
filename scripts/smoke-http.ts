/*
  Optional smoke test stub.
  Usage (in one terminal):
    npm run dev
  Usage (in another terminal):
    node --env-file=.env.local scripts/smoke-http.ts
*/

// @ts-check
const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000'

async function get(path: string) {
  const url = base + path
  const res = await fetch(url, { redirect: 'manual' })
  return { url, status: res.status, ok: res.ok }
}

async function main() {
  const targets = ['/', '/planner', '/planner/history']
  const results = [] as Array<{ url: string; status: number; ok: boolean }>
  for (const t of targets) results.push(await get(t))
  console.log('Smoke results:')
  for (const r of results) console.log(`  ${r.status} ${r.ok ? 'OK ' : 'ERR'} ${r.url}`)
  // Basic assertion: home should be OK; others should at least respond
  if (!results[0].ok) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

