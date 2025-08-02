// src/lib/components/toast/types.ts
import type { ComponentType, SvelteComponent } from 'svelte';
// Import props type from lucide-svelte. Adjust path if lucide-svelte exports differently or if you alias.
import type { IconProps as LucideIconPropsOriginal } from 'lucide-svelte';

// Re-exporting or aliasing for clarity and use within this module
export type LucideIconProps = LucideIconPropsOriginal;
/**
 * Represents a Svelte component that renders a Lucide icon.
 * It's a Svelte component class that accepts LucideIconProps.
 */
export type SvelteLucideIcon = ComponentType<SvelteComponent<LucideIconProps>>;

/**
 * Defines the visual/semantic type of the toast.
 * This typically maps to DaisyUI alert styles (e.g., `alert-info`, `alert-success`).
 * - `info`: General information.
 * - `success`: Successful operation.
 * - `warning`: Potential issue or warning.
 * - `error`: Error or failed operation.
 * - `loading`: Indicates an ongoing process (often used with programmatic updates).
 * - `custom`: Allows for completely custom styling, primarily via `customClass`. Icon and default styles might be minimal.
 */
export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading' | 'custom';

/**
 * Defines an action button that can be displayed within a toast.
 */
export interface ToastAction {
	/** Text label for the button. */
	label: string;
	/** Function to call when the button is clicked. Receives the toast's ID. */
	onClick: (toastId: string) => void;
	/** Optional DaisyUI or custom CSS classes for styling the button (e.g., 'btn-primary', 'btn-sm', 'btn-ghost'). */
	class?: string;
	/** Optional Lucide icon component to display within the button. */
	icon?: SvelteLucideIcon;
	/** Optional props for the button's Lucide icon (e.g., size, strokeWidth). */
	iconProps?: LucideIconProps;
}

/**
 * Represents the complete, resolved state of a toast message.
 * This is the object that is stored in the toast store and whose properties are ultimately
 * passed to the `Toast.svelte` component for rendering.
 */
export interface ToastMessage {
	/** Unique identifier for the toast. Automatically generated if not provided. */
	id: string;
	/** The type of the toast, determining its default styling and icon. */
	type: ToastType;
	/** Optional title for the toast. Often displayed more prominently. */
	title?: string;
	/** Main content/message of the toast. */
	message: string;
	/**
	 * Optional Lucide icon component to display.
	 * If not provided for standard types (info, success, etc.), a default icon for that type will be used.
	 * Can be explicitly set to `null` or `undefined` to have no icon, even for standard types if desired,
	 * or for `type: 'custom'`.
	 */
	icon?: SvelteLucideIcon | null;
	/** Optional props for the Lucide icon (e.g., size, strokeWidth, class). */
	iconProps?: LucideIconProps;
	/**
	 * Duration in milliseconds for the toast to be visible.
	 * `0` or `Infinity` makes the toast persistent until manually closed or programmatically dismissed.
	 * Defaults are typically applied by the toast store (e.g., 5000ms).
	 */
	duration: number;
	/** Whether to show a close button (typically 'x'). Defaults to `true`. */
	showCloseButton: boolean;
	/**
	 * Whether to show a progress bar indicating the remaining time for auto-dismissal.
	 * Defaults to `true` if `duration` is greater than 0.
	 */
	progress: boolean;
	/** Whether to pause the dismiss timer when the mouse hovers over the toast. Defaults to `true`. */
	pauseOnHover: boolean;
	/** Optional array of action buttons to display in the toast. */
	actions?: ToastAction[];
	/**
	 * Custom CSS class(es) to apply to the root element of the toast.
	 * Especially useful for `type: 'custom'` or for adding specific utility classes.
	 */
	customClass?: string;
	/**
	 * If `true`, the `message` content will be rendered as HTML using Svelte's `{@html ...}` directive.
	 * Use with caution and ensure content is sanitized if from untrusted sources. Defaults to `false`.
	 */
	allowHtml?: boolean;
	/** Optional callback function executed when this specific toast is dismissed (by user, timer, or programmatically). */
	onDismiss?: (toastId: string) => void;
	/** Timestamp (milliseconds since epoch) when the toast was created or its `show` function was called. Used internally. */
	createdAt: number;

	// --- Potential future enhancements ---
	/** For promise-based toasts: the promise to track. */
	// promise?: Promise<any>;
	/** For promise toasts: messages for pending, success, error states, allowing dynamic content. */
	// promiseMessages?: { pending?: string; success?: string; error?: string };
	/** Explicit ARIA live region setting, if needed to override defaults. */
	// ariaLive?: 'polite' | 'assertive' | 'off';
}

/**
 * Options that can be provided by the user when creating a new toast
 * using the generic `toastStore.show(options)` function.
 * All properties are optional and will fall back to defaults defined in `toastStore`.
 */
export type ToastUserOptions = Partial<
	Omit<
		ToastMessage,
		'id' | 'createdAt' | 'duration' | 'showCloseButton' | 'progress' | 'pauseOnHover'
	>
> & {
	/**
	 * Optional unique ID. If provided, an existing toast with this ID might be updated (depending on store logic),
	 * or it can be used for later programmatic control (e.g., `dismiss(id)`). If not provided, one will be generated.
	 */
	id?: string;
	/** The type of the toast. Defaults to 'info' if not specified. */
	type?: ToastType;
	/** Main content/message of the toast. Should generally be provided. */
	message?: string; // While technically optional due to Partial, it's highly recommended.
	/** Duration in milliseconds. Overrides default or type-specific duration. 0 for persistent. */
	duration?: number;
	/** Overrides default for showing the close button. */
	showCloseButton?: boolean;
	/** Overrides default for showing the progress bar. */
	progress?: boolean;
	/** Overrides default for pausing on hover. */
	pauseOnHover?: boolean;
};

/**
 * Options for helper functions like `toastStore.info(message, options)`,
 * where `type` is implicitly defined by the function call, and `message` is a direct argument.
 */
export type ToastHelperOptions = Omit<ToastUserOptions, 'type' | 'message'>;

/**
 * Options for updating an existing toast via `toastStore.update(id, options)`.
 * Allows changing almost any aspect of the toast. All fields are optional.
 */
export type ToastUpdateOptions = Partial<Omit<ToastMessage, 'id' | 'createdAt'>>;

/**
 * Defines the possible positions for the `ToastContainer` on the screen.
 * These abstract positions will be mapped to specific CSS classes (e.g., DaisyUI's `toast-top toast-end`).
 */
export type ToastPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';
// Consider more granular if needed, like center-left/right, but above are most common
// For DaisyUI specific mapping:
// | 'toast-top toast-start'
// | 'toast-top toast-center'
// | 'toast-top toast-end'
// | 'toast-middle toast-start'
// | 'toast-middle toast-center'
// | 'toast-middle toast-end'
// | 'toast-bottom toast-start'
// | 'toast-bottom toast-center'
// | 'toast-bottom toast-end'
// Sticking to abstract positions is generally more flexible.

/**
 * Props for the `ToastContainer.svelte` component, which manages the display of all active toasts.
 */
export interface ToastContainerProps {
	/**
	 * Position of the toast container on the screen.
	 * @default 'top-right'
	 */
	position?: ToastPosition;
	/**
	 * Maximum number of toasts to display at once. When limit is reached,
	 * older toasts might be dismissed to make space for new ones (behavior configurable in store).
	 * @default 5
	 */
	maxToasts?: number;
	/**
	 * DaisyUI gap class (e.g., 'gap-2', 'gap-4') or any valid CSS gap value
	 * for spacing between toasts within the container.
	 * @default 'gap-2'
	 */
	spacing?: string;
	/**
	 * The HTML element tag to use for the main container element.
	 * Useful for semantic correctness or specific styling/ARIA needs.
	 * @default 'div'
	 */
	containerElementTag?: keyof HTMLElementTagNameMap;
	/**
	 * Custom CSS class(es) to apply to the toast container element itself.
	 */
	class?: string;
}
