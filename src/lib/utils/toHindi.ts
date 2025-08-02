const hindiDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const arabicDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toHindi(str: string | number | null | undefined): string {
	if (str === null || str === undefined) {
		return '-';
	}

	let result = String(str);

	// This will replace all occurrences of Arabic digits with Hindi digits.
	result = result.replace(/[0-9]/g, (match) => {
		return hindiDigits[parseInt(match, 10)];
	});

	return result;
}
