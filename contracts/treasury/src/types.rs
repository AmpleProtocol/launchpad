use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::Balance;
use near_sdk::{AccountId, Timestamp};

pub type ContentId = String;
pub type TokenId = String;
pub type CollectionId = u64;

pub const SER_ERROR: &str = "Error serializing storage key";

#[derive(BorshSerialize)]
pub enum StorageKeys {
    ContentById,
    AnalyticsByContent,
    CollectionByContent,
    ContentsByOwner,
    ClaimsByAccount,
    StreamsByAccount,
    AllowedAccounts,
    NewClaims(ContentId),
    NewAnalytics(ContentId),
    NewHolders(ContentId),
    NewStreams(AccountId, ContentId),
    NewCollections(CollectionId),
    NewContents(ContentId),
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Content {
    pub owner_id: AccountId,
    pub content_type: String,
    pub royalty: Royalty,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Collection {
    pub collection_id: CollectionId,
    pub total_supply: u64,
    pub holders_by_token_id: UnorderedMap<TokenId, AccountId>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Analytic {
    pub timestamp: Timestamp,
    pub streams: u128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Royalty {
    // declare percentages
    pub owner: u128,
    pub holders: Option<u128>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Claim {
    pub timestamp: Timestamp,
    pub claimed: Balance,
}
