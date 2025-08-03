import { writable } from 'svelte/store';

interface DropdownState {
	isOpen: boolean;
	position: { top: number; left: number; right: number; bottom: number };
	content: 'user' | 'theme' | 'monthPicker' | null;
	direction: 'up' | 'down';
	data?: any;
}

function createDropdownStore() {
	const { subscribe, set, update } = writable<DropdownState>({
		isOpen: false,
		position: { top: 0, left: 0, right: 0, bottom: 0 },
		content: null,
		direction: 'down',
		data: null
	});

	return {
		subscribe,
		open: (
			position: DOMRect,
			content: 'user' | 'theme' | 'monthPicker',
			direction: 'up' | 'down' = 'down',
			data?: any
		) => {
			set({
				isOpen: true,
				position: {
					top: position.top,
					left: position.left,
					right: position.right,
					bottom: position.bottom
				},
				content,
				direction,
				data
			});
		},
		close: () => {
			set({
				isOpen: false,
				position: { top: 0, left: 0, right: 0, bottom: 0 },
				content: null,
				direction: 'down',
				data: null
			});
		},
		toggle: (
			position: DOMRect,
			content: 'user' | 'theme' | 'monthPicker',
			direction: 'up' | 'down' = 'down',
			data?: any
		) => {
			update((state) => {
				if (state.isOpen && state.content === content) {
					return { ...state, isOpen: false };
				}
				return {
					isOpen: true,
					position: {
						top: position.top,
						left: position.left,
						right: position.right,
						bottom: position.bottom
					},
					content,
					direction,
					data
				};
			});
		}
	};
}

export const absoluteDropdownStore = createDropdownStore();
