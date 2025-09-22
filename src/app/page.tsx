'use client'
import React, { useState, useEffect } from 'react'
import {
  Abstraxion,
  useAbstraxionAccount,
  useModal,
  useAbstraxionSigningClient,
} from '@burnt-labs/abstraxion'
import { Button } from '@burnt-labs/ui'
import Link from 'next/link'
import SignatureGenerator from '@/components/SignatureGenerator'

const blockExplorerBaseUrl = `https://www.mintscan.io/xion-testnet/tx/`

export default function Page() {
  const { data: account, isConnected } = useAbstraxionAccount()
  const { logout } = useAbstraxionSigningClient()
  const [, setShowModal] = useModal()
  const [showDropdown, setShowDropdown] = useState(false)

  // Truncate address for display (e.g., xion1...xyz)
  const truncateAddress = (address: string) => {
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (account?.bech32Address) {
      navigator.clipboard
        .writeText(account.bech32Address)
        .then(() => alert('Address copied to clipboard!'))
        .catch((err) => console.error('Failed to copy address:', err))
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-primary p-4">
        <div className="m-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white">
            Abstraxion
          </h1>
          <div className="flex items-center gap-4">
            {isConnected && account?.bech32Address ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-black dark:text-white font-mono">
                    {truncateAddress(account.bech32Address)}
                  </span>
                  <Button onClick={copyAddress} structure="base" className="px-2 py-1 text-sm">
                    Copy
                  </Button>
                  <Button
                    onClick={() => setShowDropdown(!showDropdown)}
                    structure="base"
                    className="px-2 py-1 text-sm"
                  >
                    ▼
                  </Button>
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-primary rounded-md shadow-lg z-10">
                    <Button
                      fullWidth
                      onClick={() => {
                        logout!()
                        setShowDropdown(false)
                      }}
                      structure="base"
                      className="text-black dark:text-white text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => setShowModal(true)} structure="base" className="px-4 py-2">
                Connect
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}

      <SignatureGenerator />

      {/* Abstraxion Modal */}
      <Abstraxion
        onClose={() => {
          setShowModal(false)
        }}
      />
    </div>
  )
}
