/**
 * Audio recording utilities using MediaRecorder and Speech Recognition
 *
 * Key implementation details:
 * - Tracks both final and interim transcripts since SpeechRecognition may not finalize before stop()
 * - Uses isProcessing flag to prevent race conditions with late-arriving recognition results
 * - State machine: idle → recording → idle (returns to idle immediately after processing)
 */

import type { RecorderController, RecordingState, RecorderOptions } from '../types';
import { createSpeechRecognition, speak, initSpeechSynthesis } from './speech';

/**
 * Create a recorder controller for voice input
 */
export function createRecorderController(opts: RecorderOptions): RecorderController {
  const {
    onTranscriptChange,
    onResponseText,
    onStateChange,
    processCommand,
  } = opts;

  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: Blob[] = [];
  let audioUrl: string | null = null;

  let recognition: SpeechRecognition | null = null;

  let transcript = '';
  let interimTranscript = ''; // Store interim results separately
  let lastResponse = '';
  let isProcessing = false; // Flag to prevent race conditions

  let state: RecordingState = 'idle';

  function setState(newState: RecordingState) {
    state = newState;
    onStateChange?.(newState);
  }

  async function start() {
    if (state !== 'idle') {
      console.warn('[AUDIO] Already recording or recorded');
      onTranscriptChange?.('Already recording');
      return;
    }

    console.log('[AUDIO] Start button clicked, state:', state);
    onTranscriptChange?.('Requesting microphone access...');

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      console.log('[AUDIO] getUserMedia is available, requesting microphone...');

      // Initialize speech synthesis on first user interaction (required for iOS)
      initSpeechSynthesis();

      // Request microphone with constraints optimized for speech
      console.log('[AUDIO] Calling getUserMedia...');
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      console.log('[AUDIO] Microphone access granted!', stream);

      // Initialize MediaRecorder
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        audioUrl = URL.createObjectURL(blob);
      };

      mediaRecorder.start();

      // Start speech recognition (if supported)
      console.log('[AUDIO] Attempting to create speech recognition...');
      recognition = createSpeechRecognition();

      if (recognition) {
        console.log('[AUDIO] Speech recognition created successfully');
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          console.log('[AUDIO] Speech recognition started!');
          onTranscriptChange?.('Listening... (speak now)');
        };

        recognition.onresult = (event) => {
          console.log('[AUDIO] Speech recognition result received:', event);

          // Ignore results if we're processing or not recording
          if (isProcessing || state !== 'recording') {
            console.log('[AUDIO] Ignoring result - isProcessing:', isProcessing, 'state:', state);
            return;
          }

          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }

          console.log('[AUDIO] Final:', final, 'Interim:', interim);

          // Update full transcript with final results
          if (final) {
            transcript += ' ' + final;
          }

          // Store latest interim for use when stopping
          interimTranscript = interim;

          const display = (transcript + ' ' + interim).trim();
          console.log('[AUDIO] Displaying transcript:', display);
          onTranscriptChange?.(display);
        };

        recognition.onerror = (event) => {
          console.error('[AUDIO] Speech recognition error:', event.error, event);
          // On mobile, speech recognition might not be supported
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            onTranscriptChange?.('Speech recognition not available. Recording audio only.');
          } else {
            onTranscriptChange?.(`Speech error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          console.log('[AUDIO] Speech recognition ended. State:', state, 'isProcessing:', isProcessing);
          // Speech recognition stopped unexpectedly, restart if still recording
          if (state === 'recording' && !isProcessing) {
            console.log('[AUDIO] Attempting to restart speech recognition...');
            try {
              recognition?.start();
            } catch (e) {
              console.warn('[AUDIO] Could not restart speech recognition:', e);
            }
          }
        };

        try {
          console.log('[AUDIO] Calling recognition.start()...');
          recognition.start();
          console.log('[AUDIO] recognition.start() called successfully');
          // Give user feedback that we're waiting for speech recognition to start
          onTranscriptChange?.('Starting speech recognition...');
        } catch (e) {
          console.error('[AUDIO] Speech recognition failed to start:', e);
          const errorMsg = e instanceof Error ? e.message : String(e);
          onTranscriptChange?.(`Speech error: ${errorMsg}`);
        }
      } else {
        // Speech recognition not supported (e.g., iOS Safari)
        console.warn('[AUDIO] Speech recognition not supported on this device');
        onTranscriptChange?.('Recording audio (speech recognition unavailable)');
      }

      setState('recording');
    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Could not access microphone: ${errorMessage}\n\nPlease grant microphone permission in your browser settings.`);
    }
  }

  function stop() {
    if (state !== 'recording') {
      console.warn('Not currently recording');
      return;
    }

    // Set processing flag to ignore any late-arriving recognition results
    isProcessing = true;

    // Stop recognition
    if (recognition) {
      recognition.stop();
      recognition = null;
    }

    // Stop recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // Release stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Combine final transcript with any interim results
    const fullTranscript = (transcript + ' ' + interimTranscript).trim();

    // Process the transcript through the game engine
    if (fullTranscript) {
      const result = processCommand(fullTranscript);

      let responseText = '';
      if (result.kind === 'reply') {
        responseText = result.text;
      } else if (result.kind === 'pass') {
        responseText = result.reason;
      } else {
        responseText = "I didn't understand that.";
      }

      lastResponse = responseText;

      // Speak the response
      speak(responseText);

      // Update UI
      onResponseText?.(responseText);
    }

    // Reset transcripts for next recording
    transcript = '';
    interimTranscript = '';

    // Reset to idle state so next recording can start
    setState('idle');

    // Clear processing flag for next recording
    isProcessing = false;
  }

  function speakLastResponse() {
    if (lastResponse) {
      speak(lastResponse);
    }
  }

  function getState(): RecordingState {
    return state;
  }

  function destroy() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }

    setState('idle');
  }

  return {
    start,
    stop,
    speakLastResponse,
    getState,
    destroy,
  };
}
