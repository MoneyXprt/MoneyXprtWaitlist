// app/auth/callback/page.tsx
import CallbackClient from './CallbackClient';

export const dynamic = 'force-dynamic'; // don't prerender this auth route

export default function Page() {
  return <CallbackClient />;
}
