/**
 * Text-to-speech utilities using Web Speech API
 */

/**
 * Check if browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  const w = window as unknown as {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/**
 * Create a Speech Recognition instance (with webkit fallback)
 */
export function createSpeechRecognition(): SpeechRecognition | null {
  const w = window as unknown as {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  };

  const ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!ctor) {
    return null;
  }

  return new ctor();
}

/**
 * Initialize speech synthesis (needed for iOS)
 * Call this once on user interaction to load voices
 */
let voicesLoaded = false;

export function initSpeechSynthesis(): void {
  if (!('speechSynthesis' in window)) {
    return;
  }

  // Load voices (especially important for iOS)
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
    }
  };

  // Voices may load asynchronously
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  loadVoices();

  // iOS workaround: speak silence to initialize
  const utterance = new SpeechSynthesisUtterance('');
  utterance.volume = 0;
  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text using Web Speech Synthesis API
 * Mobile-compatible with iOS workarounds
 */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech is not supported in this browser.');
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    console.warn('No text to speak.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Small delay for iOS after cancel
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Get voices and prefer English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Error handling for mobile
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    window.speechSynthesis.speak(utterance);
  }, 100);
}
