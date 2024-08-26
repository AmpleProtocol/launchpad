use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::store::{UnorderedMap, UnorderedSet};
use near_sdk::{env, near_bindgen, Balance, PanicOnDefault};
use near_sdk::{store::LookupMap, AccountId};

mod accounts;
mod analytics;
mod collections;
mod content;
mod royalties;
mod security;
mod types;
mod utils;

// pub use crate::accounts::*;
pub use crate::analytics::*;
// pub use crate::collections::*;
pub use crate::content::*;
// pub use crate::royalties::*;
// pub use crate::security::*;
pub use crate::types::*;

// Describes the price per stream, which is used here as some sort of currency
pub const STREAM_TOKEN: Balance = 1_000_000_000_000_000_000_000; // 0.001 NEAR
                                                                 // An arbitrary scaling factor used to eliminate floating point numbers from the contract
pub const SCALING_FACTOR: u128 = 100_000_000u128;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub content_by_id: UnorderedMap<ContentId, Content>,
    pub analytics_by_content_id: LookupMap<ContentId, Vector<Analytic>>,
    pub collection_by_content_id: LookupMap<ContentId, Collection>,
    pub contents_by_owner: LookupMap<AccountId, Vector<ContentId>>,
    pub claims_by_account: LookupMap<AccountId, Vector<Claim>>,
    pub streams_by_account: LookupMap<AccountId, UnorderedMap<ContentId, u128>>,
    pub allowed_accounts: UnorderedSet<AccountId>,
    pub series_contract_address: AccountId,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn init_contract(series_contract_address: AccountId) -> Self {
        let mut allowed_accounts: UnorderedSet<AccountId> =
            UnorderedSet::new(StorageKeys::AllowedAccounts.try_to_vec().unwrap());

        // adds the current signer as first allowed account
        allowed_accounts.insert(env::signer_account_id());

        Self {
            content_by_id: UnorderedMap::new(StorageKeys::ContentById.try_to_vec().unwrap()),
            analytics_by_content_id: LookupMap::new(
                StorageKeys::AnalyticsByContent.try_to_vec().unwrap(),
            ),
            collection_by_content_id: LookupMap::new(
                StorageKeys::CollectionByContent.try_to_vec().unwrap(),
            ),
            contents_by_owner: LookupMap::new(StorageKeys::ContentsByOwner.try_to_vec().unwrap()),
            claims_by_account: LookupMap::new(StorageKeys::ClaimsByAccount.try_to_vec().unwrap()),
            streams_by_account: LookupMap::new(StorageKeys::StreamsByAccount.try_to_vec().unwrap()),
            allowed_accounts,
            series_contract_address,
        }
    }

    pub fn set_series_contract_address(&mut self, new_address: AccountId) {
        self.assert_allowed_caller();
        self.series_contract_address = new_address;
    }

    pub fn get_series_contract_address(&self) -> AccountId {
        self.series_contract_address.clone()
    }

    pub fn ping() -> String {
        "pong".to_string()
    }
}
