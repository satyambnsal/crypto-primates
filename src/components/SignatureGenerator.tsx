'use client'
import React, { useState } from 'react'
import { ec as EC } from 'elliptic'
import { Button } from '@burnt-labs/ui'
import { useAbstraxionClient } from '@burnt-labs/abstraxion'
import {
  getHexByteLength,
  getMessageByteLength,
  hexToBase64,
  sha256,
  toFixedLengthBuffer,
} from '@/utils'

const ec = new EC('p256')

const contractAddress = 'xion14ptdtz098eshzdrqqnrw9p035wu74ajv2qqaaewd6hmxr3wapq8sv8ekrm'

export const SignatureGenerator: React.FC = () => {
  const [message, setMessage] = useState<string>('hello world')
  const [payload, setPayload] = useState<string>('')
  const [privateKey, setPrivateKey] = useState<string>('')
  const [publicKey, setPublicKey] = useState<string>('')
  const [keyPairs, setKeyPairs] = useState<Array<{ privateKey: string; publicKey: string }>>([])
  const [selectedKeyPairIndex, setSelectedKeyPairIndex] = useState<number>(-1)
  const [verifyResult, setVerifyResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const { client: queryClient } = useAbstraxionClient()

  // Function to generate new key pair
  const generateNewKeyPair = () => {
    try {
      const keyPair = ec.genKeyPair()
      const privKey = keyPair.getPrivate().toString('hex')
      const pubKey = keyPair.getPublic().encode('hex', false)
      setKeyPairs([...keyPairs, { privateKey: privKey, publicKey: pubKey }])
      setSelectedKeyPairIndex(keyPairs.length)
      setPrivateKey(privKey)
      setPublicKey(pubKey)
      setPayload('')
      setVerifyResult('')
    } catch (error) {
      setError(`Error generating key pair: ${(error as Error).message}`)
    }
  }

  const signMessage = async () => {
    if (selectedKeyPairIndex === -1) {
      setError('No key pair selected')
      return
    }
    try {
      setError('')
      const keyPair = ec.keyFromPrivate(keyPairs[selectedKeyPairIndex].privateKey, 'hex')
      const messageHash = await sha256(message)
      const signature = keyPair.sign(messageHash)
      const r = toFixedLengthBuffer(signature.r, 32)
      const s = toFixedLengthBuffer(signature.s, 32)
      const signatureBuffer = new Uint8Array([...r, ...s])
      const signatureHex = Array.from(signatureBuffer)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')

      const payloadObj = {
        verify_secp256_r1_signature: {
          message: btoa(String.fromCharCode(...new TextEncoder().encode(message))),
          signature: btoa(String.fromCharCode(...signatureBuffer)),
          public_key: hexToBase64(keyPairs[selectedKeyPairIndex].publicKey),
        },
      }

      setPayload(JSON.stringify(payloadObj, null, 2))
      setVerifyResult('')
    } catch (error) {
      setError(`Error signing message: ${(error as Error).message}`)
    }
  }

  const verifyWithContract = async () => {
    if (!payload) {
      setError('No payload to verify')
      return
    }
    try {
      setError('')
      console.log('payload', payload)
      const payloadObj = JSON.parse(payload)
      const response = await queryClient!.queryContractSmart(contractAddress, payloadObj)
      setVerifyResult(JSON.stringify(response, null, 2))
    } catch (error) {
      setError(`Error verifying with contract: ${(error as Error).message}`)
      setVerifyResult(JSON.stringify({ message: 'verification failed' }))
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => alert(`${label} copied to clipboard!`))
        .catch((err) => setError(`Failed to copy ${label}: ${err.message}`))
    } else {
      setError(`No ${label} to copy`)
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4">
      <div className="w-full max-w-7xl flex items-center gap-4">
        <Button onClick={generateNewKeyPair} structure="base" className="px-4 py-2">
          Generate New Key Pair
        </Button>
        <select
          value={selectedKeyPairIndex}
          onChange={(e) => {
            const index = parseInt(e.target.value)
            setSelectedKeyPairIndex(index)
            if (index >= 0) {
              setPrivateKey(keyPairs[index].privateKey)
              setPublicKey(keyPairs[index].publicKey)
              setPayload('')
              setVerifyResult('')
            } else {
              setPrivateKey('')
              setPublicKey('')
              setPayload('')
              setVerifyResult('')
            }
          }}
          className="p-2 border-2 border-primary rounded-md bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <option value={-1}>Select Key Pair</option>
          {keyPairs.map((kp, index) => (
            <option key={index} value={index}>
              Key Pair {index + 1} ({truncateAddress(kp.publicKey)})
            </option>
          ))}
        </select>
      </div>
      {publicKey && (
        <div className="w-full max-w-7xl border-2 border-primary rounded-md p-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Public Key:</h3>
          <textarea
            readOnly
            value={publicKey}
            className="w-full p-2 border-2 border-gray-300 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm resize-none"
            rows={3}
          />
          <p className="text-sm text-zinc-500 mt-1">
            Byte Length: {getHexByteLength(publicKey)} bytes
          </p>
          <Button
            fullWidth
            onClick={() => copyToClipboard(publicKey, 'Public Key')}
            structure="base"
            className="mt-2"
          >
            Copy Public Key
          </Button>
        </div>
      )}
      <div className="w-full max-w-7xl">
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          Message:
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          className="w-full p-2 border-2 border-primary rounded-md bg-white dark:bg-gray-800 text-black dark:text-white resize-vertical"
          rows={4}
        />
        <p className="text-sm text-zinc-500 mt-1">
          Byte Length: {getMessageByteLength(message)} bytes
        </p>
        <Button
          fullWidth
          onClick={signMessage}
          structure="base"
          disabled={message.trim() === '' || selectedKeyPairIndex === -1}
          className="mt-2"
        >
          Sign Message
        </Button>
      </div>
      {payload && (
        <>
          <hr className="w-full max-w-7xl border-t-2 border-primary my-4" />
          <div className="w-full max-w-7xl border-2 border-primary rounded-md p-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">Payload:</h3>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full p-2 border-2 border-gray-300 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm resize-none"
              rows={10}
            />
            <p className="text-sm text-zinc-500 mt-1">
              Signature Byte Length:{' '}
              {getHexByteLength(JSON.parse(payload).verify_secp256_r1_signature.signature)} bytes
              (Base64 decoded)
            </p>
            <Button
              fullWidth
              onClick={() => copyToClipboard(payload, 'Payload')}
              structure="base"
              className="mt-2"
            >
              Copy Payload
            </Button>
          </div>
        </>
      )}

      {payload && (
        <div className="w-full max-w-7xl">
          <Button fullWidth onClick={verifyWithContract} structure="base" className="mt-2">
            Verify with Contract
          </Button>
        </div>
      )}
      {verifyResult && (
        <div className="w-full max-w-7xl border-2 border-primary rounded-md p-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Verification Result:</h3>
          <textarea
            readOnly
            value={verifyResult}
            className="w-full p-2 border-2 border-gray-300 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white font-mono text-sm resize-none"
            rows={5}
          />
        </div>
      )}

      {/* Error Display */}
      {error && <p className="text-red-500 text-sm mt-2 max-w-7xl">{error}</p>}
    </div>
  )

  // Truncate address or key for display
  function truncateAddress(str: string) {
    return str.length > 10 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str
  }
}

export default SignatureGenerator
