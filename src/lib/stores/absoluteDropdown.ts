import type { ComponentType } from 'svelte';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AbsoluteDropdownStore {
	isOpen: boolean;
	position: DOMRect | null; // Can be null on the server
	direction: 'up' | 'down';
	component: ComponentType | null;
	data: any;
}

function createAbsoluteDropdownStore() {
	const { subscribe, set, update } = writable<AbsoluteDropdownStore>({
		isOpen: false,
		position: null, // Initialize with null
		direction: 'down',
		component: null,
		data: null
	});

	return {
		subscribe,
		toggle: (
			position: DOMRect,
			component: ComponentType,
			direction: 'up' | 'down' = 'down',
			data: any = null
		) => {
			update((state) => {
				if (state.isOpen && state.component === component) {
					return { ...state, isOpen: false };
				}
				return { isOpen: true, position, component, direction, data };
			});
		},
		close: () =>
			set({
				isOpen: false,
				position: null,
				component: null,
				direction: 'down',
				data: null
			})
	};
}

export const absoluteDropdownStore = createAbsoluteDropdownStore();
