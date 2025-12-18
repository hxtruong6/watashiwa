import { useAudioPlayer } from '@/components/Audio/useAudioPlayer';
import { useCallback, useEffect, useRef, useState } from 'react';

type FlashCardAudioProps = {
	card: any;
	showAnswer: boolean;
	autoPlayAudio: 'off' | 'question' | 'answer';
};

const AUDIO_SPEED = 0.8;

export function useFlashCardAudio({ card, showAnswer, autoPlayAudio }: FlashCardAudioProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isFilePlaying, setIsFilePlaying] = useState(false);

	// TTS Player
	const [ttsSettings] = useState(() => {
		if (typeof window === 'undefined') return { voiceUri: '', speed: AUDIO_SPEED };
		const savedVoice = localStorage.getItem('watashiwa_audio_voice');
		const savedSpeed = localStorage.getItem('watashiwa_audio_speed');
		return {
			voiceUri: savedVoice || '',
			speed: savedSpeed ? parseFloat(savedSpeed) : AUDIO_SPEED,
		};
	});

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
				// TTS Fallback
				const savedSpeed =
					typeof window !== 'undefined'
						? localStorage.getItem('watashiwa_audio_speed')
						: `${AUDIO_SPEED}`;
				const speed = savedSpeed ? parseFloat(savedSpeed) : AUDIO_SPEED;
				speak(reading || vocabKanji || frontText, { rate: speed });
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
			const savedSpeed =
				typeof window !== 'undefined' ? localStorage.getItem('watashiwa_audio_speed') : '0.8';
			const speed = savedSpeed ? parseFloat(savedSpeed) : 0.8;
			speak(textToSpeak, { rate: speed });
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
