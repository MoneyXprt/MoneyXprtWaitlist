import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MoneyXprt - AI Financial Co-Pilot for High-Income Earners',
  description: 'Get personalized financial advice from MoneyXprt, an AI-powered financial advisor specializing in tax optimization, investment strategies, and wealth management for professionals earning $100k+.',
  keywords: 'financial advisor, AI financial planning, tax optimization, investment strategies, wealth management, high income earners, financial co-pilot',
  authors: [{ name: 'MoneyXprt' }],
  creator: 'MoneyXprt',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://moneyxprt.vercel.app'),
  openGraph: {
    title: 'MoneyXprt - AI Financial Co-Pilot',
    description: 'Personalized financial advice powered by AI for high-income professionals. Tax optimization, investment strategies, and wealth management.',
    type: 'website',
    siteName: 'MoneyXprt',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MoneyXprt - AI Financial Co-Pilot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoneyXprt - AI Financial Co-Pilot',
    description: 'Personalized financial advice powered by AI for high-income professionals.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}