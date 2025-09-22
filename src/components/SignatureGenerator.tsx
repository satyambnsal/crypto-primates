'use client'
import React, { useState } from 'react'
import { ec as EC } from 'elliptic'
import './SignatureGenerator.css' // Optional: For styling

// Initialize secp256r1 curve
const ec = new EC('p256')

export const SignatureGenerator: React.FC = () => {
  const [message, setMessage] = useState<string>('hello world')
  const [payload, setPayload] = useState<string>('')
  const [error, setError] = useState<string>('')

  // Function to generate SHA-256 hash in browser
  const sha256 = async (message: string): Promise<Uint8Array> => {
    const msgBuffer = new TextEncoder().encode(message) // Encode as UTF-8
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer) // Hash
    return new Uint8Array(hashBuffer) // Convert to byte array
  }

  // Function to convert array-like to fixed-length Buffer (browser equivalent)
  const toFixedLengthBuffer = (value: any, length: number): Uint8Array => {
    const arr = value.toArray('be', length) // Big-endian, fixed length
    return new Uint8Array(arr)
  }

  // Function to convert hex to Base64
  const hexToBase64 = (hexString: string): string => {
    try {
      hexString = hexString.replace(/^0x/i, '').replace(/\s/g, '')
      if (!/^[0-9a-fA-F]+$/.test(hexString)) {
        throw new Error('Invalid hex string')
      }
      if (hexString.length % 2 !== 0) {
        hexString = '0' + hexString // Pad with leading zero
      }
      let binaryString = ''
      for (let i = 0; i < hexString.length; i += 2) {
        binaryString += String.fromCharCode(parseInt(hexString.substr(i, 2), 16))
      }
      return btoa(binaryString)
    } catch (error) {
      throw new Error(`Error converting hex to Base64: ${(error as Error).message}`)
    }
  }

  // Function to generate key pair, signature, and payload
  const generatePayload = async () => {
    try {
      setError('')

      // Generate key pair
      const keyPair = ec.genKeyPair()

      // Get public key (65 bytes, uncompressed: 0x04 || x || y)
      const publicKey = keyPair.getPublic().encode('hex', false) // 130 hex chars (65 bytes)

      // Hash the message
      const messageHash = await sha256(message)

      // Generate signature
      const signature = keyPair.sign(messageHash)
      const r = toFixedLengthBuffer(signature.r, 32) // 32 bytes
      const s = toFixedLengthBuffer(signature.s, 32) // 32 bytes
      const signatureBuffer = new Uint8Array([...r, ...s]) // Concatenate: 64 bytes

      // Convert signature to hex
      const signatureHex = Array.from(signatureBuffer)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('') // 128 hex chars (64 bytes)

      // Create Base64-encoded payload
      const payloadObj = {
        verify_secp256_r1_signature: {
          message: btoa(String.fromCharCode(...new TextEncoder().encode(message))), // ASCII to Base64
          signature: btoa(String.fromCharCode(...signatureBuffer)), // Signature to Base64
          public_key: hexToBase64(publicKey), // Public key to Base64
        },
      }

      // Set payload as JSON string
      setPayload(JSON.stringify(payloadObj, null, 2))
    } catch (error) {
      setError(`Error generating payload: ${(error as Error).message}`)
    }
  }

  // Function to copy payload to clipboard
  const copyToClipboard = () => {
    if (payload) {
      navigator.clipboard
        .writeText(payload)
        .then(() => alert('Payload copied to clipboard!'))
        .catch((err) => setError(`Failed to copy: ${err.message}`))
    }
  }

  return (
    <div className="signature-generator !text-black">
      <h2>Generate secp256r1 Signature</h2>
      <div>
        <label>Message:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          className="text-black"
        />
      </div>
      <button onClick={generatePayload}>Generate Payload</button>
      {payload && (
        <div>
          <h3>Payload:</h3>
          <textarea readOnly value={payload} rows={10} cols={50} style={{ resize: 'vertical' }} />
          <button onClick={copyToClipboard}>Copy Payload</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default SignatureGenerator
