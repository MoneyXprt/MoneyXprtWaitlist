export const dynamic = 'force-dynamic';
export const revalidate = false;
export const fetchCache = 'force-no-store';

import ResetPasswordClient from './ResetPasswordClient';

export default function Page() {
  return <ResetPasswordClient />;
}
