export default eventHandler(async event => {
	const db = useDatabase()
	const id = getRouterParam(event, 'id')

	const res = await db.sql`SELECT * FROM contents WHERE id = ${id} LIMIT 1`

	if (res.error) {
		setResponseStatus(event, 500)
		return { success: false, message: res.error }
	}

	return {
		success: true,
		data: res.rows
	}
})
