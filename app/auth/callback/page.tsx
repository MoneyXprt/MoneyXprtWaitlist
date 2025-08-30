'use client';

export const dynamic = 'force-dynamic';
export const revalidate = false;        // <= safe value go now
export const fetchCache = 'force-no-store';

import Client from './Client';

export default function Page() {
  return <Client />;
}