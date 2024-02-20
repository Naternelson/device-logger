import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = ['Home', 'Orders', 'Products', 'Settings', 'Dev'] as const;
export type NavContextType = {
	active: string;
	tabs: typeof tabs;
	setActive: (tab: (typeof tabs)[number]) => void;
	next: () => void;
	previous: () => void;
};
export const NavContext = createContext({} as NavContextType);

export const useNavProvider = () => {
	const [active, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
	const nav = useNavigate();
	const location = useLocation();

	const next = () => {
		const index = tabs.indexOf(active);
		if (index === tabs.length - 1) return;

		nav(`/${tabs[index + 1].toLowerCase()}`);
	};
	const previous = () => {
		const index = tabs.indexOf(active);
		if (index === 0) return;
		nav(`/${tabs[index + 1].toLowerCase()}`);
	};
	useEffect(() => {
		const path = location.pathname.split('/')[1];
		const index = tabs.map((el) => el.toLowerCase()).indexOf(path.toLowerCase() as any);
		if (index !== -1) {
			setActiveTab(tabs[index]);
		}
		if (path === '') {
			setActiveTab('Home');
		}
	});
	const setActive = (tab: (typeof tabs)[number]) => {
		if (tab === tabs[0]) nav('/');
		else nav(`/${tab.toLowerCase()}`);
	};
	return { active, tabs, next, previous, setActive };
};

export const useAppNav = () => {
	return useContext(NavContext);
};
