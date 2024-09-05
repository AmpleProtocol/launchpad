#!/bin/bash

# Bring variables form ./config.sh
source ./.env
source ./build.sh

# Function definitions
account_exists() {
	echo "Verifying account..."
	near state $CONTRACT_NAME --networkId $NEAR_NETWORK
}
create_account() {
	echo "Creating account..."
	near create-account $CONTRACT_NAME --masterAccount $ACCOUNT_ID --initialBalance 20 --networkId $NEAR_NETWORK
}

# contract name assertion/creation
account_exists || create_account 
 
# contract deployment
echo "Deploying contract..."
near deploy $CONTRACT_NAME ./target/wasm32-unknown-unknown/release/series.optimized.wasm --networkId $NEAR_NETWORK

