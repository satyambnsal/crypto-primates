'use client'
import { Inter } from 'next/font/google'
import './globals.css'
import { AbstraxionProvider } from '@burnt-labs/abstraxion'
import '@burnt-labs/abstraxion/dist/index.css'
import '@burnt-labs/ui/dist/index.css'

const inter = Inter({ subsets: ['latin'] })

const treasuryConfig = {
  treasury: 'xion1t752z7rtux58c0kmhl8ucu5lpqncrunw0c5pvldzvh25eg34w2ts5hy9u0',
  rpcUrl: 'https://rpc.xion-testnet-2.burnt.com/',
  restUrl: 'https://api.xion-testnet-2.burnt.com/',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AbstraxionProvider config={treasuryConfig}>{children}</AbstraxionProvider>
      </body>
    </html>
  )
}
