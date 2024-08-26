# Ample Protocol Series
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

5. Create a new royalty serie (with a limited total supply).
Note that the content_id should be registered in the treasury contract before creating the collection
```sh 
source ./.env && near call $CONTRACT_NAME create_series '{"id":1,"metadata":{"title":"Metaverse Genesis Royalty NFT","description":"A joint collaboration between two of Ample’s creators, Pouya D x Trippie Steff. The Birth and Fall of the Internet all glazed up in a Pink Bubblegum Nightmare. Rewards from being a part of the Metaverse Genesis team are included","media":"https://bafybeid2grp577ermth5twh3e6hb6q7lzslp3nnsjftpey2hxomuhogsgi.ipfs.nftstorage.link/MG_Final_Pepe_NFT.gif","media_hash":null,"copies":10000,"issued_at":null,"updated_at":null,"extra":null,"reference":null,"reference_hash":null},"content_id":"JefRgdPaN5zrCaBzB5qh","royalty":null,"price":"1000000000000000000000000","owner":"'$ACCOUNT_ID'"}' --amount 1 --gas 300000000000000 --accountId $ACCOUNT_ID --networkId $NEAR_NETWORK
```

6. Create a new rental serie (with no total supply defined)
```sh 
source ./.env && near call $CONTRACT_NAME create_series '{"id":2,"metadata":{"title":"Metaverse Genesis Rental NFT","description":"A joint collaboration between two of Ample’s creators, Pouya D x Trippie Steff. The Birth and Fall of the Internet all glazed up in a Pink Bubblegum Nightmare. Rewards from being a part of the Metaverse Genesis team are included","media":"https://bafybeier3d5vxxzue5ey3sxbe7qozko2eym5pnpjibm3gvlrffvw2beoxi.ipfs.w3s.link/MG_NFT_Artwork.jpg","media_hash":null,"copies":null,"issued_at":null,"updated_at":null,"extra":null,"reference":null,"reference_hash":null},"content_id":"JefRgdPaN5zrCaBzB5qh","royalty":null,"price":"200000000000000000000000","owner":"'$ACCOUNT_ID'"}' --amount 1 --gas 300000000000000 --accountId $ACCOUNT_ID --networkId $NEAR_NETWORK
```
