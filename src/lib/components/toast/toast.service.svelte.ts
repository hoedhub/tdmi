// src/lib/components/toast/toast.service.ts
import type { ComponentType } from 'svelte'; // Or 'any' if you prefer less strictness for icons/components

// --- Type Definitions ---

/** Defines the structure for an action button within a toast */
export interface ToastAction {
    /** Text displayed on the button */
    label: string;
    /** Function to execute when the button is clicked */
    onClick: () => void;
    /** Optional additional CSS classes for the button (e.g., 'btn-primary') */
    class?: string;
    /** If true (default), clicking the action dismisses the toast */
    dismissOnClick?: boolean;
}

/** Base options for creating a toast notification */
export interface ToastOptions {
    /** Unique identifier for the toast. Auto-generated if not provided. */
    id?: string | number;
    /** Type of toast, influences styling and default icon */
    type?: 'info' | 'success' | 'warning' | 'error' | 'loading';
    /** Optional bold title text */
    title?: string;
    /** Main message content. Can be plain text or safe HTML. */
    content: string;
    /** Optional Svelte component to override the default icon */
    icon?: ComponentType; // Use ComponentType for Svelte components
    /** Duration in milliseconds before the toast automatically dismisses. Set <= 0 for persistent. */
    duration?: number; // ms
    /** If true, the toast will not automatically dismiss (overrides duration). */
    persistent?: boolean;
    /** Array of action buttons to display */
    actions?: ToastAction[];
    /** If true (default), the dismiss timer pauses when hovering over the toast */
    pauseOnHover?: boolean;
    /** Optional callback function executed when the toast is closed (either by timer or manually) */
    onClose?: () => void;
    // Add other potential future options here (e.g., custom classes for the toast itself)
}

/** Internal representation used in the state array, includes the dismiss function */
interface InternalToastOptions extends ToastOptions {
    // Ensure required fields are present after merging defaults
    id: string | number;
    type: 'info' | 'success' | 'warning' | 'error' | 'loading';
    duration: number;
    persistent: boolean;
    pauseOnHover: boolean;
    actions: ToastAction[];
    _dismiss: (id: string | number) => void; // Function to remove this specific toast
}

// --- State Management ---

let nextId = 0; // Simple counter for generating unique IDs

// The core reactive state using Svelte 5's $state rune
// This array holds all the currently active toasts
const toasts = $state<InternalToastOptions[]>([]);

// --- Core API Functions ---

/**
 * Dismisses (removes) a toast notification by its ID.
 * @param id The unique ID of the toast to dismiss.
 */
function dismissToast(id: string | number): void {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
        // Use splice to remove the item. $state makes this automatically reactive.
        toasts.splice(index, 1);
    } else {
        console.warn(`Toast with id "${id}" not found for dismissal.`);
    }
}

/**
 * Adds a new toast notification or updates an existing one by ID.
 * @param options Configuration options for the toast.
 * @returns The unique ID of the added or updated toast.
 */
function addToast(options: ToastOptions): string | number {
    const id = options.id ?? `toast-${nextId++}`;

    // Check if a toast with this ID already exists to update it
    const existingIndex = toasts.findIndex((t) => t.id === id);

    // Define default values
    const defaults: Omit<InternalToastOptions, 'id' | 'content' | 'title' | 'icon' | 'onClose' | '_dismiss'> = {
        type: 'info',
        duration: 5000, // Default 5 seconds
        persistent: false,
        pauseOnHover: true,
        actions: [],
    };

    const newToastData: InternalToastOptions = {
        ...defaults, // Apply defaults first
        ...options, // User options override defaults
        id, // Ensure ID is set
        // Calculate persistent based on duration if not explicitly set
        persistent: options.persistent ?? (options.duration !== undefined && options.duration <= 0),
        _dismiss: dismissToast, // Pass the internal dismiss function
    };

    if (existingIndex > -1) {
        // Update existing toast: Create a *new* object reference for reactivity if needed,
        // although direct mutation with $state *should* work. Assigning ensures it.
        toasts[existingIndex] = newToastData;
    } else {
        // Add new toast: Push the fully formed object onto the reactive array
        toasts.push(newToastData);
    }

    return id; // Return the ID
}

/**
 * Updates specific properties of an existing toast.
 * @param id The ID of the toast to update.
 * @param updates An object containing the properties to update.
 */
function updateToast(id: string | number, updates: Partial<Omit<ToastOptions, 'id'>>): void {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
        // Merge updates into the existing toast object.
        // $state handles the reactivity update on property changes.
        Object.assign(toasts[index], updates);

        // Recalculate persistent state if duration is updated
        if (updates.duration !== undefined) {
            toasts[index].persistent = updates.persistent ?? updates.duration <= 0;
        }
    } else {
        console.warn(`Toast with id "${id}" not found for update.`);
    }
}

// --- Shortcut Methods ---

function success(content: string, options?: Omit<ToastOptions, 'id' | 'type' | 'content'>): string | number {
    return addToast({ ...options, content, type: 'success' });
}

function error(content: string, options?: Omit<ToastOptions, 'id' | 'type' | 'content'>): string | number {
    // Errors often benefit from being persistent or having a longer duration by default
    const errorDefaults: Partial<ToastOptions> = { persistent: true, duration: 0 };
    return addToast({ ...errorDefaults, ...options, content, type: 'error' });
}

function warning(content: string, options?: Omit<ToastOptions, 'id' | 'type' | 'content'>): string | number {
    return addToast({ ...options, content, type: 'warning' });
}

function info(content: string, options?: Omit<ToastOptions, 'id' | 'type' | 'content'>): string | number {
    return addToast({ ...options, content, type: 'info' });
}

/** Creates a toast with a loading indicator. Often used with updateToast later. */
function loading(content: string, options?: Omit<ToastOptions, 'id' | 'type' | 'content'>): string | number {
    // Loading indicators are often persistent until updated
    const loadingDefaults: Partial<ToastOptions> = { persistent: true, duration: 0 };
    return addToast({ ...loadingDefaults, ...options, content, type: 'loading' });
}

// --- Export ---

/**
 * The main toast service object providing methods to manage notifications.
 */
export const toast = {
    /** The reactive list of currently active toasts. Use this in ToastContainer. */
    list: toasts,
    /** Add a new toast or update an existing one by ID */
    add: addToast,
    /** Dismiss a toast by its ID */
    dismiss: dismissToast,
    /** Update properties of an existing toast */
    update: updateToast,
    /** Shortcut to add a success toast */
    success,
    /** Shortcut to add an error toast (defaults to persistent) */
    error,
    /** Shortcut to add a warning toast */
    warning,
    /** Shortcut to add an info toast */
    info,
    /** Shortcut to add a loading toast (defaults to persistent) */
    loading,
};

// You can also export types if needed elsewhere
// export type { ToastOptions, ToastAction };