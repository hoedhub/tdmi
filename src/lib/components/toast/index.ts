// src/lib/components/toast/index.ts

// 1. Export the main container component
export { default as ToastContainer } from './ToastContainer.svelte';

// 2. Export the toast management functions from toastStore.ts
// It's often cleaner to export the functions directly rather than the whole store object,
// but you can also export the store if direct subscription/manipulation is desired.
export {
    show,
    info,
    success,
    warning,
    error,
    loading, // Added loading as it's a common helper
    custom,
    dismiss,
    dismissAll,
    update,
    configureToastSystem, // Expose if you want users to configure defaults
    _setMaxToasts // Usually internal, but if needed for advanced cases
} from './toastStore';
// Optionally, if you want to allow direct access to the Svelte store (e.g., for custom subscriptions)
// export { toastStore } from './toastStore';

// 3. Export TypeScript types/interfaces for consumers
// This allows users to strongly type their toast configurations if they are using TypeScript.
export type {
    ToastMessage,       // The full, resolved toast object
    ToastUserOptions,   // Options for the generic `show()` function
    ToastHelperOptions, // Options for helper functions like `info()`, `success()`
    ToastUpdateOptions, // Options for updating a toast
    ToastAction,
    ToastType,
    ToastPosition,
    ToastContainerProps,
    SvelteLucideIcon,    // If users might need to type custom icon components
    LucideIconProps      // If users might need to type icon props
} from './types';

// You might also want to export specific Lucide icon types if they are part of your public API
// for toast icons, but generally, users would import Lucide icons directly.
// e.g., export type { Icon as LucideIcon } from 'lucide-svelte';