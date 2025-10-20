export default function SettingsPage() {
  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-zinc-600">Manage your account, billing, and developer options.</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        <a href="#" className="card p-4">
          <div className="font-medium">Account</div>
          <p className="text-sm text-zinc-600">Profile and password.</p>
        </a>
        <a href="/billing" className="card p-4">
          <div className="font-medium">Billing</div>
          <p className="text-sm text-zinc-600">Plan, usage, and portal.</p>
        </a>
        <a href="/mx-test" className="card p-4">
          <div className="font-medium">Developer</div>
          <p className="text-sm text-zinc-600">API Test and keys.</p>
        </a>
        <a href="#" className="card p-4">
          <div className="font-medium">About</div>
          <p className="text-sm text-zinc-600">Version and legal.</p>
        </a>
      </section>
    </main>
  )
}

