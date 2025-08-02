// src/lib/components/toast/toastStore.ts
import { writable, get } from 'svelte/store';
import type {
	ToastMessage,
	ToastUserOptions,
	ToastHelperOptions,
	ToastUpdateOptions,
	ToastType
} from './types';
import { Info, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-svelte'; // Default icons

// --- Configuration Defaults ---
const DEFAULT_DURATION = 5000; // ms
const DEFAULT_TYPE: ToastType = 'info';
const DEFAULT_SHOW_CLOSE_BUTTON = true;
const DEFAULT_PROGRESS = true;
const DEFAULT_PAUSE_ON_HOVER = true;
const MAX_TOASTS_DEFAULT = 5; // Default max toasts visible

interface ToastStoreConfig {
	maxToasts: number;
	defaultDuration: number;
	// Add other global configurations if needed
}

// Global configuration for the toast system (can be extended)
// For now, only maxToasts is managed here, others are applied per toast
const storeConfig: ToastStoreConfig = {
	maxToasts: MAX_TOASTS_DEFAULT,
	defaultDuration: DEFAULT_DURATION
};

/**
 * Configures global settings for the toast system.
 * @param config Partial configuration object.
 */
export function configureToastSystem(config: Partial<ToastStoreConfig>) {
	Object.assign(storeConfig, config);
	// If maxToasts changes, we might need to trim the current toasts
	trimToasts();
}

// --- The Store ---
const { subscribe, update: updateStore } = writable<ToastMessage[]>([]);

export const toastStore = {
	subscribe
	// You could expose a 'set' if absolutely necessary, but update is safer.
};

// --- Helper Functions ---
function generateId(): string {
	return crypto.randomUUID
		? crypto.randomUUID()
		: `toast-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
}

function getDefaultIcon(type: ToastType) {
	let iconComponent;
	switch (type) {
		case 'info':
			iconComponent = Info;
			break;
		case 'success':
			iconComponent = CheckCircle2;
			break;
		case 'warning':
			iconComponent = AlertTriangle;
			break;
		case 'error':
			iconComponent = XCircle;
			break;
		case 'loading':
			iconComponent = Loader2;
			break;
		default:
			iconComponent = undefined;
			break; // For 'custom' or if no default
	}
	return iconComponent;
}

function trimToasts() {
	updateStore((toasts) => {
		if (toasts.length > storeConfig.maxToasts) {
			// Remove oldest toasts. Assuming newest are at the start of the array.
			// If newest are at the end, use `toasts.slice(toasts.length - storeConfig.maxToasts)`
			return toasts.slice(0, storeConfig.maxToasts);
		}
		return toasts;
	});
}

// --- Public API Functions ---

/**
 * Displays a toast notification. This is the core function.
 * @param options Options to configure the toast.
 * @returns The ID of the created toast.
 */
export function show(options: ToastUserOptions): string {
	const id = options.id || generateId();
	const type = options.type || DEFAULT_TYPE;
	const duration =
		options.duration === 0 ? Infinity : options.duration || storeConfig.defaultDuration;

	const toast: ToastMessage = {
		id,
		type,
		title: options.title,
		message: options.message || '',
		icon: options.icon === null ? null : options.icon || getDefaultIcon(type),
		iconProps: options.iconProps,
		duration,
		showCloseButton: options.showCloseButton ?? DEFAULT_SHOW_CLOSE_BUTTON,
		progress: options.progress ?? (duration > 0 && duration !== Infinity && DEFAULT_PROGRESS),
		pauseOnHover: options.pauseOnHover ?? DEFAULT_PAUSE_ON_HOVER,
		actions: options.actions,
		customClass: options.customClass,
		allowHtml: options.allowHtml || false,
		onDismiss: options.onDismiss,
		createdAt: Date.now()
	};

	updateStore((toasts) => {
		// Option 1: Add to the beginning (newest on top for top-* positions)
		const newToasts = [toast, ...toasts];
		// Option 2: Add to the end (newest on top for bottom-* positions if visual stack is reversed)
		// const newToasts = [...toasts, toast];

		// Handle max toasts
		if (newToasts.length > storeConfig.maxToasts) {
			// Remove the oldest toast. If newest are at the start, oldest is at the end.
			return newToasts.slice(0, storeConfig.maxToasts);
			// If newest are at the end, oldest is at the start.
			// return newToasts.slice(newToasts.length - storeConfig.maxToasts);
		}
		return newToasts;
	});

	return id;
}

/**
 * Displays an informational toast.
 * @param message The message content.
 * @param options Additional options for the toast.
 * @returns The ID of the created toast.
 */
export function info(message: string, options?: ToastHelperOptions): string {
	return show({ ...options, type: 'info', message });
}

/**
 * Displays a success toast.
 * @param message The message content.
 * @param options Additional options for the toast.
 * @returns The ID of the created toast.
 */
export function success(message: string, options?: ToastHelperOptions): string {
	return show({ ...options, type: 'success', message });
}

/**
 * Displays a warning toast.
 * @param message The message content.
 * @param options Additional options for the toast.
 * @returns The ID of the created toast.
 */
export function warning(message: string, options?: ToastHelperOptions): string {
	return show({ ...options, type: 'warning', message });
}

/**
 * Displays an error toast.
 * @param message The message content.
 * @param options Additional options for the toast.
 * @returns The ID of the created toast.
 */
export function error(message: string, options?: ToastHelperOptions): string {
	return show({ ...options, type: 'error', message });
}

/**
 * Displays a loading toast.
 * @param message The message content.
 * @param options Additional options for the toast.
 * @returns The ID of the created toast.
 */
export function loading(message: string, options?: ToastHelperOptions): string {
	return show({
		...options,
		type: 'loading',
		message,
		duration: options?.duration === undefined ? Infinity : options.duration, // Loaders are often persistent by default
		showCloseButton: options?.showCloseButton ?? false, // Loaders often don't have close buttons
		progress: options?.progress ?? false // Loaders don't usually have a progress bar for dismissal
	});
}

/**
 * Displays a custom-styled toast.
 * User is responsible for much of the styling via `customClass` or by providing all details.
 * @param options Options for the custom toast, `message` is typically required.
 * @returns The ID of the created toast.
 */
export function custom(options: Omit<ToastUserOptions, 'type'> & { message: string }): string {
	return show({ ...options, type: 'custom' });
}

/**
 * Dismisses a specific toast by its ID.
 * @param id The ID of the toast to dismiss.
 */
export function dismiss(id: string): void {
	let dismissedToast: ToastMessage | undefined;
	updateStore((toasts) => {
		const index = toasts.findIndex((t) => t.id === id);
		if (index > -1) {
			dismissedToast = toasts[index];
			return [...toasts.slice(0, index), ...toasts.slice(index + 1)];
		}
		return toasts;
	});

	if (dismissedToast && dismissedToast.onDismiss) {
		dismissedToast.onDismiss(id);
	}
}

/**
 * Dismisses all currently visible toasts.
 */
export function dismissAll(): void {
	const currentToasts = get(toastStore); // Get current value without subscribing
	updateStore(() => []);

	currentToasts.forEach((toast) => {
		if (toast.onDismiss) {
			toast.onDismiss(toast.id);
		}
	});
}

/**
 * Updates an existing toast with new options.
 * Useful for changing content, type, duration, etc., for example, after an async operation.
 * @param id The ID of the toast to update.
 * @param options An object containing the properties to update.
 */
export function update(id: string, newOptions: ToastUpdateOptions): void {
	updateStore((toasts) =>
		toasts.map((toast) => {
			if (toast.id === id) {
				// Re-evaluate icon if type changes and no explicit icon is in newOptions
				let icon = newOptions.icon === null ? null : newOptions.icon || toast.icon;
				if (newOptions.type && newOptions.type !== toast.type && newOptions.icon === undefined) {
					icon = getDefaultIcon(newOptions.type);
				}

				// Re-evaluate progress if duration changes
				let progress = newOptions.progress ?? toast.progress;
				if (newOptions.duration !== undefined && newOptions.progress === undefined) {
					progress =
						newOptions.duration > 0 && newOptions.duration !== Infinity && DEFAULT_PROGRESS;
				}

				return {
					...toast,
					...newOptions,
					icon, // Apply potentially re-evaluated icon
					progress // Apply potentially re-evaluated progress
					// If duration changes, we might want to reset its internal timer in Toast.svelte
					// This update function only changes the data; Toast.svelte reacts to it.
					// Consider adding a 'updatedAt' field if Toast.svelte needs to explicitly re-trigger timers.
				};
			}
			return toast;
		})
	);
}

// Example: If you want to set maxToasts from ToastContainer.svelte prop
// This is one way, or ToastContainer can call configureToastSystem
/**
 * INTERNAL USE: Sets the maximum number of toasts.
 * Primarily intended to be called by ToastContainer.
 * @param max The maximum number of toasts.
 * @internal
 */
export function _setMaxToasts(max: number) {
	if (max > 0) {
		storeConfig.maxToasts = max;
		trimToasts();
	}
}
