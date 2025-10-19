export default function BillingSuccess() {
  return (
    <main className="max-w-xl mx-auto p-8 space-y-4">
      <h1 className="text-2xl font-semibold">You're all set ✅</h1>
      <p className="text-sm text-muted-foreground">
        Your payment was successful. Entitlements update within a few seconds after the Stripe webhook runs.
      </p>
      <div className="flex gap-2">
        <a className="btn" href="/intake">Return to Intake</a>
        <a className="btn btn-outline" href="/billing">Manage Billing</a>
      </div>
    </main>
  );
}

