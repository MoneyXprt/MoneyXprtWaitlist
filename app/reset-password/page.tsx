// app/reset-password/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return <ResetPasswordClient />;
}
