// app/layout.tsx
import 'globals.css'

export const revalidate = 0;               // ✅ valid primitive
export const dynamic = 'force-dynamic';    // optional but safe
export const fetchCache = 'force-no-store' // optional

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
