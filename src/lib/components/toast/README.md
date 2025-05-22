# Advanced Svelte 5 Toast Notifications with DaisyUI & Lucide

A flexible and feature-rich toast notification system built for Svelte 5 (using Runes), styled with DaisyUI, and utilizing Lucide icons.

## Features

* **Svelte 5 Runes:** Built entirely using Svelte 5's reactive primitives (`$state`, `$derived`, `$effect`) for optimal performance and clean state management
* **DaisyUI Styling:** Leverages DaisyUI's `alert` and `toast` components for easy theming and consistent styling within your DaisyUI project
* **Lucide Icons:** Uses `lucide-svelte` for clean, default icons for different toast types, with the option to provide custom icons
* **Multiple Types:** Pre-configured types (`success`, `error`, `warning`, `info`, `loading`) with corresponding styles and icons
* **Rich Content:** Supports titles and HTML content in toast messages (use with caution)
* **Action Buttons:** Add custom action buttons with callbacks to toasts
* **Programmatic Control:** Add, update, and dismiss toasts programmatically from anywhere in your app via a simple service API
* **Auto-Dismiss & Persistence:** Configurable auto-dismiss duration or make toasts persistent until manually closed
* **Pause on Hover:** Automatically pauses the dismiss timer when the mouse hovers over the toast (configurable)
* **Positioning:** Easily configure the position of the toast container (top-left, bottom-right, etc.)
* **Accessibility:** Includes basic ARIA roles (`alert`/`status`) and `aria-live` attributes

## Prerequisites

* **Node.js:** (Check DaisyUI/Tailwind/SvelteKit requirements, usually latest LTS)
* **Svelte:** Version 5.0 or higher (Runes mode enabled)
* **Tailwind CSS:** Installed and configured in your Svelte project
* **DaisyUI:** Installed and added as a plugin in your `tailwind.config.js`
* **Lucide Svelte:** Required for icons

## Installation

1. **Install Dependencies:**
   ```bash
   npm install lucide-svelte
   # or yarn add lucide-svelte
   # or pnpm add lucide-svelte
   ```

2. **Copy Files:** Copy these files into your project (e.g., `src/lib/components/toast/`):
   * `ToastContainer.svelte`
   * `Toast.svelte`
   * `toast.service.svelte.ts`

## Setup

Place the `ToastContainer` component in your main layout file (e.g., `src/routes/+layout.svelte`):

```svelte
<script lang="ts">
  import ToastContainer from '$lib/components/toast/ToastContainer.svelte';
  import '../app.css';
</script>

<div class="main-content">
  <slot />
</div>

<ToastContainer position="top-right" />
```

## Usage

```svelte
<script lang="ts">
  import { toast } from '$lib/components/toast/toast.service';
  
  function showSuccess() {
    toast.success('Profile updated successfully!');
  }

  function showInfo() {
    toast.info('Remember to save your changes.', { duration: 7000 });
  }

  function showWarning() {
    toast.warning('Session expiring soon.', { title: 'Session Timeout' });
  }

  function showError() {
    toast.error('Connection failed. Please try again.', {
      persistent: false,
      duration: 10000
    });
  }

  let loadingToastId: string | number | null = null;
  
  async function simulateLoading() {
    loadingToastId = toast.loading('Processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (loadingToastId !== null) {
      toast.update(loadingToastId, {
        type: 'success',
        content: 'Request processed successfully!',
        persistent: false,
        duration: 4000
      });
      loadingToastId = null;
    }
  }

  function showWithActions() {
    toast.add({
      type: 'info',
      title: 'Update Available',
      content: 'A new version is ready to install.',
      persistent: true,
      actions: [
        {
          label: 'Install Now',
          onClick: () => console.log('Install action clicked!'),
          class: 'btn-primary btn-xs'
        },
        {
          label: 'Later',
          onClick: () => console.log('Later clicked!'),
          dismissOnClick: true,
          class: 'btn-ghost btn-xs'
        }
      ]
    });
  }
</script>

<div class="flex gap-2">
  <button class="btn btn-success" on:click={showSuccess}>Show Success</button>
  <button class="btn btn-info" on:click={showInfo}>Show Info</button>
  <button class="btn btn-warning" on:click={showWarning}>Show Warning</button>
  <button class="btn btn-error" on:click={showError}>Show Error</button>
  <button class="btn" on:click={simulateLoading}>Show Loading</button>
  <button class="btn" on:click={showWithActions}>Show With Actions</button>
</div>
```

## API Reference

### Toast Service Methods

* `toast.add(options: ToastOptions)`: Add or update a toast
* `toast.dismiss(id: string | number)`: Remove a specific toast
* `toast.update(id: string | number, updates: Partial<ToastOptions>)`: Update an existing toast
* `toast.success(content: string, options?)`: Show success toast
* `toast.error(content: string, options?)`: Show error toast
* `toast.warning(content: string, options?)`: Show warning toast
* `toast.info(content: string, options?)`: Show info toast
* `toast.loading(content: string, options?)`: Show loading toast

### Toast Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | string \| number | Auto-generated | Unique identifier |
| `type` | 'info' \| 'success' \| 'warning' \| 'error' \| 'loading' | 'info' | Toast type |
| `title` | string | undefined | Optional title text |
| `content` | string | '' | Main message content |
| `duration` | number | 5000 | Auto-dismiss delay (ms) |
| `persistent` | boolean | false | Prevent auto-dismiss |
| `actions` | ToastAction[] | [] | Action buttons |
| `pauseOnHover` | boolean | true | Pause timer on hover |

## Customization

### Position
Set the `position` prop on `<ToastContainer>`:
* top-left, top-center, top-right
* middle-left, middle-center, middle-right
* bottom-left, bottom-center, bottom-right (default)

### Styling
* Container: `<ToastContainer position="top-center" class="mt-16" />`
* Actions: Provide custom classes in `ToastAction`
* Theme: Uses DaisyUI alert styles - automatically adapts to your theme

## Security

Content passed to toasts is rendered using `{@html}`. Always sanitize user-generated content or modify `Toast.svelte` to use `{@text}` instead.

## Accessibility

* Uses appropriate ARIA roles (`status`/`alert`)
* Configurable `aria-live` regions
* Accessible action buttons and close controls

## License

MIT License