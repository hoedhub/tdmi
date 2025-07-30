import { writable } from 'svelte/store';

interface TooltipState {
	isVisible: boolean;
	content: string;
	position: { top: number; left: number };
}

function createTooltipStore() {
	const { subscribe, set } = writable<TooltipState>({
		isVisible: false,
		content: '',
		position: { top: 0, left: 0 }
	});

	return {
		subscribe,
		show: (content: string, rect: DOMRect) => {
			set({
				isVisible: true,
				content,
				position: {
					top: rect.top + rect.height / 2,
					left: rect.right + 8 // Position to the right of the element with a small gap
				}
			});
		},
		hide: () => {
			set({
				isVisible: false,
				content: '',
				position: { top: 0, left: 0 }
			});
		}
	};
}

export const tooltipStore = createTooltipStore();
