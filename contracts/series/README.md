# Ample Protocol Series
A [NEAR](https://near.org) NFTs smart contract. This is meant to work with the [treasury](../treasury/README.md) smart contract 

## Quickstart
1. Install near cli and login 
```sh 
npm i -g near-cli
```
```sh 
# For testnet login
near login
# For mainnet login
near login --networkId mainnet
```

2. Create `.env` file, see `.env.example` for reference

3. Deploy contract using `deploy.sh` script

```sh 
./deploy.sh
```

4. Init contract with default meta (note that if you want to customize this information, you can either call `new` method with the corresponding metadata or modify the `new_default_meta` method with your custom metadata)
```sh 
source ./.env && near call $CONTRACT_NAME new_default_meta '{"owner_id": "'$ACCOUNT_ID'", "treasury_contract_address": "treasury.contract.testnet"}' --accountId $ACCOUNT_ID --networkId $NEAR_NETWORK
```
