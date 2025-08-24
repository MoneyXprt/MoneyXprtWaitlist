// app/reset-password/page.tsx
export const dynamic = 'force-dynamic'; // render on request; avoid prerender

import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return <ResetPasswordClient />;
}
