use core::panic;

use near_sdk::{json_types::U64, PromiseResult};
use treasury_ext::{ReceivedCollection, ReceivedContent, Royalty};

use crate::*;

// const ONE_DAY_MS: u64 = 86400000;
const FIVE_MINUTES_MS: u64 = 300000;
const MAX_COPIES_ALLOWED: u64 = 100_000_000_000;

#[near_bindgen]
impl Contract {
    /// Create a new series. The caller must be an approved creator. All tokens in the series will inherit the same metadata
    /// If copies are set in the metadata, it will enforce that only that number of NFTs can be minted. If not, unlimited NFTs can be minted.
    /// If a title is set in the metadata, enumeration methods will return the `${title} - ${edition}` else, `${series_id} - ${edition}`
    /// All token IDs internally are stored as `${series_id}:${edition}`
    /// Caller must attach enough $NEAR to cover storage.
    #[payable]
    pub fn create_series(
        &mut self,
        id: u64,
        metadata: TokenMetadata,
        content_id: String,
        royalty: Option<HashMap<AccountId, u32>>,
        treasury_royalty: Option<Royalty>,
        price: Option<U128>,
        owner: AccountId,
    ) {
        // Measure the initial storage being used on the contract
        let initial_storage_usage = env::storage_usage();

        // Ensure the caller is an approved creator
        let caller = env::predecessor_account_id();
        require!(
            self.approved_creators.contains(&caller),
            "only approved creators can create collections"
        );

        if let Some(copies) = metadata.copies {
            require!(
                copies <= MAX_COPIES_ALLOWED,
                format!("Can't exceed {} copies", MAX_COPIES_ALLOWED)
            );
        }

        // ensure royalty is not larger than 100
        if let Some(royalty) = royalty.clone() {
            let sum: u32 = royalty.values().sum();
            require!(
                sum <= 100,
                "The sum of all royalty values is larger than 100"
            );
        }

        // create a new serie_id
        // let new_serie_id = self.create_serie_id();
        // if there are copies specified in the metadata, it means it's a royalty collection and bc
        // of that, we need to add the content to the treasury
        if let Some(copies) = metadata.copies {
            self.treasury_add_content(
                ReceivedContent {
                    content_id: content_id.clone(),
                    owner_id: owner.clone(),
                    content_type: "film".to_string(),
                    royalty: treasury_royalty.expect("A treasury_royalty field must be provided when creating royalty collections") ,
                },
                ReceivedCollection {
                    collection_id: id.clone(),
                    total_supply: copies,
                },
            )
            .then(
                Self::ext(env::current_account_id())
                    .with_attached_deposit(env::attached_deposit())
                    .on_content_added(
                        caller.clone(),
                        initial_storage_usage,
                        id.clone(),
                        metadata.clone(),
                        content_id.clone(),
                        royalty.clone(),
                        price,
                        owner.clone(),
                    ),
            );
        } else {
            self.insert_serie(
                caller,
                initial_storage_usage,
                id.clone(),
                metadata,
                content_id,
                royalty,
                price,
                owner,
            )
        }
    }

    #[private]
    #[payable]
    pub fn on_content_added(
        &mut self,
        caller: AccountId,
        initial_storage_usage: u64,
        id: u64,
        metadata: TokenMetadata,
        content_id: String,
        royalty: Option<HashMap<AccountId, u32>>,
        price: Option<U128>,
        owner: AccountId,
    ) {
        if let PromiseResult::Failed = env::promise_result(0) {
            panic!("Something went wrong adding the content to treasury")
        }

        self.insert_serie(
            caller,
            initial_storage_usage,
            id,
            metadata,
            content_id,
            royalty,
            price,
            owner,
        )
    }

    /// Mint a new NFT that is part of a series. The caller must be an approved minter.
    /// The series ID must exist and if the metadata specifies a copy limit, you cannot exceed it.
    #[payable]
    pub fn nft_mint(&mut self, id: U64, receiver_id: AccountId) {
        // Measure the initial storage being used on the contract
        let initial_storage_usage = env::storage_usage();

        // Get the series and how many tokens currently exist (edition number = cur_len + 1)
        let mut series = self.series_by_id.get(&id.0).expect("Not a series");

        // Check if the series has a price per token. If it does, ensure the caller has attached at least that amount
        let mut price_per_token = 0;
        if let Some(price) = series.price {
            price_per_token = price;
            require!(
                env::attached_deposit() >= price_per_token,
                "Need to attach at least enough to cover price"
            );
        // If the series doesn't have a price, ensure the caller is an approved minter.
        } else {
            let predecessor = env::predecessor_account_id();
            assert!(
                self.approved_minters.contains(&predecessor),
                "Not approved minter"
            );
        }

        let cur_len = series.tokens.len();
        // Ensure we haven't overflowed on the number of copies minted
        if let Some(copies) = series.metadata.copies {
            require!(
                cur_len < copies,
                "cannot mint anymore NFTs for the given series. Limit reached"
            );
        }

        // The token ID is stored internally as `${series_id}:${edition}`
        let token_id = format!("{}:{}", id.0, cur_len + 1);
        series.tokens.insert(&token_id);
        self.series_by_id.insert(&id.0, &series);

        let now = env::block_timestamp_ms();

        //specify the token struct that contains the owner ID
        let mut token = Token {
            series_id: id.0,
            owner_id: receiver_id.clone(),
            approved_account_ids: Default::default(),
            next_approval_id: 0,
            issued_at: now,
            expires_at: None,
        };

        if series.metadata.copies.is_none() {
            token.expires_at = Some(now + FIVE_MINUTES_MS);
        }

        //insert the token ID and token struct and make sure that the token doesn't exist
        require!(
            self.tokens_by_id.insert(&token_id, &token).is_none(),
            "Token already exists"
        );

        //call the internal method for adding the token to the owner
        self.internal_add_token_to_owner(&token.owner_id, &token_id);

        // Construct the mint log as per the events standard.
        let nft_mint_log: EventLog = EventLog {
            standard: NFT_STANDARD_NAME.to_string(),
            version: NFT_METADATA_SPEC.to_string(),
            event: EventLogVariant::NftMint(vec![NftMintLog {
                owner_id: token.owner_id.to_string(),
                token_ids: vec![token_id.to_string()],
                memo: None,
            }]),
        };

        // Log the serialized json.
        env::log_str(&nft_mint_log.to_string());

        //calculate the required storage which was the used - initial
        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;

        // If there's some price for the token, we'll payout the series owner. Otherwise, refund the excess deposit for storage to the caller
        if price_per_token > 0 {
            payout_series_owner(required_storage_in_bytes, price_per_token, series.owner_id);
        } else {
            refund_deposit(required_storage_in_bytes);
        }

        // If the serie is royalty, notify treasury contract about this aquisition
        // here we assume that if the series has a limited amount of copies, then it is of type
        // royalty
        if series.metadata.copies.is_some() {
            self.treasury_update_holder(series.content_id.clone(), token_id, receiver_id.clone());
        }
    }

    fn insert_serie(
        &mut self,
        caller: AccountId,
        initial_storage_usage: u64,
        id: u64,
        metadata: TokenMetadata,
        content_id: String,
        royalty: Option<HashMap<AccountId, u32>>,
        price: Option<U128>,
        owner: AccountId,
    ) {
        assert_at_least_one_yocto();

        // Insert the series and ensure it doesn't already exist
        require!(
            self.series_by_id
                .insert(
                    &id,
                    &Series {
                        metadata,
                        royalty,
                        tokens: UnorderedSet::new(StorageKey::SeriesByIdInner {
                            // We get a new unique prefix for the collection
                            account_id_hash: hash_account_id(&format!("{}:{}", id, caller)),
                        }),
                        owner_id: owner,
                        price: price.map(|p| p.into()),
                        content_id
                    }
                )
                .is_none(),
            "collection ID already exists"
        );

        //calculate the required storage which was the used - initial
        let required_storage_in_bytes = env::storage_usage() - initial_storage_usage;

        //refund any excess storage if the user attached too much. Panic if they didn't attach enough to cover the required.
        refund_deposit(required_storage_in_bytes);
    }

    // fn create_serie_id(&mut self) -> u64 {
    //     self.last_serie_id = self.last_serie_id + 1;
    //     return self.last_serie_id;
    // }
}
