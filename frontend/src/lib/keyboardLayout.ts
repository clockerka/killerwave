const ruToEnMap: Record<string, string> = {
	'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
	'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
	'д': 'l', 'ж': ';', 'э': '\'', 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
	'б': ',', 'ю': '.', '.': '/',
	'Й': 'Q', 'Ц': 'W', 'У': 'E', 'К': 'R', 'Е': 'T', 'Н': 'Y', 'Г': 'U', 'Ш': 'I', 'Щ': 'O', 'З': 'P',
	'Х': '{', 'Ъ': '}', 'Ф': 'A', 'Ы': 'S', 'В': 'D', 'А': 'F', 'П': 'G', 'Р': 'H', 'О': 'J', 'Л': 'K',
	'Д': 'L', 'Ж': ':', 'Э': '"', 'Я': 'Z', 'Ч': 'X', 'С': 'C', 'М': 'V', 'И': 'B', 'Т': 'N', 'Ь': 'M',
	'Б': '<', 'Ю': '>', ',': '?'
};

const enToRuMap: Record<string, string> = {
	'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
	'[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л',
	'l': 'д', ';': 'ж', '\'': 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
	',': 'б', '.': 'ю', '/': '.',
	'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г', 'I': 'Ш', 'O': 'Щ', 'P': 'З',
	'{': 'Х', '}': 'Ъ', 'A': 'Ф', 'S': 'Ы', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р', 'J': 'О', 'K': 'Л',
	'L': 'Д', ':': 'Ж', '"': 'Э', 'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М', 'B': 'И', 'N': 'Т', 'M': 'Ь',
	'<': 'Б', '>': 'Ю', '?': ','
};

/**
 * Convert text from Russian to English layout
 */
export function convertRuToEn(text: string): string {
	return text.split('').map(char => ruToEnMap[char] || char).join('');
}

/**
 * Convert text from English to Russian layout
 */
export function convertEnToRu(text: string): string {
	return text.split('').map(char => enToRuMap[char] || char).join('');
}

/**
 * Generate all possible layout variations of a search query
 * Returns an array with original query and converted versions
 */
export function getLayoutVariations(query: string): string[] {
	const variations = [query];

	// Check if query contains Cyrillic characters
	const hasCyrillic = /[а-яА-ЯёЁ]/.test(query);
	// Check if query contains Latin characters
	const hasLatin = /[a-zA-Z]/.test(query);

	// If query has Cyrillic, add English variant
	if (hasCyrillic) {
		variations.push(convertRuToEn(query));
	}

	// If query has Latin, add Russian variant
	if (hasLatin) {
		variations.push(convertEnToRu(query));
	}

	return variations;
}

/**
 * Normalize е/ё for flexible matching
 */
function normalizeYo(text: string): string {
	return text.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
}

/**
 * Check if text matches query considering keyboard layout typos
 */
export function matchesWithLayoutFix(text: string, query: string): boolean {
	const lowerText = text.toLowerCase();
	const normalizedText = normalizeYo(lowerText);
	const variations = getLayoutVariations(query.toLowerCase());

	return variations.some(variant => {
		const normalizedVariant = normalizeYo(variant);
		return normalizedText.includes(normalizedVariant) || lowerText.includes(variant);
	});
}

