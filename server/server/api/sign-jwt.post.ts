export default eventHandler((event) => {
	// 1. Get private and public server keys, contentId and payload (sig) from body and a provider (like livepeer)
	// 2. Verify signature and get user public key
	// 3. Check if the user has a valid nft for the contentId from body
	// 4. Sign a new JWT and send it to the user
	return { success: true, jwt: {} }
})
