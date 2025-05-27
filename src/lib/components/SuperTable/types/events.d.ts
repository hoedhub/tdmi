/// <reference types="svelte" />
import type { SvelteHTMLElements } from 'svelte/elements';

declare module 'svelte/elements' {
    interface SvelteHTMLElements {
        'tr': {
            'on:swipe'?: (event: CustomEvent<{ direction: 'left' | 'right' }>) => void;
            'on:longpress'?: (event: CustomEvent) => void;
        }
    }
}
