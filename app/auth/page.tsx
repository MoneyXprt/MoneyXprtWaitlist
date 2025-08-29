// app/auth/page.tsx
export const dynamic = 'force-dynamic';
// If anyone (or an old build step) hits /auth, render the real callback client.
export { default } from './callback/CallbackClient';
