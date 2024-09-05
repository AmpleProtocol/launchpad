use crate::SCALING_FACTOR;

/**
 * Calculate the cuts for the given percentage.
 * Args are expected to be scaled by SCALING_FACTOR
 */
pub(crate) fn calculate_cuts(percentage: u128, streams: u128) -> u128 {
    // log!("[calculate_cuts debugging]");
    // log!("percentage: {}", percentage);
    // log!("streams: {}", streams);

    // (percentage * streams) but preventing overflow
    let cut: u128 = percentage.saturating_mul(streams);

    // log!("cut: {}", cut);

    let result = (cut / SCALING_FACTOR) / 100;
    // log!("result: {}", result);
    // log!("\n");
    result
}

#[cfg(test)]
mod tests {
    use super::calculate_cuts;
    use crate::SCALING_FACTOR;

    #[test]
    fn test_calculate_cuts() {
        let percentage: u128 = 40u128 * SCALING_FACTOR;
        let streams: u128 = 100_000u128 * SCALING_FACTOR;

        let result = calculate_cuts(percentage, streams);

        assert_eq!(
            result,
            (40_000u128 * SCALING_FACTOR),
            "Error: calculate_cuts() result is wrong"
        );
    }
}
