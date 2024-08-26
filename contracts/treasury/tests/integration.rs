use near_sdk::{
    env,
    serde::{Deserialize, Serialize},
    Balance, Timestamp, ONE_NEAR,
};
use near_workspaces::{types::NearToken, Account, AccountId, Contract};
use serde_json::json;

// DEFINE CONSTS
const ACCESS_DENIED_ERROR: &str = "Only allowed accounts can call this method";
const NOT_SERIES_CONTRACT_ERROR: &str = "Only Series NFT contract can call this method";
const SCALING_FACTOR: u128 = 100_000_000u128;
const TREASURY_CONTRACT: &[u8] =
    include_bytes!("../target/wasm32-unknown-unknown/release/treasury.wasm");

// TYPES
struct InitResult {
    contract: Contract,
    alice: Account,
    bob: Account,
    series_contract: Account,
}
#[derive(Serialize, Deserialize, Clone)]
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
pub struct Claim {
    pub timestamp: Timestamp,
    pub claimed: Balance,
}

// CUSTOM LOGIC FOR THE CONTRACT STRUCT
trait CustomLogic {
    async fn add_content(&self, owner: &Account, content_id: String) -> color_eyre::Result<()>;
    async fn calculate_royalties(
        &self,
        account_id: &AccountId,
        content_id: String,
    ) -> color_eyre::Result<u128>;
    async fn get_streams(
        &self,
        account_id: &AccountId,
        content_id: String,
    ) -> color_eyre::Result<u128>;
}
impl CustomLogic for Contract {
    async fn add_content(&self, owner: &Account, content_id: String) -> color_eyre::Result<()> {
        // 1. create some fake content
        let _ = self
            .call("add_content")
            .args_json(json!({
                "content": {
                    "content_id": content_id,
                    "owner_id": owner.id(),
                    "content_type": "film".to_string(),
                    "royalty": {
                        "owner": 60,
                        "holders": 40
                    }
                },
                "collection":  {
                    "collection_id": 5,
                    "total_supply": 100_000,
                }
            }))
            .transact()
            .await?;

        Ok(())
    }
    async fn calculate_royalties(
        &self,
        account_id: &AccountId,
        content_id: String,
    ) -> color_eyre::Result<u128> {
        let royalties = self
            .view("calculate_royalties")
            .args_json(json!({
                "content_id": content_id,
                "account_id": account_id
            }))
            .await?
            .json::<u128>()?;

        Ok(royalties)
    }

    async fn get_streams(
        &self,
        account_id: &AccountId,
        content_id: String,
    ) -> color_eyre::Result<u128> {
        let result = self
            .view("get_streams")
            .args_json(json!({
                "account_id": account_id, "content_id": content_id
            }))
            .await?
            .json::<u128>()
            .unwrap();

        Ok(result)
    }
}

// INIT FUNCTION
async fn init() -> color_eyre::Result<InitResult> {
    // 1. setup a worker
    let worker = near_workspaces::sandbox().await?;

    // 2. create actors (accounts)
    let alice = worker.dev_create_account().await?;
    let bob = worker.dev_create_account().await?;
    let series_contract = worker.dev_create_account().await?;

    // 3. deploy the contract
    let contract = worker.dev_deploy(TREASURY_CONTRACT).await?;

    let _ = contract
        .call("init_contract")
        .args_json(json!({
            "series_contract_address": series_contract.id()
        }))
        .transact()
        .await?;

    // 4. return all of them
    Ok(InitResult {
        contract,
        alice,
        bob,
        series_contract,
    })
}

// TESTS
#[tokio::test]
async fn test_contents() -> color_eyre::Result<()> {
    let InitResult {
        contract,
        alice,
        bob: _,
        series_contract: _,
    } = init().await?;

    contract.add_content(&alice, "hola".to_string()).await?;
    contract.add_content(&alice, "quetal".to_string()).await?;

    // 2. verify the content was created indeed
    let content_received = contract
        .view("get_content")
        .args_json(json!({"content_id": "hola".to_string()}))
        .await?
        .json::<Option<SendedContent>>();

    match content_received {
        Ok(content_option) => {
            let content = content_option.unwrap();
            // test content_id
            assert!(
                content.content_id == "hola".to_string(),
                "[ERROR]: received content.content_id is not equal to 'hola' for some reason"
            );

            // test content_type
            assert!(
                content.content_type == "film".to_string(),
                "[ERROR]: received content.content_type is not equal to 'film' for some reason"
            );

            // test royalty
            assert!(
                content.royalty.owner == 60_u128 * SCALING_FACTOR,
                "[ERROR]: received royalty.owner is not equal to 50 * SCALING_FACTOR for some reason"
            );

            assert!(
                content.royalty.holders.unwrap() == 40_u128 * SCALING_FACTOR,
                "[ERROR]: received royalty.holders is not equal to 50 * SCALING_FACTOR for some reason"
            );
        }
        Err(err) => {
            println!("Error getting content: {}", err);
        }
    }

    // 3. Test both contents were created
    let contents_result = contract
        .view("get_contents")
        .await?
        .json::<Option<Vec<SendedContent>>>();

    match contents_result {
        Ok(contents) => {
            let contents_vec = contents.unwrap();

            assert!(contents_vec.len() == 2);
            assert!(contents_vec
                .iter()
                .any(|content| content.content_id == "hola".to_string()));

            assert!(contents_vec
                .iter()
                .any(|content| content.content_id == "quetal".to_string()));
        }
        Err(err) => {
            println!("Error getting contents: {}", err);
        }
    }

    Ok(())
}

#[tokio::test]
async fn test_security() -> color_eyre::Result<()> {
    let InitResult {
        contract,
        alice,
        bob,
        series_contract: _,
    } = init().await?;

    // add alice as allowed account
    let _ = contract
        .call("add_allowed_account")
        .args_json(json!({
            "account_id": alice.id()
        }))
        .transact()
        .await?;

    // should not be possible
    let bob_outcome = bob
        .call(contract.id(), "add_allowed_account")
        .args_json(json!({
            "account_id": bob.id()
        }))
        .transact()
        .await?
        .into_result();

    assert!(bob_outcome.is_err());
    assert!(bob_outcome
        .unwrap_err()
        .to_string()
        .contains(ACCESS_DENIED_ERROR));

    // should not be possible
    let bob_outcome_two = bob
        .call(contract.id(), "remove_allowed_account")
        .args_json(json!({
            "account_id": alice.id()
        }))
        .transact()
        .await?
        .into_result();

    assert!(bob_outcome_two.is_err());
    assert!(bob_outcome_two
        .unwrap_err()
        .to_string()
        .contains(ACCESS_DENIED_ERROR));

    // get all allowed accounts
    let res = contract
        .view("get_allowed_accounts")
        .await?
        .json::<Vec<AccountId>>();

    match res {
        Ok(accounts) => {
            assert!(
                accounts.contains(&alice.id()),
                "[ERROR]: Alice was added as allowed account an was not returned"
            );
            assert!(
                !accounts.contains(&bob.id()),
                "[ERROR]: Bob accountid is present in allowed_accounts for some reason"
            );
        }
        Err(err) => {
            println!("[ERROR]: {}", err);
        }
    }

    //  test add_analytics_data access control
    let analytics_result = bob
        .call(contract.id(), "add_analytics_data")
        .args_json(json!({
            "bulk_analytics": {
                "content_id": "some_id_doesntmatter",
                "streams": "1543432",
            },
            "timestamp": env::block_timestamp_ms(),
        }))
        .transact()
        .await?
        .into_result();

    assert!(analytics_result.is_err());
    assert!(analytics_result
        .unwrap_err()
        .to_string()
        .contains(ACCESS_DENIED_ERROR));

    // add contents security
    let content_result = bob
        .call(contract.id(), "add_content")
        .args_json(json!({
            "content": {
                "content_id": "another_id_stillirrelevant",
                "owner_id": alice.id(),
                "content_type": "film".to_string(),
                "royalty": {
                    "owner": 60,
                    "holders": 40
                }
            },
            "collection":  {
                "collection_id": 5,
                "total_supply": 100_000,
            }
        }))
        .transact()
        .await?
        .into_result();

    assert!(content_result.is_err());
    assert!(content_result
        .unwrap_err()
        .to_string()
        .contains(ACCESS_DENIED_ERROR));

    Ok(())
}

#[tokio::test]
async fn test_royalties() -> color_eyre::Result<()> {
    let InitResult {
        contract,
        alice,
        bob,
        series_contract,
    } = init().await?;

    let content_id = "someidblabla".to_string();

    contract.add_content(&alice, content_id.clone()).await?;

    let up_holder_result_should_fail = contract
        .call("update_holder")
        .args_json(json!({
            "content_id": content_id,
            "token_id": "1:someid",
            "new_holder": bob.id()
        }))
        .transact()
        .await?
        .into_result();

    assert!(up_holder_result_should_fail.is_err());
    assert!(up_holder_result_should_fail
        .unwrap_err()
        .to_string()
        .contains(NOT_SERIES_CONTRACT_ERROR));

    // set some holders
    let up_holder_result = series_contract
        .call(contract.id(), "update_holder")
        .args_json(json!({
            "content_id": content_id,
            "token_id": "1:someid",
            "new_holder": bob.id()
        }))
        .transact()
        .await?;

    assert!(up_holder_result.is_success(), "Error updating holder");

    // we use 1k streams (scaled) because it equals 1NEAR in royalties
    let streams = 1000u128 * SCALING_FACTOR; // 1e11 which equals 1 NEAR total when considering
                                             // STREAM_TOKEN relation
    let holders_cut = 400u128 * SCALING_FACTOR; // 4e10
    let _owner_cut = 600u128 * SCALING_FACTOR; // 6e10
    let streams_by_holder = holders_cut / 100_000; //(total_supply) // 4e5
                                                   //
                                                   // claim with no royalties

    // add analytics data
    let analytics_result = contract
        .call("add_analytics_data")
        .args_json(json!({
            "bulk_analytics": {
                "content_id": content_id,
                "streams": streams.to_string(),
            },
            "timestamp": env::block_timestamp_ms(),
        }))
        .transact()
        .await?;

    assert!(analytics_result.is_success(), "Error adding analytics data");

    let bob_streams = contract.get_streams(&bob.id(), content_id.clone()).await?;
    let alice_streams = contract
        .get_streams(&alice.id(), content_id.clone())
        .await?;

    assert!(
        alice_streams + bob_streams == streams,
        "[ERROR] streams count not coincident"
    );

    assert!(
        bob_streams == streams_by_holder,
        "[ERROR] bob has a wrong amount of streams"
    );
    assert!(
        streams - streams_by_holder == alice_streams,
        "[ERROR] alice has a wrong amount of streams"
    );

    // now both accounts (bob and alice) should have some royalties
    let bob_royalties = contract
        .calculate_royalties(&bob.id(), content_id.clone())
        .await?;
    let alice_royalties = contract
        .calculate_royalties(&alice.id(), content_id.clone())
        .await?;

    assert!(
        bob_royalties + alice_royalties == ONE_NEAR, // 1e24 which equals 1 NEAR in yocto
        "[ERROR] royalties not ok"
    );

    // claiming functionality
    let alice_acc = alice.view_account().await?;

    // assert inital state
    assert!(alice_acc.balance == NearToken::from_near(100));

    // alice claim
    let alice_claim_res = alice
        .call(contract.id(), "claim_royalties")
        .args_json(json!({
            "content_id": content_id
        }))
        .transact()
        .await?;

    assert!(alice_claim_res.is_success());

    let new_alice_acc = alice.view_account().await?;
    assert!(new_alice_acc.balance.as_yoctonear() > NearToken::from_near(100).as_yoctonear());
    assert!(new_alice_acc.balance.as_yoctonear() < NearToken::from_near(101).as_yoctonear());

    // bob claim
    let bob_claim_res = bob
        .call(contract.id(), "claim_royalties")
        .args_json(json!({
            "content_id": content_id
        }))
        .transact()
        .await?;

    assert!(bob_claim_res.is_success());

    // bob lasts claims
    let last_claims_res = contract
        .call("get_last_claims")
        .args_json(json!({
            "account_id": bob.id(),
        }))
        .transact()
        .await?
        .json::<Vec<Claim>>();

    assert!(last_claims_res.is_ok());

    match last_claims_res {
        Ok(last_claims) => {
            assert!(last_claims[0].claimed == bob_royalties);
        }
        Err(err) => {
            println!("Error getting last claims: {}", err);
        }
    }

    // check bob has no royalties (bc he claimed)
    let new_bob_royalties = contract
        .calculate_royalties(&bob.id(), content_id.clone())
        .await?;

    assert!(new_bob_royalties == 0);

    Ok(())
}

// fn gas_to_yoctonear(gas: u64) -> u128 {
//     // 1tgas = 10^20yoctonear
//     let response = (gas as u128) * 10u128.pow(8);
//     return response;
// }
