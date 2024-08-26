use crate::*;
use near_sdk::{ext_contract, Gas, Promise};

const DEFAULT_GAS: Gas = Gas(300_000_000_000);

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Royalty {
    pub owner: u128,
    pub holders: Option<u128>,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct SendedContent {
    content_id: String,
    royalty: Royalty,
    content_type: String,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ReceivedContent {
    pub content_id: String,
    pub owner_id: AccountId,
    pub content_type: String,
    pub royalty: Royalty,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ReceivedCollection {
    pub collection_id: u64,
    pub total_supply: u64,
}

#[ext_contract(treasury_ext)]
pub trait Treasury {
    fn update_holder(&mut self, content_id: String, token_id: String, new_holder: AccountId);
    fn add_content(&mut self, content: ReceivedContent, collection: ReceivedCollection);
    fn get_content(&self, content_id: String) -> Option<SendedContent>;
}

// For methods we don't want to expose to everyone
impl Contract {
    pub fn treasury_update_holder(
        &self,
        content_id: String,
        token_id: String,
        new_holder: AccountId,
    ) -> Promise {
        treasury_ext::ext(self.treasury_contract_address.clone())
            .with_static_gas(DEFAULT_GAS)
            .update_holder(content_id, token_id, new_holder)
    }

    pub fn treasury_add_content(
        &mut self,
        content: ReceivedContent,
        collection: ReceivedCollection,
    ) -> Promise {
        treasury_ext::ext(self.treasury_contract_address.clone())
            .with_static_gas(DEFAULT_GAS)
            .add_content(content, collection)
    }

    pub fn treasury_assert_content_exists(&self, content_id: String) -> Promise {
        treasury_ext::ext(self.treasury_contract_address.clone())
            .get_content(content_id)
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(Gas(20_000_000_000_000))
                    .treasury_get_content_result(),
            )
    }
}

// callbacks
#[near_bindgen]
impl Contract {
    #[private]
    pub fn treasury_get_content_result(
        #[callback_unwrap] res: Option<SendedContent>,
        //#[callback_result] res: Result<Option<SendedContent>, near_sdk::PromiseError>,
    ) -> Option<SendedContent> {
        // if no content found, will panic
        res
    }

    //     #[private]
    //     pub fn treasury_update_holder_callback(
    //         #[callback_result] res: Result<(), near_sdk::PromiseError>,
    //     ) {
    //     }
}
