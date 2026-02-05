/**
 * Shared voice selection for Speech Synthesis — single source of truth.
 * Follows Web Speech API best practices: prefer local voices, clear fallback order.
 */

/** Voice names we treat as preferred for Japanese (used in settings dropdown and fallback). */
export const PREFERRED_JA_VOICE_NAMES = ['hattori', 'kyoko'] as const;

const nameMatches = (voice: SpeechSynthesisVoice, names: readonly string[]) =>
	names.some((n) => voice.name.toLowerCase().includes(n));

/** Filter to Japanese voices only. */
export function getJapaneseVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
	return voices.filter((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
}

/** Voices we show in settings (preferred names only). Keeps UI simple and consistent. */
export function getSelectableVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
	return getJapaneseVoices(voices).filter((v) => nameMatches(v, PREFERRED_JA_VOICE_NAMES));
}

/**
 * Resolve which voice to use for Japanese TTS.
 * Best practice: prefer saved voiceUri if it exists; else preferred names (Hattori/Kyoko);
 * prefer localService when equal; else any ja-JP.
 */
export function resolveJapaneseVoice(
	voices: SpeechSynthesisVoice[],
	voiceUri?: string | null,
): SpeechSynthesisVoice | null {
	const ja = getJapaneseVoices(voices);
	if (!ja.length) return null;

	// 1. Exact match by saved URI (user choice)
	if (voiceUri) {
		const byUri = ja.find((v) => v.voiceURI === voiceUri);
		if (byUri) return byUri;
	}

	// 2. Preferred names (Hattori, Kyoko); prefer local over remote
	const preferred = ja.filter((v) => nameMatches(v, PREFERRED_JA_VOICE_NAMES));
	const localPreferred = preferred.filter((v) => v.localService);
	if (localPreferred.length) return localPreferred[0];
	if (preferred.length) return preferred[0];

	// 3. Any ja-JP; prefer local, then default
	const localJa = ja.filter((v) => v.localService);
	if (localJa.length) return localJa[0];
	const defaultJa = ja.find((v) => v.default);
	return defaultJa || ja[0];
}
