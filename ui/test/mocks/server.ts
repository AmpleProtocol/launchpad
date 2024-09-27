import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { contents } from '../fixtures/contents'

const handlers = [
	http.post('https://mock.com/api/content', () => {
		return HttpResponse.json({
			success: true,
			data: {
				contentId: 'somfdafdsa',
				royaltyCollectionId: 432432423,
				rentalCollectionId: 4538905404,
				tusEndpoint: 'https://someurl.com/tus',
				uploadEndpoint: 'https://someurl.com',
			}
		})
	}),
	http.get('https://mock.com/api/content', () => {
		console.log('[server]: GET /api/content')
		return HttpResponse.json({
			success: true,
			data: contents
		})
	}),
	http.get('https://mock.com/api/content/:id', ({ params }) => {
		const content = contents.find(c => c.id === params.id)

		return HttpResponse.json({
			success: true,
			data: content
		})
	}),
	http.get('https://mock.com/api/analytics', () => {
		return HttpResponse.json({
			success: true,
			data: {
				totalGenerated: 43,
				royaltyGenerated: 11,
				rentalGenerated: 32,
				streamsCount: 544,
				analytics: [
					{
						streams: 544,
						timestamp: 1727388759539
					}
				]
			}
		})
	}),
	http.post('https://mock.com/api/sign-jwt', () => {
		return HttpResponse.json({
			success: true,
			data: {
				jwt: 'some-jwt',
				streamingUrl: 'some-streaming-url'
			}
		})
	}),
]

export const server = setupServer(...handlers)
