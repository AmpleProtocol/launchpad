import { Theme } from "theme-ui";

const buttonProps = {
	backgroundColor: 'primary',
	color: 'white',
	border: '1 px solid primary',
	cursor: 'pointer',
	borderRadius: '10px',
	":hover": {
		opacity: 0.8
	}
}

export const theme: Theme = {
	colors: {
		primary: '#8e55fb',
	},
	fonts: {
		body: 'Arial, sans-serif',
		heading: '"Avenir Next", sans-serif',
		monospace: 'Menlo, monospace',
	},
	styles: {
		progress: {
			backgroundColor: 'whitesmoke'
		}
	},
	forms: {
		label: {
			display: 'block'
		},
		input: {
			marginBottom: '10px',
			border: '1px solid lightgray',
			borderRadius: '10px',
		},
		launchButton: buttonProps,
	},
	buttons: {
		primary: buttonProps,
		transparent: {
			...buttonProps,
			backgroundColor: 'transparent',
			fontWeight: 700,
			color: 'primary'
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
