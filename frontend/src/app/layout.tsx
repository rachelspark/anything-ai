import './globals.css'
import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Anything AI',
  description: 'Click and fill anything, with a simple text prompt.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <Head>
      <link rel="icon" href="/a-favicon.ico"/>
      <title>Anything</title>
      <meta
        name="description"
        content="Click and fill anything with a simple text prompt."
      />

      <meta property="og:title" content="Anything AI: a generative photo editing tool" />
      <meta
        property="og:description"
        content="Click and fill anything with a simple text prompt."
      />
      <meta
        property="og:image"
        content="https://anything-ai.com/social-image.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </>
  )
}
