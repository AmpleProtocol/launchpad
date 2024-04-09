export default eventHandler((event) => {
	// 1. Check that the request comes from livepeer (auth)
	// 2. Verify that the user has the given nft
	// 3. Return boolean
	return { success: true }
});
