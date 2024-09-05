use std::collections::HashSet;

use crate::nft_core::NonFungibleTokenCore;
use crate::*;

/// Struct to return in views to query for specific data related to a series
#[derive(BorshDeserialize, BorshSerialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct JsonSeries {
    series_id: u64,
    metadata: TokenMetadata,
    royalty: Option<HashMap<AccountId, u32>>,
    price: Option<U128>,
    owner_id: AccountId,
    content_id: String,
    valid_period: Option<u64>,
}

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ValidNFT {
    token_id: TokenId,
    expires_at: Option<u64>,
}

#[near_bindgen]
impl Contract {
    //Query for the total supply of NFTs on the contract
    pub fn nft_total_supply(&self) -> U128 {
        //return the length of the tokens by id
        U128(self.tokens_by_id.len() as u128)
    }

    //Query for nft tokens on the contract regardless of the owner using pagination
    pub fn nft_tokens(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<JsonToken> {
        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = u128::from(from_index.unwrap_or(U128(0)));

        //iterate through each token using an iterator
        self.tokens_by_id
            .keys()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 50
            .take(limit.unwrap_or(50) as usize)
            //we'll map the token IDs which are strings into Json Tokens
            .map(|token_id| self.nft_token(token_id.clone()).unwrap())
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    //get the total supply of NFTs for a given owner
    pub fn nft_supply_for_owner(&self, account_id: AccountId) -> U128 {
        //get the set of tokens for the passed in owner
        let tokens_for_owner_set = self.tokens_per_owner.get(&account_id);

        //if there is some set of tokens, we'll return the length as a U128
        if let Some(tokens_for_owner_set) = tokens_for_owner_set {
            U128(tokens_for_owner_set.len() as u128)
        } else {
            //if there isn't a set of tokens for the passed in account ID, we'll return 0
            U128(0)
        }
    }

    //Query for all the tokens for an owner
    pub fn nft_tokens_for_owner(
        &self,
        account_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
        serie_id: Option<u64>,
    ) -> Vec<JsonToken> {
        let tokens_for_owner_set = self.tokens_per_owner.get(&account_id);

        let tokens = if let Some(tokens_for_owner_set) = tokens_for_owner_set {
            tokens_for_owner_set
        } else {
            return vec![];
        };

        let start = u128::from(from_index.unwrap_or(U128(0)));

        tokens
            .iter()
            .skip(start as usize)
            .take(limit.unwrap_or(50) as usize)
            .map(|token_id| self.nft_token(token_id.clone()).unwrap())
            .filter(|json_token| match serie_id {
                Some(id) if json_token.series_id == id => true,
                Some(id) if json_token.series_id != id => false,
                Some(_) => false,
                None => true,
            })
            .collect()
    }

    // Get the total supply of series on the contract
    pub fn get_series_total_supply(&self) -> u64 {
        self.series_by_id.len()
    }

    // Paginate through all the series on the contract and return the a vector of JsonSeries
    pub fn get_series(&self, from_index: Option<U128>, limit: Option<u64>) -> Vec<JsonSeries> {
        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = u128::from(from_index.unwrap_or(U128(0)));

        //iterate through each series using an iterator
        self.series_by_id
            .keys()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 50
            .take(limit.unwrap_or(50) as usize)
            //we'll map the series IDs which are strings into Json Series
            .map(|series_id| self.get_series_details(series_id.clone()).unwrap())
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    pub fn nft_series_for_owner(
        &self,
        account_id: AccountId,
        serie_type: Option<String>,
    ) -> Vec<JsonSeries> {
        // 1. get user nfts
        let owned_series_ids: Vec<u64> = self
            .nft_tokens_for_owner(account_id.clone(), None, None, None)
            .iter()
            .map(|json_nft| json_nft.series_id)
            .filter(|&series_id| {
                // Use a HashSet to check for uniqueness
                static mut ID_SET: Option<HashSet<u64>> = None;
                unsafe { ID_SET.get_or_insert_with(HashSet::new).insert(series_id) }
            })
            .collect();

        // 2. get series information
        owned_series_ids
            .into_iter()
            .filter_map(|series_id| {
                let series_details = self.get_series_details(series_id);
                match (serie_type.as_deref(), series_details) {
                    (Some("royalty"), Some(json_serie)) if json_serie.metadata.copies.is_some() => {
                        Some(json_serie)
                    }
                    (Some("rental"), Some(json_serie)) if json_serie.metadata.copies.is_none() => {
                        Some(json_serie)
                    }
                    (None, Some(json_serie)) => Some(json_serie),
                    _ => None,
                }
            })
            .collect()
    }

    // get info for a specific series
    pub fn get_series_details(&self, id: u64) -> Option<JsonSeries> {
        //get the series from the map
        let series = self.series_by_id.get(&id);
        //if there is some series, we'll return the series
        if let Some(series) = series {
            Some(JsonSeries {
                series_id: id,
                metadata: series.metadata,
                royalty: series.royalty,
                price: Some(U128::from(series.price.unwrap_or(0))),
                owner_id: series.owner_id,
                content_id: series.content_id,
                valid_period: series.valid_period,
            })
        } else {
            //if there isn't a series, we'll return None
            None
        }
    }

    //get the total supply of NFTs on a current series
    pub fn nft_supply_for_series(&self, id: u64) -> U128 {
        //get the series
        let series = self.series_by_id.get(&id);

        //if there is some series, get the length of the tokens. Otherwise return -
        if let Some(series) = series {
            U128(series.tokens.len() as u128)
        } else {
            U128(0)
        }
    }

    /// Paginate through NFTs within a given series
    pub fn nft_tokens_for_series(
        &self,
        id: u64,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<JsonToken> {
        // Get the series and its tokens
        let series = self.series_by_id.get(&id);
        let tokens = if let Some(series) = series {
            series.tokens
        } else {
            return vec![];
        };

        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = u128::from(from_index.unwrap_or(U128(0)));

        //iterate through the tokens
        tokens
            .iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 50
            .take(limit.unwrap_or(50) as usize)
            //we'll map the token IDs which are strings into Json Tokens
            .map(|token_id| self.nft_token(token_id.clone()).unwrap())
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }
    pub fn valid_nft_for_content(
        &self,
        content_id: String,
        account_id: AccountId,
    ) -> Option<ValidNFT> {
        let current_timestamp = env::block_timestamp_ms();
        let owned_tokens_ids = self.tokens_per_owner.get(&account_id);

        let content_series_ids: Vec<SeriesId> = self
            .series_by_id
            .iter()
            .filter(|(_, serie)| serie.content_id.clone() == content_id.clone())
            .map(|(serie_id, _)| serie_id)
            .collect();

        if let Some(tokens_id) = owned_tokens_ids {
            let valid_tokens: Vec<(TokenId, Token)> = tokens_id
                .iter()
                .map(|token_id| (token_id.clone(), self.tokens_by_id.get(&token_id).unwrap()))
                .filter(|(_, token)| {
                    if let Some(expires) = token.expires_at {
                        expires > current_timestamp
                            && content_series_ids.contains(&token.series_id.clone())
                    } else {
                        content_series_ids.contains(&token.series_id.clone())
                    }
                })
                .collect();

            if valid_tokens.len() > 0 {
                return Some(ValidNFT {
                    token_id: valid_tokens[0].0.clone(),
                    expires_at: valid_tokens[0].1.expires_at,
                });
            }
        }
        return None;
    }

    pub fn tokens_by_time_range(&self, ms_to_substract: u64, serie_id: SeriesId) -> usize {
        let now = env::block_timestamp_ms();
        let starting_from = now - ms_to_substract;
        let tokens = self.tokens_by_id.values_as_vector();

        // get all tokens issued between now and now - ms_to_substract
        let filtered_tokens = tokens
            .iter()
            .filter(|token| token.series_id == serie_id && token.issued_at > starting_from)
            .count();

        // return the count
        return filtered_tokens;
    }
}
