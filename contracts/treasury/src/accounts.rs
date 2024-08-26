use crate::*;

impl Contract {
    /**
     * Adds the given amount of STREAM to the count of the given content_id for a user.
     */
    pub fn add_streams_to(
        &mut self,
        account_id: &AccountId,
        content_id: &ContentId,
        streams: u128,
    ) {
        // log!( "Adding {} streams to {} for content {}", streams, account_id, content_id);
        // get streams count obj for each account
        if let Some(streams_by_content) = self.streams_by_account.get_mut(&account_id) {
            // if already exists
            match streams_by_content.get(content_id) {
                Some(prev_count) => {
                    let new_count = prev_count + streams;
                    streams_by_content.insert(content_id.clone(), new_count);
                }
                None => {
                    streams_by_content.insert(content_id.clone(), streams);
                }
            }
        } else {
            // if doesn't exist, create a new record
            self.streams_by_account.insert(
                account_id.clone(),
                UnorderedMap::new(
                    StorageKeys::NewStreams(account_id.clone(), content_id.clone())
                        .try_to_vec()
                        .expect(SER_ERROR),
                ),
            );
            let streams_by_content = self.streams_by_account.get_mut(&account_id).unwrap();
            streams_by_content.insert(content_id.clone(), streams);
        }
    }
}
