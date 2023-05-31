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
    </Head>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </>
  )
}
