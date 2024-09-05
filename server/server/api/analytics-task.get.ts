export default eventHandler(async (event) => {
	const { result } = await runTask('analytics')
	return { result }
})
