use near_sdk::{env, Promise};

use crate::*;

#[near_bindgen]
impl Contract {
    /**
     * This view method will be called by any account registered in streams_by_account to know
     * their current STREAMS_TOKEN balance
     */
    pub fn calculate_royalties(&self, content_id: ContentId, account_id: AccountId) -> Balance {
        // Find his record on self.streams_by_account and return it, if no record is found panic
        let streams_record = self
            .streams_by_account
            .get(&account_id)
            .expect("account_id not registered in the contract");

        // Find the streams count for the given content_id
        // note: streams are scaled by SCALING_FACTOR
        let streams_by_content = streams_record.get(&content_id).unwrap_or(&0);

        // We divide STREAM_TOKEN / SCALING_FACTOR to find the difference of 0s and rescale the value
        // properly
        let streams_as_yocto = streams_by_content * (STREAM_TOKEN / SCALING_FACTOR);
        streams_as_yocto as Balance
    }

    /**
     * The method is intended to be called by any account registered in streams_by_account
     * to exchange their STREAMS_TOKEN balance for actual NEAR FT.
     * This will also reset the account STREAMS_TOKEN balance to 0 and update the last
     * claim timestamp
     */
    // #[payable]
    pub fn claim_royalties(&mut self, content_id: ContentId) {
        // assert_one_yocto();

        let timestamp = env::block_timestamp_ms();
        // 1. get caller_account
        let caller_account = env::signer_account_id();

        // 2. call calculate_royalties() to get the user streams count as yoctoNEAR
        let royalties = self.calculate_royalties(content_id.clone(), caller_account.clone());
        assert!(royalties > 0, "No royalties to claim");

        // 3. transfer royalties to user
        Promise::new(caller_account.clone()).transfer(royalties);

        //todo: maybe run the following code from a callback of the transfer promise
        // 4. create a new claim record
        match self.claims_by_account.get_mut(&caller_account) {
            Some(claims) => {
                claims.push(&Claim {
                    timestamp,
                    claimed: royalties,
                });
            }
            None => {
                let mut new_claim = Vector::new(
                    StorageKeys::NewClaims(content_id.clone())
                        .try_to_vec()
                        .expect(SER_ERROR),
                );

                new_claim.push(&Claim {
                    timestamp,
                    claimed: royalties,
                });

                self.claims_by_account
                    .insert(caller_account.clone(), new_claim);
            }
        }

        // 5. Reset streams count for the user
        let streams = self.streams_by_account.get_mut(&caller_account).unwrap();
        streams.insert(content_id, 0);
    }

    pub fn get_last_claims(&self, account_id: AccountId, limit: Option<u8>) -> Vec<Claim> {
        let claims_maybe = self.claims_by_account.get(&account_id);

        // pub timestamp: Timestamp,
        // pub claimed: Balance,
        if let Some(claims) = claims_maybe {
            let res: Vec<Claim> = claims
                .iter()
                .rev()
                .take(limit.unwrap_or(10).into())
                .collect();
            return res;
        }
        vec![]
    }
}
