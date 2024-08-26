// use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{AccountId, Timestamp};

use crate::*;

use self::utils::calculate_cuts;

#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct BulkAnalytics {
    content_id: ContentId,
    streams: U128,
}

#[near_bindgen]
impl Contract {
    /**
     * This will be called periodically to upload ample usage metrics to the contract
     */
    pub fn add_analytics_data(&mut self, bulk_analytics: BulkAnalytics, timestamp: Timestamp) {
        self.assert_allowed_caller();

        let content_id = &bulk_analytics.content_id;
        let streams = &bulk_analytics.streams.0;
        // let yocto_streams: Yocto = bulk_analytics.streams as u128 * YOCTO;

        // SAVE ANALYTIC RECORD
        // Iterate bulk data
        let new_analytic: Analytic = Analytic {
            timestamp,
            streams: bulk_analytics.streams.0,
        };
        // push a new item <Analytic>
        if let Some(analytics) = self.analytics_by_content_id.get_mut(content_id) {
            analytics.push(&new_analytic);
        } else {
            let mut new_analytics = Vector::new(
                StorageKeys::NewAnalytics(content_id.clone())
                    .try_to_vec()
                    .expect(SER_ERROR),
            );
            new_analytics.push(&new_analytic);

            self.analytics_by_content_id
                .entry(content_id.clone())
                .or_insert(new_analytics);
        }

        // SPLIT UP THE STREAMS COUNT AMONG OWNER AND HOLDERS
        // get content_by_id and his royalty table
        let content = self
            .content_by_id
            .get(content_id)
            .expect(&format!("No content found: {}", *content_id));
        let owner_account = &content.owner_id.clone();
        let royalty = &content.royalty;

        // get collection_by_content_id
        let collection = self.collection_by_content_id.get(content_id).unwrap();

        // calculate the total cut for each account of holders based on the collection's total_supply of nfts and holder's cut

        // log!("\nholders_cut");
        let holders_cut = calculate_cuts(royalty.holders.unwrap_or(0), *streams);
        let holder_percentage = (100 * SCALING_FACTOR) / collection.total_supply as u128;
        // log!("\nstreams_per_holder");
        let streams_per_holder = calculate_cuts(holder_percentage, holders_cut);

        // calculate initial owner's cut of streams
        // log!("\nowner_cut");
        let mut owner_cut = calculate_cuts(royalty.owner, *streams);

        // Count unassigned streams and sum it up to the owner's final cut
        let unassigned_holders_streams =
            holders_cut - (streams_per_holder * collection.holders_by_token_id.len() as u128);
        if unassigned_holders_streams > 0 {
            owner_cut += unassigned_holders_streams;
        }

        // log!( "holders_by_token_id: {}", collection.holders_by_token_id.len());
        // log!("New owner cut: {}", owner_cut);
        // log!("unassigned_holders_streams: {}", unassigned_holders_streams);

        // assign streams to accounts
        let holder_accounts = collection
            .holders_by_token_id
            .values()
            .collect::<Vec<AccountId>>();

        // holders
        for holder_account in holder_accounts {
            self.add_streams_to(&holder_account, content_id, streams_per_holder);
        }
        // owner
        self.add_streams_to(owner_account, content_id, owner_cut);
    }

    pub fn get_streams(&self, account_id: AccountId, content_id: ContentId) -> u128 {
        // log!("get_streams for {}", account_id);
        let streams_by_content = self
            .streams_by_account
            .get(&account_id)
            .expect("account_id not present in self.streams_by_account");

        streams_by_content
            .get(&content_id)
            .unwrap_or(&0u128)
            .clone()
    }
}
