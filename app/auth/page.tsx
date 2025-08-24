// app/auth/callback/page.tsx
export const dynamic = 'force-dynamic'; // render on request; avoid prerender

import CallbackClient from './CallbackClient';

export default function Page() {
  return <CallbackClient />;
}
