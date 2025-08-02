# Advanced Svelte Toast Notifications

A highly customizable, easy-to-use, and feature-rich toast notification system for SvelteKit/Svelte v4, styled with DaisyUI v4 and using Lucide icons.

[![NPM Version](https://img.shields.io/npm/v/your-package-name?style=flat&color=cc3534)]() <!-- Replace with actual badge if published -->
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

## Features

- **Multiple Toast Types:** `info`, `success`, `warning`, `error`, `loading`, and `custom`.
- **Easy API:** Simple functions to trigger toasts from anywhere in your app (`toast.info()`, `toast.success()`, etc.).
- **Global Configuration:** Set default duration, max toasts, etc.
- **Per-Toast Customization:** Control duration, icon, title, message, close button, progress bar, and more for each toast.
- **Action Buttons:** Add interactive buttons within toasts.
- **Programmatic Control:** Update or dismiss toasts by their ID.
- **Stacking & Positioning:** Configurable screen position (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right) and toast stacking.
- **Progress Bar:** Visual indicator for auto-dismissal countdown.
- **Pause on Hover:** Automatically pauses the dismiss timer when hovering over a toast.
- **DaisyUI v4 Styling:** Leverages DaisyUI for clean, themeable components.
- **Lucide Icons:** Uses `lucide-svelte` for a comprehensive set of beautiful icons.
- **Accessibility:** ARIA attributes for screen reader support.
- **Svelte Transitions:** Smooth enter/leave animations.
- **HTML Content:** Option to render HTML within toast messages.
- **TypeScript Support:** Fully typed for a better development experience.

## Demo

_(Optional: Include a link to a live demo or a GIF showcasing the toasts in action)_

## Installation

1.  **Install the package** (assuming you'll publish it, otherwise just use it locally):

    ```bash
    npm install your-package-name # Replace with actual package name
    # or
    yarn add your-package-name
    # or
    pnpm add your-package-name
    ```

    If using locally, ensure the path `$lib/components/toast` is correct.

2.  **Install peer dependencies:**
    This library relies on Svelte, DaisyUI, and Lucide Svelte. Ensure they are part of your project.

    ```bash
    npm install daisyui lucide-svelte
    # or
    yarn add daisyui lucide-svelte
    # or
    pnpm add daisyui lucide-svelte
    ```

3.  **Configure DaisyUI:**
    Make sure DaisyUI is set up in your `tailwind.config.js`:
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    export default {
    	content: [
    		'./src/**/*.{html,js,svelte,ts}',
    		'./src/lib/components/toast/**/*.{svelte,ts}' // Add this line if using locally
    	],
    	theme: {
    		extend: {}
    	},
    	plugins: [require('daisyui')],
    	daisyui: {
    		themes: ['light', 'dark', 'cupcake'] // Your preferred themes
    	}
    };
    ```

## Setup

1.  **Add `ToastContainer` to your main layout:**
    Place the `ToastContainer` component once in your root layout file (e.g., `src/routes/+layout.svelte`).

    ```svelte
    <!-- src/routes/+layout.svelte -->
    <script lang="ts">
    	import { ToastContainer } from '$lib/components/toast'; // Adjust path if needed
    	// Or: import { ToastContainer } from 'your-package-name';
    </script>

    <div class="app-content">
    	<slot />
    </div>

    <ToastContainer position="top-right" />
    ```

## Usage

Import toast functions from the library and call them to display notifications.

```svelte
<script lang="ts">
	import {
		info,
		success,
		error,
		loading,
		update,
		dismiss,
		type ToastUserOptions
	} from '$lib/components/toast';
	// Or: import { info, success, ... } from 'your-package-name';
	import { Mail, Send, CheckCircle2 } from 'lucide-svelte';

	function showSimpleInfo() {
		info('This is an informational message.');
	}

	function showSuccessWithTitle() {
		success('Profile updated successfully!', {
			title: 'All Good!',
			icon: CheckCircle2, // Override default icon
			duration: 3000
		});
	}

	function showErrorPersistently() {
		error('A critical error occurred. Please contact support.', {
			duration: 0 // 0 or Infinity for persistent
		});
	}

	async function simulateAsyncTask() {
		const toastId = loading('Processing your request...', {
			title: 'Working on it',
			showCloseButton: false // Don't allow closing loading toasts
		});

		try {
			// Simulate an API call
			await new Promise((resolve) => setTimeout(resolve, 2500));

			update(toastId, {
				type: 'success',
				title: 'Completed!',
				message: 'Your request has been processed successfully.',
				duration: 5000,
				showCloseButton: true
			});
		} catch (e) {
			update(toastId, {
				type: 'error',
				title: 'Failed!',
				message: 'Something went wrong. Please try again.',
				duration: 7000,
				showCloseButton: true
			});
		}
	}

	function showWithActions() {
		const options: ToastUserOptions = {
			message: 'You have a new message. View it now?',
			icon: Mail,
			duration: 0, // Persistent until action
			actions: [
				{
					label: 'View',
					icon: Send,
					class: 'btn-primary', // DaisyUI button class
					onClick: (id) => {
						console.log('View action clicked for toast:', id);
						// navigateTo('/messages/latest');
						dismiss(id); // Dismiss the toast after action
					}
				},
				{
					label: 'Later',
					onClick: (id) => {
						dismiss(id);
					}
				}
			]
		};
		info(options.message as string, options); // Cast message if options can be partial
	}
</script>

<button class="btn" on:click={showSimpleInfo}>Show Info</button>
<button class="btn btn-success" on:click={showSuccessWithTitle}>Show Success</button>
<button class="btn btn-error" on:click={showErrorPersistently}>Show Persistent Error</button>
<button class="btn btn-accent" on:click={simulateAsyncTask}>Simulate Async Task</button>
<button class="btn btn-neutral" on:click={showWithActions}>Show with Actions</button>
```

## API

### `ToastContainer` Component Props

| Prop                  | Type                          | Default       | Description                                                                                                            |
| --------------------- | ----------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `position`            | `ToastPosition`               | `'top-right'` | Position on screen: `'top-left'`, `'top-center'`, `'top-right'`, `'bottom-left'`, `'bottom-center'`, `'bottom-right'`. |
| `maxToasts`           | `number`                      | `5`           | Maximum number of toasts displayed simultaneously.                                                                     |
| `spacing`             | `string`                      | `'gap-2'`     | DaisyUI gap class (e.g., `'gap-4'`) or CSS `gap` value for spacing between toasts.                                     |
| `containerElementTag` | `keyof HTMLElementTagNameMap` | `'div'`       | HTML tag for the container element.                                                                                    |
| `customClass`         | `string`                      | `''`          | Custom CSS classes for the container element.                                                                          |

### Toast Functions

All toast creation functions return the `id` (string) of the created toast.

- **`show(options: ToastUserOptions): string`**
  The generic function to display a toast.
- **`info(message: string, options?: ToastHelperOptions): string`**
- **`success(message: string, options?: ToastHelperOptions): string`**
- **`warning(message: string, options?: ToastHelperOptions): string`**
- **`error(message: string, options?: ToastHelperOptions): string`**
- **`loading(message: string, options?: ToastHelperOptions): string`**
  (Defaults to persistent, no close button, no progress)
- **`custom(options: Omit<ToastUserOptions, 'type'> & { message: string }): string`**
  For toasts with `type: 'custom'`.

### Control Functions

- **`dismiss(id: string): void`**
  Removes a specific toast by its ID.
- **`dismissAll(): void`**
  Removes all currently displayed toasts.
- **`update(id: string, newOptions: ToastUpdateOptions): void`**
  Updates an existing toast's properties.
- **`configureToastSystem(config: Partial<ToastStoreConfig>): void`**
  Globally configures default settings like `maxToasts` or `defaultDuration`.
  ```typescript
  import { configureToastSystem } from '$lib/components/toast';
  configureToastSystem({ defaultDuration: 7000, maxToasts: 3 });
  ```

### `ToastUserOptions` / `ToastHelperOptions`

These objects define the configuration for a toast. `ToastHelperOptions` omits `type` and `message` as they are passed directly to helper functions.

| Option             | Type                        | Default (in store)          | Description                                                                                           |
| ------------------ | --------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `id?`              | `string`                    | (auto-generated)            | Optional custom ID for the toast.                                                                     |
| `type?`            | `ToastType`                 | `'info'`                    | `'info'`, `'success'`, `'warning'`, `'error'`, `'loading'`, `'custom'`. (Not in `ToastHelperOptions`) |
| `title?`           | `string`                    |                             | Optional title for the toast.                                                                         |
| `message?`         | `string`                    | `''`                        | Main content of the toast. (Required for `custom`, direct arg for helpers)                            |
| `icon?`            | `SvelteLucideIcon \| null`  | (type-specific)             | Lucide icon component. Set to `null` for no icon.                                                     |
| `iconProps?`       | `LucideIconProps`           | `{ size: 24 }`              | Props for the Lucide icon (e.g., `size`, `strokeWidth`).                                              |
| `duration?`        | `number`                    | `5000` (ms)                 | Visibility duration. `0` or `Infinity` for persistent.                                                |
| `showCloseButton?` | `boolean`                   | `true`                      | Whether to display a close button.                                                                    |
| `progress?`        | `boolean`                   | `true` (if finite duration) | Show progress bar for auto-dismissal.                                                                 |
| `pauseOnHover?`    | `boolean`                   | `true`                      | Pause dismiss timer on mouse hover.                                                                   |
| `actions?`         | `ToastAction[]`             | `[]`                        | Array of action buttons. See `ToastAction` below.                                                     |
| `customClass?`     | `string`                    | `''`                        | Custom CSS classes for the toast element.                                                             |
| `allowHtml?`       | `boolean`                   | `false`                     | If `true`, `message` is rendered as HTML. **Use with caution (XSS risk)**.                            |
| `onDismiss?`       | `(toastId: string) => void` |                             | Callback function when the toast is dismissed.                                                        |

### `ToastAction` Interface

Defines an action button within a toast.

| Property     | Type                        | Required | Description                                                            |
| ------------ | --------------------------- | -------- | ---------------------------------------------------------------------- |
| `label`      | `string`                    | Yes      | Text label for the button.                                             |
| `onClick`    | `(toastId: string) => void` | Yes      | Function to call when clicked. Receives the toast's ID.                |
| `class?`     | `string`                    | No       | DaisyUI or custom CSS classes for button styling.                      |
| `icon?`      | `SvelteLucideIcon`          | No       | Optional Lucide icon component for the button.                         |
| `iconProps?` | `LucideIconProps`           | No       | Props for the button's Lucide icon (e.g., `{size: 16, class:'mr-1'}`). |

### `ToastUpdateOptions`

Similar to `ToastUserOptions` but all fields are optional, used for `update(id, options)`. You can change any aspect of an existing toast.

## Customization

- **Styling:**
  - Leverage DaisyUI themes to change the overall look.
  - Use the `customClass` prop on `ToastContainer` or individual toasts for fine-grained CSS adjustments.
  - For `type: 'custom'` toasts, you have full control via `customClass`.
- **Icons:**
  - Default icons are provided for standard types.
  - Pass any Lucide Svelte icon component to the `icon` prop of a toast or `ToastAction`.
- **Transitions:**
  - The `ToastContainer` uses Svelte's `fly` transition. You can modify the transition parameters or use different Svelte transitions by editing `ToastContainer.svelte` if using locally.
- **Behavior:**
  - Adjust `duration`, `pauseOnHover`, `showCloseButton`, `progress` per toast or set global defaults using `configureToastSystem`.

## Accessibility

- The `ToastContainer` has `role="region"`, `aria-live="polite"`, and `aria-label="Notifications"`.
- Individual toasts (`Toast.svelte`) have `role="alert"`.
- `aria-live` on individual toasts is set to `"assertive"` for `error` and `warning` types, and `"polite"` for others to control announcement priority.
- Close buttons have an `aria-label`.

## Known Issues / Future Enhancements

- **Promise Toasts:** A dedicated API for toasts that automatically update based on a Promise's state (e.g., `toast.promise(myPromise, { loading: '...', success: '...', error: '...' })`).
- **Limit per type:** Option to limit the number of toasts of a specific type.
- **More advanced transition options:** Allow passing transition functions/props to `ToastContainer`.
- **Undo Action:** A common pattern for "Item deleted" toasts.

## Contributing

Contributions are welcome! If you have a feature request, bug report, or want to contribute code:

1.  **Fork the repository.**
2.  **Create a new branch:** `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
3.  **Make your changes.** Adhere to existing code style and ensure TypeScript types are updated/added.
4.  **Test your changes thoroughly.**
5.  **Commit your changes:** `git commit -m "feat: Add support for X"` or `fix: Resolve Y bug`.
6.  **Push to your branch:** `git push origin feature/your-feature-name`.
7.  **Open a Pull Request** against the `main` (or `develop`) branch of the original repository.

Please provide a clear description of your changes in the Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details (you'll need to create this file if publishing).
