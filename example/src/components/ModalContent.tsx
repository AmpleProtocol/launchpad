import { IContent } from "@ample-launchpad/client"
import { Player } from "@ample-launchpad/ui"

interface IProps {
	content: IContent,
	onClose: () => any
}
export default function ModalContent({ content, onClose }: IProps) {
	return <div className="modal-content">
		<div className="header">
			<h1>{content.title}</h1>
			<button className="close" onClick={onClose}>x</button>
		</div>

		<div className="player">
			<Player contentId={content.id} title={content.title} />
		</div>
	</div>
}
