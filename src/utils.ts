export const sha256 = async (message: string): Promise<Uint8Array> => {
  try {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    return new Uint8Array(hashBuffer)
  } catch (err) {
    throw new Error(`SHA-256 hashing failed: ${(err as Error).message}`)
  }
}

export const toFixedLengthBuffer = (value: any, length: number): Uint8Array => {
  const arr = value.toArray('be', length)
  return new Uint8Array(arr)
}

export const hexToBase64 = (hexString: string): string => {
  try {
    hexString = hexString.replace(/^0x/i, '').replace(/\s/g, '')
    if (!/^[0-9a-fA-F]+$/.test(hexString)) {
      throw new Error('Invalid hex string')
    }
    if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString
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


export const getHexByteLength = (hexString: string): number => {
  hexString = hexString.replace(/^0x/i, '').replace(/\s/g, '')
  if (!/^[0-9a-fA-F]+$/.test(hexString)) {
    return 0
  }
  return hexString.length / 2
}


export const getMessageByteLength = (message: string): number => {
  return new TextEncoder().encode(message).length
}

