'use client';

export const dynamic = 'force-dynamic';
export const revalidate = false;

import Client from './Client';

export default function Page() {
  return <Client />;
}