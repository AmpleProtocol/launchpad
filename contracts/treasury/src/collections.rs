use near_sdk::{env, AccountId};

use crate::*;

#[near_bindgen]
impl Contract {
    /**
     * The function will be called for every minted or transferred royalty NFT
     */
    pub fn update_holder(
        &mut self,
        content_id: ContentId,
        token_id: TokenId,
        new_holder: AccountId,
    ) {
        assert_eq!(
            &env::predecessor_account_id(),
            &self.series_contract_address,
            "Only Series NFT contract can call this method"
        );

        // 1. Retrieve the collection using collection_by_content_id
        let collection = self
            .collection_by_content_id
            .get_mut(&content_id)
            .expect("content_id not found");

        // 2. Modify collection.holders_by_token_id to match the new holder, if no holder found,
        //    crete the record
        collection
            .holders_by_token_id
            .insert(&token_id, &new_holder);

        // 3. Add holder streams record if doesn't exist already
        if self.streams_by_account.get(&new_holder.clone()).is_none() {
            self.streams_by_account.insert(
                new_holder.clone(),
                UnorderedMap::new(
                    StorageKeys::NewStreams(new_holder.clone(), content_id.clone())
                        .try_to_vec()
                        .expect(SER_ERROR),
                ),
            );
        }
    }

    pub fn get_tokens_by_holder(
        &self,
        content_id: ContentId,
        account_id: AccountId,
    ) -> Vec<String> {
        let collection = self
            .collection_by_content_id
            .get(&content_id)
            .expect("Non-existent content_id");

        let token_ids: Vec<String> = collection
            .holders_by_token_id
            .iter()
            .filter(|(_, holder)| {
                if holder == &account_id {
                    return true;
                } else {
                    return false;
                }
            })
            .map(|(token_id, _)| token_id)
            .collect();

        return token_ids;
    }
}
