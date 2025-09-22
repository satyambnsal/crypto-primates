import React, { useState } from 'react'
import { Copy, Key, FileSignature, RefreshCw } from 'lucide-react'

interface KeyData {
  publicKeyHex: string
  publicKeyBase64: string
  publicKeyBytes: number
}

interface SignatureData {
  messageHex: string
  messageBase64: string
  messageBytes: number
  signatureHex: string
  signatureBase64: string
  signatureBytes: number
}

const P256Signer: React.FC = () => {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null)
  const [keyData, setKeyData] = useState<KeyData | null>(null)
  const [message, setMessage] = useState<string>('')
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  // Convert ArrayBuffer to hex string
  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Convert ArrayBuffer to base64 string
  const bufferToBase64 = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
  }

  // Convert string to ArrayBuffer
  const stringToBuffer = (str: string): ArrayBuffer => {
    return new TextEncoder().encode(str)
  }

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Generate P-256 keypair
  const generateKeyPair = async () => {
    setIsGenerating(true)
    try {
      const newKeyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true, // extractable
        ['sign', 'verify']
      )

      // Export public key to get its raw bytes
      const publicKeyBuffer = await crypto.subtle.exportKey('raw', newKeyPair.publicKey)

      const publicKeyHex = bufferToHex(publicKeyBuffer)
      const publicKeyBase64 = bufferToBase64(publicKeyBuffer)

      setKeyPair(newKeyPair)
      setKeyData({
        publicKeyHex,
        publicKeyBase64,
        publicKeyBytes: publicKeyBuffer.byteLength,
      })
      setSignatureData(null) // Reset signature when new key is generated
    } catch (error) {
      console.error('Error generating keypair:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Sign message
  const signMessage = async () => {
    if (!keyPair || !message) return

    setIsSigning(true)
    try {
      // Create SHA-256 hash of the message
      const messageBuffer = stringToBuffer(message)
      const messageHash = await crypto.subtle.digest('SHA-256', messageBuffer)

      // Sign the hash
      const signature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' },
        },
        keyPair.privateKey,
        messageHash
      )

      const messageHex = bufferToHex(messageBuffer)
      const messageBase64 = bufferToBase64(messageBuffer)
      const signatureHex = bufferToHex(signature)
      const signatureBase64 = bufferToBase64(signature)

      setSignatureData({
        messageHex,
        messageBase64,
        messageBytes: messageBuffer.byteLength,
        signatureHex,
        signatureBase64,
        signatureBytes: signature.byteLength,
      })
    } catch (error) {
      console.error('Error signing message:', error)
    } finally {
      setIsSigning(false)
    }
  }

  const CopyButton: React.FC<{ text: string }> = ({ text }) => (
    <button
      onClick={() => copyToClipboard(text)}
      className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition-colors"
      title="Copy to clipboard"
    >
      <Copy size={16} />
    </button>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg text-black">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Key className="mr-3 text-blue-600" />
        P-256 Message Signer
      </h1>

      {/* Key Generation */}
      <div className="mb-8">
        <button
          onClick={generateKeyPair}
          disabled={isGenerating}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <RefreshCw className="animate-spin mr-2" size={20} />
          ) : (
            <Key className="mr-2" size={20} />
          )}
          {isGenerating ? 'Generating...' : 'Generate New P-256 Keypair'}
        </button>
      </div>

      {/* Public Key Display */}
      {keyData && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Public Key ({keyData.publicKeyBytes} bytes)
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hex Format:</label>
            <div className="flex items-center">
              <input
                type="text"
                value={keyData.publicKeyHex}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-sm"
              />
              <CopyButton text={keyData.publicKeyHex} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Base64 Format:</label>
            <div className="flex items-center">
              <input
                type="text"
                value={keyData.publicKeyBase64}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-sm"
              />
              <CopyButton text={keyData.publicKeyBase64} />
            </div>
          </div>
        </div>
      )}

      {/* Message Input and Signing */}
      {keyPair && (
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-800 mb-2">Message to Sign:</label>
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={signMessage}
              disabled={!message || isSigning}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSigning ? (
                <RefreshCw className="animate-spin mr-2" size={20} />
              ) : (
                <FileSignature className="mr-2" size={20} />
              )}
              {isSigning ? 'Signing...' : 'Sign Message'}
            </button>
          </div>
        </div>
      )}

      {/* Signature Results */}
      {signatureData && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Signature Results</h2>

          {/* Message */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Message ({signatureData.messageBytes} bytes)
            </h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">Hex:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={signatureData.messageHex}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-xs"
                />
                <CopyButton text={signatureData.messageHex} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Base64:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={signatureData.messageBase64}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-xs"
                />
                <CopyButton text={signatureData.messageBase64} />
              </div>
            </div>
          </div>

          {/* Signature */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Signature ({signatureData.signatureBytes} bytes)
            </h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-600 mb-1">Hex:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={signatureData.signatureHex}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-xs"
                />
                <CopyButton text={signatureData.signatureHex} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Base64:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={signatureData.signatureBase64}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-xs"
                />
                <CopyButton text={signatureData.signatureBase64} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Information:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• This component uses the Web Crypto API with ECDSA P-256 curve</li>
          <li>• Messages are hashed with SHA-256 before signing</li>
          <li>• Public keys are 65 bytes (uncompressed format: 0x04 + 32-byte x + 32-byte y)</li>
          <li>
            • Signatures are 64 bytes (32-byte r + 32-byte s components, like Node.js elliptic)
          </li>
          <li>• DER signatures are parsed to extract raw r,s values</li>
          <li>• All operations are performed locally in your browser</li>
        </ul>
      </div>
    </div>
  )
}

export default P256Signer
