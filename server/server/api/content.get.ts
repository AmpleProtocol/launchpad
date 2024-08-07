interface IQuery {
	limit?: number
}

export default eventHandler(async event => {
	const db = useDatabase()
	const query = getQuery<IQuery>(event)

	// get all users
	const res = await db.sql`SELECT * FROM contents`

	if (res.error) {
		setResponseStatus(event, 500)
		return { success: false, message: res.error }
	}

	return {
		success: true,
		data: res.rows
	}
})
