export const revalidate = false;           // must be a boolean false or a number
export const dynamic = 'force-dynamic';    // ensures no prerender

import Client from './Client';

export default function Page() {
  return <Client />;
}
