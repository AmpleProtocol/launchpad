use near_sdk::env;

use crate::*;

impl Contract {
    /**
     * Makes sure that the caller is an allowed account
     */
    pub fn assert_allowed_caller(&self) {
        // log!("Asserting allowed caller...");
        assert!(
            self.allowed_accounts
                .contains(&env::predecessor_account_id()),
            "Only allowed accounts can call this method"
        );
        // log!("Allowed!");
    }
}

#[near_bindgen]
impl Contract {
    /**
     * Add a new account to the set of allowed accounts
     */
    pub fn add_allowed_account(&mut self, account_id: AccountId) -> bool {
        self.assert_allowed_caller();
        self.allowed_accounts.insert(account_id)
    }

    /**
     * Remove an account from the set of allowed accounts
     */
    pub fn remove_allowed_account(&mut self, account_id: AccountId) -> bool {
        self.assert_allowed_caller();
        self.allowed_accounts.remove(&account_id)
    }

    /**
     * Retrieves all allowed accounts
     */
    pub fn get_allowed_accounts(&self) -> Vec<&AccountId> {
        self.allowed_accounts.iter().collect()
    }
}
