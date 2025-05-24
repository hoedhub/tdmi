<script lang="ts">
	import {
		show,
		type ToastType,
		info,
		success,
		error,
		warning,
		loading
	} from '$lib/components/toast';
	// If you prefer, you can import the specific icon components for more control
	// import { Info, CheckCircle2, AlertTriangle, XCircle, Loader2, MessageSquare } from 'lucide-svelte';

	// Array of available toast types
	const toastTypes: ToastType[] = ['info', 'success', 'warning', 'error', 'loading'];
	// You could add 'custom' here too, but it might require more specific options for a good demo

	// Helper functions for each toast type, mapping to your toastStore functions
	const toastFunctions: Record<ToastType, (message: string, options?: any) => string> = {
		info: info,
		success: success,
		warning: warning,
		error: error,
		loading: (message, options) => loading(message, { duration: 3000, ...options }), // Loading usually persistent, override for demo
		custom: (message, options) => show({ type: 'custom', message, ...options }) // Custom needs 'show'
	};

	function showRandomTimestampToast() {
		const now = new Date();
		const timestamp =
			now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
			`.${now.getMilliseconds().toString().padStart(3, '0')}`;

		// Get a random toast type
		const randomIndex = Math.floor(Math.random() * toastTypes.length);
		const randomType = toastTypes[randomIndex];

		const message = `Current time: ${timestamp}`;
		let title = '';

		// Set a title based on type for better visual feedback
		switch (randomType) {
			case 'info':
				title = 'Information';
				break;
			case 'success':
				title = 'Success!';
				break;
			case 'warning':
				title = 'Warning';
				break;
			case 'error':
				title = 'Error Occurred';
				break;
			case 'loading':
				title = 'Processing Time';
				break;
			default:
				title = 'Notification';
		}

		// Use the generic 'show' function or a map of specific functions
		// Option 1: Using the generic 'show'
		// show({
		// 	type: randomType,
		// 	title: title,
		// 	message: message,
		// 	duration: randomType === 'loading' ? 3500 : 5000 // loading might be shorter or longer
		// You could also add a random icon here if desired
		// icon: getRandomIconForType(randomType)
		// });

		// Option 2: Using a map of specific functions (if you prefer that structure)
		const toastFn = toastFunctions[randomType];
		if (toastFn) {
			toastFn(message, {
				title: title,
				duration: randomType === 'loading' ? 3500 : 5000
			});
		} else {
			console.error('Unknown toast type for random toast:', randomType);
		}
	}

	// --- Other existing functions from your previous examples ---
	function showSimpleInfo() {
		info('This is an informational message.');
	}
	// ... etc.
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<h1 class="text-3xl font-bold text-blue-600 underline">Hello world!</h1>

<button class="btn btn-primary mt-4" on:click={showRandomTimestampToast}>
	Show Random Timestamp Toast
</button>
