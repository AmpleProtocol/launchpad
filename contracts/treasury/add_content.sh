#!/bin/sh
source ./.env

near call $CONTRACT_NAME add_content '{"content":{"content_id":"JefRgdPaN5zrCaBzB5qh","owner_id":"'$ACCOUNT_ID'","content_type":"film","royalty":{"owner":50,"holders":50}},"collection":{"collection_id":1,"total_supply":10000}}' --accountId $ACCOUNT_ID --networkId $NEAR_NETWORK
