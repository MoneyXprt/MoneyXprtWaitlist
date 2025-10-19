// Simple ULID-ish id without extra deps.
// Good enough for unguessable URLs.
export function publicId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  ).toUpperCase();
}

