import { useEffect, useMemo, useState } from "react"
import LaunchTab from "./LaunchTab"
import RoyaltyTab from "./RoyaltyTab"
import PlayTab from "./PlayTab"
import { useLaunchpad } from "@ample-launchpad/ui"

type Tabs = 'launch' | 'royalty' | 'play'

export const Content = () => {
	const { wallet } = useLaunchpad()
	const [tab, setTab] = useState<Tabs>('launch')

	useEffect(() => {
		const _tab = localStorage.getItem('tab')
		if (_tab) setTab(_tab as Tabs)
	}, [])

	const setPersistentTab = (tab: Tabs) => {
		setTab(tab)
		localStorage.setItem('tab', tab)
	}

	const TabComponent = useMemo(() => {
		switch (tab) {
			case 'launch':
				return LaunchTab
			case 'royalty':
				return RoyaltyTab
			case 'play':
				return PlayTab
		}
	}, [tab])

	return <>
		<nav>
			<button onClick={() => setPersistentTab('launch')} className={`nav-link ${tab == 'launch' ? 'active' : ''}`}>Launch</button>
			<button onClick={() => setPersistentTab('royalty')} className={`nav-link ${tab == 'royalty' ? 'active' : ''}`} >Royalty</button>
			<button onClick={() => setPersistentTab('play')} className={`nav-link ${tab == 'play' ? 'active' : ''}`}>Play</button>
			<button onClick={() => wallet.signOut()} className="nav-link logout">Log out</button>
		</nav>
		<main>
			<div className="card">
				<TabComponent />
			</div>
		</main>
	</>
}
