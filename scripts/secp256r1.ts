const { ec: EC } = require('elliptic')
const crypto = require('crypto')
const fs = require('fs')

const ec = new EC('p256')

const keyPair = ec.genKeyPair();

const message = "hello world";
const messageHash = crypto.createHash('sha256').update(message).digest();

const publicKey = keyPair.getPublic().encode('hex', false)
console.log("public key", publicKey)
console.log("public key length: ", publicKey.length)
const signature = keyPair.sign(messageHash)
const r = signature.r.toArrayLike(Buffer, 'be', 32)
const s = signature.s.toArrayLike(Buffer, 'be', 32)

console.log(r, s)
const signatureBuffer = Buffer.concat([r, s])

const signatureHex = signatureBuffer.toString('hex')

console.log(signatureHex, signatureHex.length)


const payload = {
  "verify_secp256_r1_signature": {
    message: Buffer.from(message, 'ascii').toString('base64'),
    signature: signatureBuffer.toString('base64'),
    public_key: Buffer.from(publicKey, 'hex').toString('base64')
  }
}

fs.writeFileSync('payload.json', JSON.stringify(payload))


