export const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number) => {
	let timer: number | undefined;
	return (...args: Parameters<F>) => {
		if (timer) clearTimeout(timer);
		timer = window.setTimeout(() => {
			return fn(...args);
		}, delay);
	};
};
