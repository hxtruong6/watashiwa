import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useTtsSettings } from '@/components/Audio/useTtsSettings';
import { useCallback, useEffect, useRef, useState } from 'react';

type FlashCardAudioProps = {
	card: any;
	showAnswer: boolean;
	autoPlayAudio: 'off' | 'question' | 'answer';
};

export function useFlashCardAudio({ card, showAnswer, autoPlayAudio }: FlashCardAudioProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isFilePlaying, setIsFilePlaying] = useState(false);

	const ttsSettings = useTtsSettings();
	const {
		speak,
		stop,
		isPlaying: isTtsPlaying,
		voices,
	} = useAudioPlayer({
		rate: ttsSettings.speed,
		voiceUri: ttsSettings.voiceUri,
		lang: 'ja-JP',
	});

	const isPlaying = isFilePlaying || isTtsPlaying;

	// Data helpers
	const isVocab = !!card?.vocab;
	const vocabData = card?.vocab || {};
	const { reading, audioUrl, kanji: vocabKanji, wordSurface, exampleSentence } = vocabData;
	const { kanji: charKanji } = card?.kanji || {};
	const frontText = isVocab ? vocabKanji || wordSurface : charKanji;

	const playAudio = useCallback(() => {
		if (isVocab) {
			if (audioUrl && audioRef.current) {
				audioRef.current.currentTime = 0;
				audioRef.current
					.play()
					.then(() => setIsFilePlaying(true))
					.catch((err) => console.error('Audio play failed:', err));
			} else {
				// TTS Fallback (uses centralized rate from useAudioPlayer/useTtsSettings)
				speak(reading || vocabKanji || frontText);
			}
		}
	}, [isVocab, audioUrl, reading, vocabKanji, frontText, speak]);

	const playExampleAudio = useCallback(() => {
		if (!isVocab || !exampleSentence) return;

		let textToSpeak = '';
		if (typeof exampleSentence === 'object' && 'parts' in exampleSentence) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			textToSpeak = (exampleSentence as any).parts
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.map((p: any) => p.text)
				.join('');
		} else if (typeof exampleSentence === 'object' && 'sentence' in exampleSentence) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			textToSpeak = (exampleSentence as any).sentence;
		} else if (typeof exampleSentence === 'string') {
			textToSpeak = exampleSentence;
		}

		if (textToSpeak) {
			speak(textToSpeak);
		}
	}, [isVocab, exampleSentence, speak]);

	const toggleAudio = useCallback(
		(e?: React.MouseEvent) => {
			e?.stopPropagation();
			if (isPlaying) {
				if (audioRef.current && !audioRef.current.paused) {
					audioRef.current.pause();
				}
				stop();
				setIsFilePlaying(false);
			} else {
				playAudio();
			}
		},
		[isPlaying, stop, playAudio],
	);

	// Auto-play logic
	useEffect(() => {
		if (isVocab && autoPlayAudio !== 'off') {
			let shouldPlay = false;

			if (autoPlayAudio === 'question') {
				shouldPlay = true;
			} else if (autoPlayAudio === 'answer' && showAnswer) {
				shouldPlay = true;
			}

			if (shouldPlay) {
				// If using TTS (!audioUrl), wait for voices to be loaded
				if (!audioUrl && voices.length === 0) return;

				const timer = setTimeout(() => {
					playAudio();
				}, 300);
				return () => clearTimeout(timer);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [card?.id, showAnswer, autoPlayAudio, isVocab, voices.length]);

	return {
		audioRef,
		isPlaying,
		playAudio,
		playExampleAudio,
		toggleAudio,
		setIsFilePlaying,
		audioUrl,
	};
}
