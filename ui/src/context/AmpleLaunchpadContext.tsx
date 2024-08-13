import { createContext, ReactNode, useContext } from "react";
import { Launchpad } from '@ample-launchpad/client'

// CONTEXT
const AmpleLaunchpadContext = createContext<Launchpad | null>(null)

// PROVIDER
export const AmpleLaunchpadProvider: React.FC<{
	children: ReactNode,
	launchpad: Launchpad
}> = ({ children, launchpad }) => {
	return <AmpleLaunchpadContext.Provider value={launchpad}>
		{children}
	</AmpleLaunchpadContext.Provider>
}

// HOOK
export const useLaunchpad = () => {
	const context = useContext(AmpleLaunchpadContext)

	if (!context) throw new Error('useLaunchpad must only be used inside of AmpleLaunchpadProvider')

	return context
}
