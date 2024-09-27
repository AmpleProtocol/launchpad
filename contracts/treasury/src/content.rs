use crate::*;
use near_sdk::collections::UnorderedMap;
use near_sdk::serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct JsonRoyalty {
    pub owner: u8,
    pub holders: Option<u8>,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ReceivedContent {
    pub content_id: String,
    pub owner_id: AccountId,
    pub content_type: String,
    pub royalty: JsonRoyalty,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ReceivedCollection {
    pub collection_id: u64,
    pub total_supply: u64,
}

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct SendedContent {
    content_id: String,
    royalty: Royalty,
    content_type: String,
}

#[near_bindgen]
impl Contract {
    /**
     * creates a new content and collection in the contract
     */
    pub fn add_content(&mut self, content: ReceivedContent, collection: ReceivedCollection) {
        assert!(
            env::predecessor_account_id() == self.series_contract_address,
            "Only Series NFT contract can call this method"
        );

        // create a Content record with ReceivedContent
        assert!(
            (content.royalty.owner + content.royalty.holders.unwrap_or(0)) == 100,
            "Royalty table must sum up to a total of 100 (percent)"
        );

        let royalty = Royalty {
            owner: content.royalty.owner as u128 * SCALING_FACTOR,
            holders: match content.royalty.holders {
                Some(holders) => Some(holders as u128 * SCALING_FACTOR),
                None => None,
            },
        };

        let new_content: Content = Content {
            owner_id: content.owner_id.clone(),
            content_type: content.content_type,
            royalty,
        };

        // create the content record
        self.content_by_id
            .insert(content.content_id.clone(), new_content);

        // create the collection for this content
        let new_collection = Collection {
            collection_id: collection.collection_id,
            total_supply: collection.total_supply,
            holders_by_token_id: UnorderedMap::new(
                StorageKeys::NewCollections(collection.collection_id)
                    .try_to_vec()
                    .expect(SER_ERROR),
            ),
        };
        self.collection_by_content_id
            .insert(content.content_id.clone(), new_collection);

        // add the content_id to the given owner's contents list
        match self.contents_by_owner.get_mut(&content.owner_id.clone()) {
            Some(contents) => {
                contents.push(&content.content_id.clone());
            }
            None => {
                let mut new_contents = Vector::new(
                    StorageKeys::NewContents(content.content_id.clone())
                        .try_to_vec()
                        .expect(SER_ERROR),
                );

                new_contents.push(&content.content_id.clone());

                self.contents_by_owner
                    .insert(content.owner_id.clone(), new_contents);
            }
        }
    }

    /**
     * Gets the content information for the provided content_id if any
     */
    pub fn get_content(&self, content_id: String) -> Option<SendedContent> {
        let content = self.content_by_id.get(&content_id).expect("Not found");

        Some(SendedContent {
            content_id: content_id.clone(),
            content_type: content.content_type.clone(),
            royalty: content.royalty.clone(),
        })
    }

    /**
     * Gets all of the contents on the contract
     */
    pub fn get_contents(&self) -> Vec<SendedContent> {
        self.content_by_id
            .iter()
            .map(|(id, content)| SendedContent {
                content_id: id.clone(),
                content_type: content.content_type.clone(),
                royalty: content.royalty.clone(),
            })
            .collect()
    }
}
