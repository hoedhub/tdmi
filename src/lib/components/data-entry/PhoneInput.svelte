<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	// Props
	export let value: string = '';
	export let countryId: string = '';
	export let countryCode: string = '';
	export let phoneNumber: string = '';
	export let className: string = '';
	export let placeholder: string = 'Enter phone number';
	export let disabled: boolean = false;

	// Type definition for country codes
	type CountryCode = {
		id: string;
		code: string;
		country: string;
	};

	// State
	let countryCodes: CountryCode[] = [];
	let searchTerm: string = '';
	let filteredCountryCodes: CountryCode[] = [];

	const dispatch = createEventDispatcher<{
		input: { value: string };
		change: void;
	}>();

	// --- Core Logic (mostly unchanged) ---

	async function detectCountryCode() {
		countryId = 'id';
		return '+62'; // Default to Indonesia
	}

	async function resetCountryCode() {
		if (!countryCode) {
			countryId = 'id';
			countryCode = '+62'; // Default to Indonesia
			dispatch('input', { value: '' });
		}
	}

	function formatPhoneNumber(num: string): string {
		if (num.length <= 3) return num;
		let formatted = num.slice(0, 3);
		for (let i = 3; i < num.length; i += 4) {
			formatted += ' ' + num.slice(i, i + 4);
		}
		return formatted;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (!/^\d+$/.test(event.key)) {
			event.preventDefault();
		}
	}

	function debounce<T extends (event: Event) => void>(
		fn: T,
		delay: number
	): (event: Event) => void {
		let timeoutId: ReturnType<typeof setTimeout>;
		return (event: Event) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn(event), delay);
		};
	}

	function handleInput(event: Event) {
		const DIGIT_REGEX = /[^\d]/g;
		const LEADING_ZEROS_REGEX = /^0+/;
		const input = event.target as HTMLInputElement;
		let sanitizedValue = input.value.replace(DIGIT_REGEX, '').replace(LEADING_ZEROS_REGEX, '');
		value = sanitizedValue;
		phoneNumber = formatPhoneNumber(sanitizedValue);
		value = `(${countryId})` + countryCode + phoneNumber;
		dispatch('input', { value: value });
		dispatch('change');
	}

	const debouncedHandleInput = debounce(handleInput, 150);

	function selectCountryCode(code: string, id: string) {
		if (countryId === id) return;
		countryCode = code;
		countryId = id;
		value = `(${countryId})` + countryCode + phoneNumber;
		dispatch('input', { value: value });
		dispatch('change');

		// Close dropdown by blurring the active element
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	// --- Reactive Statements ---

	$: {
		// Reset phoneNumber when value is reset externally
		if (value === '') {
			phoneNumber = '';
			resetCountryCode();
		}
	}

	$: selectedCountry = countryCodes.find((c) => c.id === countryId);

	// Filter countries based on search term
	$: {
		if (!searchTerm) {
			filteredCountryCodes = countryCodes;
		} else {
			const lowerCaseSearch = searchTerm.toLowerCase();
			filteredCountryCodes = countryCodes.filter(
				(c) =>
					c.country.toLowerCase().includes(lowerCaseSearch) ||
					c.code.includes(lowerCaseSearch) ||
					c.id.toLowerCase().includes(lowerCaseSearch)
			);
		}
	}

	// --- Lifecycle ---

	onMount(async () => {
		const module = await import('$lib/constants/countryCodesData');
		countryCodes = [...module.countryCodes];

		if (!countryCode) {
			countryCode = await detectCountryCode();
		}
		// Parse initial value if it exists
		setTimeout(() => {
			if (value) {
				const match = value.match(/^\(([a-z]+)\)(\+\d{1,4})([\d\s]*)$/i);
				if (match) {
					const [_, id] = match;
					const foundCountry = countryCodes.find((c) => c.id === id.toLowerCase());
					if (foundCountry) {
						countryId = foundCountry.id;
						countryCode = foundCountry.code;
						phoneNumber = value.replace(`(${countryId})` + countryCode, '');
					}
				}
			}
		}, 100);
	});
</script>

<div class="flex items-center gap-2 {className}">
	<!-- Country Code Dropdown with Tooltip -->
	<div class="dropdown">
		<div class="tooltip" data-tip={selectedCountry?.country || 'Select country code'}>
			<label tabindex="0" class="btn btn-outline w-[7rem] justify-between font-normal">
				<span>{countryId.toUpperCase()}</span>
				<span>{countryCode}</span>
			</label>
		</div>

		<!-- Dropdown Content -->
		<div tabindex="0" class="dropdown-content z-[1] mt-2 w-64 rounded-box bg-base-100 p-2 shadow">
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Search country or code..."
				class="input input-sm input-bordered sticky top-0"
			/>
			<ul class="menu menu-sm mt-2 max-h-60 flex-nowrap overflow-y-auto">
				{#if filteredCountryCodes.length === 0}
					<li class="menu-title px-4">No country found.</li>
				{/if}
				{#each filteredCountryCodes as country (country.id)}
					<li>
						<button
							type="button"
							class="relative flex justify-between"
							class:font-bold={country.id === countryId}
							on:click={() => selectCountryCode(country.code, country.id)}
						>
							<span class="flex-1 text-left">{country.country}</span>
							<span class="w-[4rem] text-right">{country.code}</span>
							{#if country.id === countryId}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
									class="h-4 w-4"
								>
									<path
										fill="currentColor"
										d="m9.55 17.308l-4.97-4.97l.714-.713l4.256 4.256l9.156-9.156l.713.714z"
									/>
								</svg>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- Phone Number Input -->
	<input
		type="tel"
		bind:value={phoneNumber}
		{disabled}
		{placeholder}
		inputmode="numeric"
		on:input={debouncedHandleInput}
		on:keypress={handleKeyPress}
		class="input input-bordered w-full flex-1"
	/>
</div>
