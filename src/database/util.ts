import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { set } from 'react-hook-form';

export const cleanString = (str: string) => {
	// Remove any two or more spaces with a single space
	// Trim the string
	return str.replace(/\s{2,}/g, ' ').trim();
};

export type QueryData<T> = {
	data?: T;
	state: 'pending' | 'fulfilled' | 'rejected';
	error?: any;
};
export function useLiveData<T>(querier: () => Promise<T> | T, deps?: any[], name?: string): QueryData<T> {
	const [state, setState] = useState<QueryData<T>>({ state: 'pending' });
	useLiveQuery(async () => {
		try {
			const res = await querier();
			setState({ data: res, state: 'fulfilled' });
		} catch (error) {
			setState({ state: 'rejected', error });
		}
	}, deps);

	useEffect(() => {
		setState((p) => ({ data: p.data, state: 'pending' }));
	},deps || [])

	return state;
}
