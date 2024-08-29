# Ample Protocol Treasury
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

4. Init contract with nft-series smart contract address as first param
```sh 
./contract_init.sh series.contract.near 
```

5. Add contents using 
```sh
# You may want to modify the uploaded content 
./add_content.sh
```

6. (optional) Add allowed accounts
You can add allowed accounts to give them permission to modify the treasury contract
```sh 
souce ./.env && near call $CONTRACT_NAME add_allowed_account '{"account_id": "someaccount.near"}' --accountId $ACCOUNT_ID
```