export const dynamic = 'force-dynamic';
export const revalidate = 0; // or: export const revalidate = false;

import CallbackClient from './Client';

export default function Page() {
  return <CallbackClient />;
}
