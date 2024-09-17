export default eventHandler(async (event) => {
	if (process.env.NODE_ENV != 'development') return 'Not available on production'

	const { result } = await runTask('analytics')
	return { result }
})
