import { useContext } from "react"
import { AmpleLaunchpadContext } from "../context"

export const useLaunchpad = () => {
	const context = useContext(AmpleLaunchpadContext)

	if (!context) throw new Error('useLaunchpad must only be used inside of AmpleLaunchpadProvider')

	return context
}
