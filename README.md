# Crypto Primates Demonstrates how to verify various elliptic curve schemes with XION contract
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


# Commands
Create new Account
```
xiond keys add <keyname>
```
Retried Public Key
```bash
xiond keys show <keyname>
```
 
```
xiond query bank balances $ACC1 --node $RPC_URL
```
Transfer amount
```bash
xiond tx bank send $ACC1 $ACC2 10uxion --chain-id xion-testnet-2 \
--node $RPC_URL \
--from $ACC1 \
--gas-prices 0.025uxion \
--gas auto \ 
--gas-adjustment 1.3 \
-y
```

**Optimize Contract: ** Compile and optimize the smart contract using CosmWasm Optimizing Compiler
```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0
```

Upload contracts on-chain

```bash
RES=$(xiond tx wasm store ./artifacts/cw_counter.wasm \
--chain-id xion-testnet-2 \
--gas-adjustment 1.3 \
--gas-prices 0.001uxion \
--gas auto \
-y --output json \
--node $RPC_URL \
--from $ACC1)
```

Set the retrieved TXHASH in `.env.local`

**Retrieve the Code ID: The Code ID is required for creating an instance of your contract**

```bash
CODE_ID=$(xiond query tx $TX_HASH --node $RPC_URL --output json | jq -r '.events[-1].attributes[1].value')
```
See the Code ID using echo $CODE_ID and set it in `.env.local`

### Instantiate the Contract

Each contract requires a unique initalization message based on its expected parameters. In the case of the Counter contract, the only required variable is count, which is of type i32
MSG='{ "count": 1 }'

```bash
xiond tx wasm instantiate $CODE_ID "$MSG" \
--from $ACC1 \
--label "cw-secp256-satyam" \
--gas-prices 0.025uxion \
--gas auto \
--gas-adjustment 1.3 \
-y --no-admin \
--chain-id xion-testnet-2 \
--node $RPC_URL
```

Retrieve the Contract Address
```bash
CONTRACT=$(xiond query tx $DEPLOY_TXHASH \
--node $RPC_URL \
--output json | jq -r '.events[] | select(.type == "instantiate") | .attributes[] | select(.key == "_contract_address") | .value')
```
Get contract address using `echo $CONTRACT` and set it in .env.local

Query the Contract
```bash
QUERY='{"get_count": {}}'
```
QUERY='{"verify_secp256_r1_signature":{"message":"TVXJnva9VGIWYsPREMPLYnwD1jETk7Jkq5e5CksVIUpVk7olEKU9Y/s0viUfrLaXyXPhG2Zct5IPFoSwAxtN03DLknynFosL+K0oXgXp4x40vCQCRzn9wQt4WG8p7/lEEgNOO2Bu2FDsLBkA6OaBUfxK7lreuwZuttpOqlaBN44=","signature":"HMYoUz0ABLKyDn9LqtC4u14Gc9sVm7zPkkka72H8liCIDgu/gqjPgY7Ua6A88PxsiY42/KNsx/2x0tt1A2NEMA==","public_key":"BLgYi9aHAfw5batTEl1NKOozqR2vbSFIX0dw9uqMVl3eQj8FiBDyd/j+B29ttW6ShaG/LCodrhRQle3ZwElwvEo="}}'


QUERY='{"verify_secp256_r1_signature":{"message":"aGVsbG8gd29ybGQ=","public_key":"A2YtPozW+jyugIXGQNFQPqAJhY5sre7CeaPf0HNUn/2v","signature":"MEQCIFDXw+MqxKdzuGxkC/gcundboSJQ7Hr8Qwr9EaVI6QKPAiBmZ6Di0+D4p1ub30w/iyyG4Tc/N6oZIW1yFHQ7Z9Qd6Q=="}}'

QUERY='{"verify_secp256_r1_signature":{"message":"aGVsbG8gd29ybGQ=","signature":"McXxkGuKByhSdHnCrhwsmmnuGM9hjtT+a+TyU2Dm3yZ0r9hCfm35+7ADWwZnAahvFgdqPB663wAvaTCsM6lFsQ==","public_key":"BM1CzjNlAKYNAlhjD2LYt0AxXU8I2oadLmH/GZ8nDr98PGCwfSj6EPEBbTU6WjfguAfBNU/+N3Cl15ZM1wX02rM="}}'

QUERY='{
  "verify_secp256_r1_signature": {
    "message": "cmFt",
    "signature": "tdXexa8ueffSNbqJe69TsYHApSBmKGcphlCVFDOaNXBTM/EfMUOtlw1gdTfmqcJRzXjOnnU+Da4J7fLSnk3dRQ==",
    "public_key": "BHNxMJPnlJ/C1qkD9D/CIeTZpTdo99l+kUP/iQcIxMnngelrl36Ho6q0xtsoaYeK/N3ad42fuu/v6n/57YPgEI4="
  }
}'
verify_secp256_r1_signature
```bash
xiond query wasm contract-state smart $CONTRACT_ADDRESS "$QUERY" --output json --node $RPC_URL
```

Execute Transactions
```bash
TRY_INCREMENT='{"increment": {}}'
```
```bash
xiond tx wasm execute $CONTRACT_ADDRESS "$TRY_INCREMENT" \
--from $ACC1 \
--gas-prices 0.025uxion \
--gas auto \
--gas-adjustment 1.3 \
-y \
--node $RPC_URL \
--chain-id $CHAIN_ID
```
