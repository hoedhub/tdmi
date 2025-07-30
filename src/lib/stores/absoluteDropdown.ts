import { writable } from 'svelte/store';

interface DropdownState {
	isOpen: boolean;
	position: { top: number; left: number; right: number; bottom: number };
	content: 'user' | 'theme' | null;
	direction: 'up' | 'down';
}

function createDropdownStore() {
	const { subscribe, set, update } = writable<DropdownState>({
		isOpen: false,
		position: { top: 0, left: 0, right: 0, bottom: 0 },
		content: null,
		direction: 'down'
	});

	return {
		subscribe,
		open: (position: DOMRect, content: 'user' | 'theme', direction: 'up' | 'down' = 'down') => {
			set({
				isOpen: true,
				position: {
					top: position.top,
					left: position.left,
					right: position.right,
					bottom: position.bottom
				},
				content,
				direction
			});
		},
		close: () => {
			set({
				isOpen: false,
				position: { top: 0, left: 0, right: 0, bottom: 0 },
				content: null,
				direction: 'down'
			});
		},
		toggle: (
			position: DOMRect,
			content: 'user' | 'theme',
			direction: 'up' | 'down' = 'down'
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
					direction
				};
			});
		}
	};
}

export const absoluteDropdownStore = createDropdownStore();
