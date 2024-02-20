export const throttle = <F extends (...args: any[]) => any>(fn: F, delay: number) => {
    let timer: number | undefined;
    return (...args: Parameters<F>) => {
        if (timer) return;
        timer = window.setTimeout(() => {
            fn(...args);
            timer = undefined;
        }, delay);
    };
}