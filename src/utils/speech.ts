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
 * Speak text using Web Speech Synthesis API
 */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    alert('No text to speak yet.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}
