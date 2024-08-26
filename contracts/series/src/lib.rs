use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, LookupSet, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{Base64VecU8, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, near_bindgen, require, AccountId, Balance, BorshStorageKey, CryptoHash, PanicOnDefault,
    Promise, PromiseOrValue,
};
use std::collections::HashMap;

pub use crate::approval::*;
pub use crate::events::*;
use crate::internal::*;
pub use crate::metadata::*;
pub use crate::nft_core::*;
// pub use crate::owner::*;
pub use crate::royalty::*;
// pub use crate::series::*;
// pub use crate::treasury_ext::*;

mod approval;
mod enumeration;
mod events;
mod internal;
mod metadata;
mod nft_core;
mod owner;
mod royalty;
mod series;
mod treasury_ext;

/// This spec can be treated like a version of the standard.
pub const NFT_METADATA_SPEC: &str = "1.0.0";
/// This is the name of the NFT standard we're using
pub const NFT_STANDARD_NAME: &str = "nep171";

// Represents the series type. All tokens will derive this data.
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Series {
    metadata: TokenMetadata,
    royalty: Option<HashMap<AccountId, u32>>,
    tokens: UnorderedSet<TokenId>,
    price: Option<Balance>,
    owner_id: AccountId,
    content_id: String,
}

pub type SeriesId = u64;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,
    pub approved_minters: LookupSet<AccountId>,
    pub approved_creators: LookupSet<AccountId>,
    pub series_by_id: UnorderedMap<SeriesId, Series>,
    pub tokens_by_id: UnorderedMap<TokenId, Token>,
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,
    pub metadata: LazyOption<NFTContractMetadata>,
    pub treasury_contract_address: AccountId,
    pub last_serie_id: u64,
}

/// Helper structure for keys of the persistent collections.
#[derive(BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
    ApprovedMinters,
    ApprovedCreators,
    SeriesById,
    SeriesByIdInner { account_id_hash: CryptoHash },
    TokensPerOwner,
    TokenPerOwnerInner { account_id_hash: CryptoHash },
    TokensById,
    NFTContractMetadata,
}

#[near_bindgen]
impl Contract {
    /*
        initialization function (can only be called once).
        this initializes the contract with default metadata so the
        user doesn't have to manually type metadata.
    */
    #[init]
    pub fn new_default_meta(owner_id: AccountId, treasury_contract_address: AccountId) -> Self {
        //calls the other function "new: with some default metadata and the owner_id passed in
        Self::new(
            owner_id,
            treasury_contract_address,
            NFTContractMetadata {
                spec: "nft-1.0.0".to_string(),
                name: "AMPLE NFT Contract".to_string(),
                symbol: "AMPLNFT".to_string(),
                icon: Some("https://nftstorage.link/ipfs/bafkreie6gutz6lyyy6at7ux42s63lbjhtxjwlz3tfv3kjrylfpxecfuqom".to_string()),
                base_uri: None,
                reference: Some("https://docsend.com/view/73hkgyxb6q8rzwyi".to_string()),
                reference_hash: None,
            },
        )
    }

    /*
        initialization function (can only be called once).
        this initializes the contract with metadata that was passed in and
        the owner_id.
    */
    #[init]
    pub fn new(
        owner_id: AccountId,
        treasury_contract_address: AccountId,
        metadata: NFTContractMetadata,
    ) -> Self {
        // Create the approved minters set and insert the owner
        let mut approved_minters =
            LookupSet::new(StorageKey::ApprovedMinters.try_to_vec().unwrap());
        approved_minters.insert(&owner_id);

        // Create the approved creators set and insert the owner
        let mut approved_creators =
            LookupSet::new(StorageKey::ApprovedCreators.try_to_vec().unwrap());
        approved_creators.insert(&owner_id);

        // Create a variable of type Self with all the fields initialized.
        let this = Self {
            approved_minters,
            approved_creators,
            series_by_id: UnorderedMap::new(StorageKey::SeriesById.try_to_vec().unwrap()),
            //Storage keys are simply the prefixes used for the collections. This helps avoid data collision
            tokens_per_owner: LookupMap::new(StorageKey::TokensPerOwner.try_to_vec().unwrap()),
            tokens_by_id: UnorderedMap::new(StorageKey::TokensById.try_to_vec().unwrap()),
            //set the &owner_id field equal to the passed in owner_id.
            owner_id,
            metadata: LazyOption::new(
                StorageKey::NFTContractMetadata.try_to_vec().unwrap(),
                Some(&metadata),
            ),
            treasury_contract_address,
            last_serie_id: 0,
        };

        //return the Contract object
        this
    }
}
