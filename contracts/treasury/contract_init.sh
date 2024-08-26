#!/bin/bash

source ./.env

# Run this only the first time you deploy a contract.
# If you redeploy with a differente contract name, run it again.

if [ -z "$1" ]; then
	echo "Must call this script with the series smart contract as 1st argument"
	exit 1
fi


echo "Initializing contract..."
near call $CONTRACT_NAME init_contract '{"series_contract_address": "'$1'"}' --accountId $ACCOUNT_ID --networkId $NEAR_NETWORK \
&& \
echo "Done initializing contract, remember that $ACCOUNT_ID is the first allowed account of the contract"
