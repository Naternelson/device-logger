import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export type Message = {
	content: ReactNode;
	id: string;
	timeout: number | null;
	onLoad?: () => void;
	onClose?: () => void;
};
export type Messaging = {
	addMessage: (message: Partial<Message>) => void;
	removeMessage: (id: string) => void;
};

export const useToastProvider = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [open, setOpen] = useState(false);
	const [activeMessage, setActiveMessage] = useState<Message | null>(null);

	const addMessage = (message: Partial<Message>) => {
		const m: Message = {
			id: Math.random().toString(36).substr(2, 9),
			timeout: 5000,
			content: '',
			...message,
		};
		setMessages((el) => [...el, m]);
	};
	const removeMessage = (id: string) => {
		setMessages((el) => el.filter((e) => e.id !== id));
		if (activeMessage?.id === id) {
			onClose();
		}
	};
	useEffect(() => {
		if (messages.length && !activeMessage) {
			setActiveMessage(messages[0]);
			messages[0].onLoad?.();
			setMessages((el) => el.slice(1));
			setOpen(true);
		}
	}, [messages, activeMessage, open]);

	const onClose = (_e?: any, reason?: string) => {
		if (reason === 'clickaway') return;
		if (activeMessage?.onClose) activeMessage.onClose();
		setOpen(false);
	};
	const onExited = () => {
		setActiveMessage(null);
	};
	return { addMessage, removeMessage, open, onClose, onExited, activeMessage };
};
export const ToastContext = createContext({} as Messaging);
export const useToast = () => useContext(ToastContext);
