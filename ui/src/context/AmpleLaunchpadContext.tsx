// @ts-nocheck
// TODO: Launchpad isn't an export type, it's a class
import { createContext, ReactNode, useContext } from "react";
import { Launchpad } from '@ample-launchpad/client'
import { ThemeUIProvider } from "theme-ui";
import { theme } from "../theme";

// CONTEXT
const AmpleLaunchpadContext = createContext<Launchpad | null>(null)

// PROVIDER
export const AmpleLaunchpadProvider: React.FC<{
	children: ReactNode,
	launchpad: Launchpad
}> = ({ children, launchpad }) => {
	return <ThemeUIProvider theme={theme}>
		<AmpleLaunchpadContext.Provider value={launchpad}>
			{children}
		</AmpleLaunchpadContext.Provider>
	</ThemeUIProvider>
}

// HOOK
export const useLaunchpad = () => {
	const context = useContext(AmpleLaunchpadContext)

	if (!context) throw new Error('useLaunchpad must only be used inside of AmpleLaunchpadProvider')

	return context
}
