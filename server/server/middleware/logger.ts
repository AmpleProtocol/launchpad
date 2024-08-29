export default defineEventHandler((event) => {
	console.log(`[server]: ${event.method} ${event.path}`)
})
