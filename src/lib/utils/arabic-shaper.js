// Berkas ini telah diperbarui agar sesuai dengan aturan TypeScript yang ketat.

// @ts-check

const ISOLATED = 0;
const FINAL = 1;
const INITIAL = 2;
const MEDIAL = 3;

const ALEF = 0x0627;
const LAM = 0x0644;

/**
 * @typedef {Record<number, Record<number, number[]>>} LigatureMap
 * @typedef {Record<number, number[]>} LetterMap
 * @typedef {Record<number, boolean[]>} ConnectingMap
 */

/** @type {LigatureMap} */
const ligatures = {
	[LAM]: {
		[ALEF]: [0xfefb, 0xfefc] // Lam + Alef
	}
};

/** @type {LetterMap} */
const letters = {
	0x0621: [0xfe80, 0xfe80, 0xfe80, 0xfe80], // HAMZA
	0x0622: [0xfe81, 0xfe82, 0xfe81, 0xfe82], // ALEF WITH MADDA ABOVE
	0x0623: [0xfe83, 0xfe84, 0xfe83, 0xfe84], // ALEF WITH HAMZA ABOVE
	0x0624: [0xfe85, 0xfe86, 0xfe85, 0xfe86], // WAW WITH HAMZA ABOVE
	0x0625: [0xfe87, 0xfe88, 0xfe87, 0xfe88], // ALEF WITH HAMZA BELOW
	0x0626: [0xfe89, 0xfe8a, 0xfe8b, 0xfe8c], // YEH WITH HAMZA ABOVE
	0x0627: [0xfe8d, 0xfe8e, 0xfe8d, 0xfe8e], // ALEF
	0x0628: [0xfe8f, 0xfe90, 0xfe91, 0xfe92], // BEH
	0x0629: [0xfe93, 0xfe94, 0xfe93, 0xfe94], // TEH MARBUTA
	0x062a: [0xfe95, 0xfe96, 0xfe97, 0xfe98], // TEH
	0x062b: [0xfe99, 0xfe9a, 0xfe9b, 0xfe9c], // THEH
	0x062c: [0xfe9d, 0xfe9e, 0xfe9f, 0xfea0], // JEEM
	0x062d: [0xfea1, 0xfea2, 0xfea3, 0xfea4], // HAH
	0x062e: [0xfea5, 0xfea6, 0xfea7, 0xfea8], // KHAH
	0x062f: [0xfea9, 0xfeaa, 0xfea9, 0xfeaa], // DAL
	0x0630: [0xfeab, 0xfeac, 0xfeab, 0xfeac], // THAL
	0x0631: [0xfead, 0xfeae, 0xfead, 0xfeae], // REH
	0x0632: [0xfeaf, 0xfeb0, 0xfeaf, 0xfeb0], // ZAIN
	0x0633: [0xfeb1, 0xfeb2, 0xfeb3, 0xfeb4], // SEEN
	0x0634: [0xfeb5, 0xfeb6, 0xfeb7, 0xfeb8], // SHEEN
	0x0635: [0xfeb9, 0xfeba, 0xfebb, 0xfebc], // SAD
	0x0636: [0xfebd, 0xfebe, 0xfebf, 0xfec0], // DAD
	0x0637: [0xfec1, 0xfec2, 0xfec3, 0xfec4], // TAH
	0x0638: [0xfec5, 0xfec6, 0xfec7, 0xfec8], // ZAH
	0x0639: [0xfec9, 0xfeca, 0xfecb, 0xfecc], // AIN
	0x063a: [0xfecd, 0xfece, 0xfecf, 0xfed0], // GHAIN
	0x0640: [0x0640, 0x0640, 0x0640, 0x0640], // TATWEEL
	0x0641: [0xfed1, 0xfed2, 0xfed3, 0xfed4], // FEH
	0x0642: [0xfed5, 0xfed6, 0xfed7, 0xfed8], // QAF
	0x0643: [0xfed9, 0xfeda, 0xfedb, 0xfedc], // KAF
	0x0644: [0xfedd, 0xfede, 0xfedf, 0xfee0], // LAM
	0x0645: [0xfee1, 0xfee2, 0xfee3, 0xfee4], // MEEM
	0x0646: [0xfee5, 0xfee6, 0xfee7, 0xfee8], // NOON
	0x0647: [0xfee9, 0xfeea, 0xfeeb, 0xfeec], // HEH
	0x0648: [0xfeed, 0xfeee, 0xfeed, 0xfeee], // WAW
	0x0649: [0xfeef, 0xfef0, 0xfeef, 0xfef0], // ALEF MAKSURA
	0x064a: [0xfef1, 0xfef2, 0xfef3, 0xfef4]  // YEH
};

/** @type {ConnectingMap} */
const connecting = {
	0x0621: [false, false], 0x0622: [true, false], 0x0623: [true, false], 0x0624: [true, false],
	0x0625: [true, false], 0x0626: [true, true], 0x0627: [true, false], 0x0628: [true, true],
	0x0629: [true, false], 0x062a: [true, true], 0x062b: [true, true], 0x062c: [true, true],
	0x062d: [true, true], 0x062e: [true, true], 0x062f: [true, false], 0x0630: [true, false],
	0x0631: [true, false], 0x0632: [true, false], 0x0633: [true, true], 0x0634: [true, true],
	0x0635: [true, true], 0x0636: [true, true], 0x0637: [true, true], 0x0638: [true, true],
	0x0639: [true, true], 0x063a: [true, true], 0x0640: [true, true], 0x0641: [true, true],
	0x0642: [true, true], 0x0643: [true, true], 0x0644: [true, true], 0x0645: [true, true],
	0x0646: [true, true], 0x0647: [true, true], 0x0648: [true, false], 0x0649: [true, false],
	0x064a: [true, true]
};

/**
 * @param {string} text
 */
function shape(text) {
	const chars = Array.from(text);
	let result = '';

	for (let i = 0; i < chars.length; i++) {
		const charCode = chars[i].charCodeAt(0);
		if (!letters[charCode]) {
			result += chars[i];
			continue;
		}

		const prevCode = i > 0 ? chars[i - 1].charCodeAt(0) : null;
		const nextCode = i < chars.length - 1 ? chars[i + 1].charCodeAt(0) : null;

		const connectsToPrev = prevCode !== null && letters[prevCode] && connecting[prevCode]?.[1];
		const connectsToNext = nextCode !== null && letters[nextCode] && connecting[charCode]?.[1];

		let shape;
		if (connectsToPrev && connectsToNext) {
			shape = MEDIAL;
		} else if (connectsToPrev) {
			shape = FINAL;
		} else if (connectsToNext) {
			shape = INITIAL;
		} else {
			shape = ISOLATED;
		}

		if (nextCode !== null && charCode === LAM && nextCode === ALEF) {
			const ligatureShape = (shape === FINAL || shape === ISOLATED) ? 1 : 0;
			result += String.fromCharCode(ligatures[LAM][ALEF][ligatureShape]);
			i++;
		} else {
			result += String.fromCharCode(letters[charCode][shape]);
		}
	}
	return result;
}

/**
 * @param {string} text
 */
function getVisual(text) {
	return text;
}

/**
 * @param {string} text
 */
export function processArabic(text) {
	if (!text) return '';
	const shapedText = shape(text);
	return getVisual(shapedText);
}