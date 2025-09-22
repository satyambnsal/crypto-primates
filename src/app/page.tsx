'use client'
import {
  Abstraxion,
  useAbstraxionAccount,
  useModal,
  useAbstraxionSigningClient,
  useAbstraxionClient,
} from '@burnt-labs/abstraxion'
import { Button } from '@burnt-labs/ui'
import { useEffect, useState } from 'react'
import type { ExecuteResult } from '@cosmjs/cosmwasm-stargate'
import Link from 'next/link'
import P256Signer from '@/components/P256Signer'
import SignatureGenerator from '@/components/SignatureGenerator'

const contractAddress = 'xion1qkkdph8l5326yqr37jgyvgawmwmwnt7mjecvg4z3437rzlvyquasa0pmvw'

type ExecuteResultOrUndefined = ExecuteResult | undefined

const blockExplorerBaseUrl = `https://www.mintscan.io/xion-testnet/tx/`

function getTimestampInSeconds(date: Date | null): number {
  if (!date) return 0
  const d = new Date(date)
  return Math.floor(d.getTime() / 1000)
}

const now = new Date()
now.setSeconds(now.getSeconds() + 15)
const oneYearFromNow = new Date()
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

export default function Page() {
  const { data: account, isConnected, isConnecting } = useAbstraxionAccount()
  const { client, signArb, logout } = useAbstraxionSigningClient()
  const { client: queryClient } = useAbstraxionClient()

  const [count, setCount] = useState<string | null>(null)
  const [, setShowModal] = useModal()
  const [loading, setLoading] = useState(false)
  const [executeResult, setExecuteResult] = useState<ExecuteResultOrUndefined>(undefined)

  const getCount = async () => {
    setLoading(true)
    try {
      const response = await queryClient!.queryContractSmart(contractAddress, {
        get_count: {},
      })

      setCount(response.count)
    } catch (error) {
      console.error('Error querying contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const increment = async () => {
    setLoading(true)
    const msg = { increment: {} }
    try {
      const res = await client?.execute(account.bech32Address, contractAddress, msg, 'auto')
      setExecuteResult(res)
      console.log('Transaction successful:', res)
      await getCount()
    } catch (error) {
      console.log('Error executing transaction: ', error)
    } finally {
      setLoading(false)
    }
  }

  // watch isConnected and isConnecting
  // only added for testing
  useEffect(() => {
    console.log({ isConnected, isConnecting })
  }, [isConnected, isConnecting])

  return (
    <main className="m-auto flex min-h-screen max-w-xs flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold tracking-tighter text-black dark:text-white">Abstraxion</h1>
      <Button
        fullWidth
        onClick={() => {
          setShowModal(true)
        }}
        structure="base"
      >
        {account.bech32Address ? (
          <div className="flex items-center justify-center">VIEW ACCOUNT</div>
        ) : (
          'CONNECT'
        )}
      </Button>
      {client ? (
        <>
          <Button
            disabled={loading}
            fullWidth
            onClick={() => {
              void getCount()
            }}
            structure="base"
          >
            {loading ? 'LOADING...' : 'Get Count'}
          </Button>
          <Button disabled={loading} fullWidth onClick={increment} structure="base">
            {loading ? 'LOADING...' : 'INCREMENT'}
          </Button>
          {logout ? (
            <Button
              disabled={loading}
              fullWidth
              onClick={() => {
                logout()
              }}
              structure="base"
            >
              LOGOUT
            </Button>
          ) : null}
        </>
      ) : null}
      <Abstraxion
        onClose={() => {
          setShowModal(false)
        }}
      />
      {account.bech32Address && (
        <div className="border-2 border-primary rounded-md p-4 flex flex-row gap-4">
          <div className="flex flex-row gap-6">
            <div>address</div>
            <div>{account.bech32Address}</div>
          </div>
        </div>
      )}
      {count ? (
        <div className="border-2 border-primary rounded-md p-4 flex flex-row gap-4">
          <div className="flex flex-row gap-6">
            <div>Count:</div>
            <div>{count}</div>
          </div>
        </div>
      ) : null}
      {executeResult && (
        <div className="flex flex-col rounded border-2 border-black p-2 dark:border-white">
          <div className="mt-2">
            <p className="text-zinc-500">
              <span className="font-bold">Transaction Hash</span>
            </p>
            <p className="text-sm">{executeResult.transactionHash}</p>
          </div>
          <div className="mt-2">
            <p className=" text-zinc-500">
              <span className="font-bold">Block Height:</span>
            </p>
            <p className="text-sm">{executeResult.height}</p>
          </div>
          <div className="mt-2">
            <Link
              className="text-black underline visited:text-purple-600 dark:text-white"
              href={`${blockExplorerBaseUrl}${executeResult?.transactionHash}`}
              target="_blank"
            >
              View in Block Explorer
            </Link>
          </div>
        </div>
      )}
      {/* <P256Signer /> */}
      <SignatureGenerator />
    </main>
  )
}
