import { Theme } from "theme-ui";

export const theme: Theme = {
	colors: {
		primary: '#8e55fb',
		primaryFocus: '#a379f4'
	},
	fonts: {
		body: 'Arial, sans-serif',
		heading: '"Avenir Next", sans-serif',
		monospace: 'Menlo, monospace',
	},
	forms: {
		label: {
			display: 'block'
		},
		input: {
			marginBottom: '10px'
		},
		launchButton: {
			backgroundColor: 'primary',
			color: 'white',
			border: '1 px solid primary',
			cursor: 'pointer',
			":hover": {
				backgroundColor: 'primaryFocus'
			}
		}
	},
	layout: {
		container: {
			padding: '10px'
		}
	},
	images: {
		nftPreview: {
			borderRadius: '10px',
			boxShadow: '0 5px 5px lightgray',
			margin: '0 auto',
			maxHeight: '500px'
		}
	}
} 
