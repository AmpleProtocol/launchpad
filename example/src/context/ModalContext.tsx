import ModalContent from "@/components/ModalContent"
import { IContent } from "@ample-launchpad/client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import Modal from 'react-modal'

Modal.setAppElement('#__next')

const modalStyles = {
	content: {
		border: 'none',
		borderRadius: '16px',
		boxShadow: '0px 4px 32px #d6d6d6'
	}
}

interface IModalContext {
	setContent(content: IContent | null): any
}

const ModalContext = createContext<IModalContext | null>(null)

interface IProps {
	children: ReactNode
}
export default function ModalContextProvider({ children }: IProps) {
	const [content, _setContent] = useState<IContent | null>(null)

	useEffect(() => {
		const _content = localStorage.getItem('modal-content')
		if (_content) _setContent(JSON.parse(_content) as IContent)
	}, [])

	const setContent = (content: IContent | null) => {
		_setContent(content)
		if (content) localStorage.setItem('modal-content', JSON.stringify(content))
		else localStorage.removeItem('modal-content')
	}

	const closeModal = () => setContent(null)

	return <ModalContext.Provider value={{ setContent }}>
		{/* regular content */}
		{children}

		{/* modal for playback */}
		<Modal
			isOpen={!!content}
			onRequestClose={closeModal}
			contentLabel={content?.title}
			style={modalStyles}
		>
			{
				content
					? <ModalContent content={content} onClose={closeModal} />
					: null
			}
		</Modal>
	</ModalContext.Provider>
}

export const useModal = () => {
	const context = useContext(ModalContext)
	if (!context) throw new Error('useModal must be used within ModalContextProvider')

	return context
}
