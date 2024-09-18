import { createContext, ReactNode } from "react";
import { Launchpad } from '@ample-launchpad/client'
import { ThemeUIProvider } from "theme-ui";
import { theme } from "../theme";

// CONTEXT
export const AmpleLaunchpadContext = createContext<Launchpad | null>(null)

// PROVIDER
export const AmpleLaunchpadProvider: React.FC<{
	children: ReactNode,
	launchpad: Launchpad,
	accentColor?: string,
}> = ({ children, launchpad, accentColor }) => {

	if (accentColor && theme.colors) theme.colors.primary = accentColor

	return <ThemeUIProvider theme={theme}>
		<AmpleLaunchpadContext.Provider value={launchpad}>
			{children}
		</AmpleLaunchpadContext.Provider>
	</ThemeUIProvider>
}
