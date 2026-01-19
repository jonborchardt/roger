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
import { transcribeAudio } from './whisper';

/**
 * Create a recorder controller for voice input
 */
export function createRecorderController(opts: RecorderOptions): RecorderController {
  const {
    onTranscriptChange,
    onResponseText,
    onStateChange,
    onDebug,
    processCommand,
  } = opts;

  let mediaRecorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: Blob[] = [];
  let audioUrl: string | null = null;
  let recordedBlob: Blob | null = null; // Store for Whisper fallback

  let recognition: any = null; // SpeechRecognition type not available in TS
  let recognitionWorked = false; // Track if Speech Recognition produced results

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

    // Reset state for new recording
    recognitionWorked = false;
    recordedBlob = null;
    transcript = '';
    interimTranscript = '';

    onDebug?.('1:BTN_CLICK');
    onTranscriptChange?.('Requesting microphone...');

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      onDebug?.('2:API_OK');

      // Initialize speech synthesis on first user interaction (required for iOS)
      initSpeechSynthesis();

      // Request microphone with constraints optimized for speech
      onDebug?.('3:REQ_MIC');
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      onDebug?.('4:MIC_OK');

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
        recordedBlob = blob; // Store for potential Whisper fallback
        onDebug?.(`BLOB:${blob.size}b`);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        audioUrl = URL.createObjectURL(blob);
      };

      mediaRecorder.start();

      // Start speech recognition (if supported)
      onDebug?.('5:TRY_RECOG');
      recognition = createSpeechRecognition();

      if (recognition) {
        onDebug?.('6:RECOG_OK');
        // Try NON-continuous mode - Chrome Android works better with this
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 5;

        recognition.onstart = () => {
          onDebug?.('7:STARTED!!!');
          onTranscriptChange?.('LISTENING NOW - speak!');
        };

        recognition.onaudiostart = () => {
          onDebug?.('AUDIO_START');
          onTranscriptChange?.('Audio detected!');
        };

        recognition.onsoundstart = () => {
          onDebug?.('SOUND_START');
          onTranscriptChange?.('Sound detected!');
        };

        recognition.onspeechstart = () => {
          onDebug?.('SPEECH_START');
          onTranscriptChange?.('Speech detected!');
        };

        recognition.onspeechend = () => {
          onDebug?.('SPEECH_END');
        };

        recognition.onsoundend = () => {
          onDebug?.('SOUND_END');
        };

        recognition.onaudioend = () => {
          onDebug?.('AUDIO_END');
        };

        recognition.onresult = (event: any) => {
          onDebug?.('8:RESULT');

          // Ignore results if we're processing or not recording
          if (isProcessing || state !== 'recording') {
            onDebug?.('SKIP_RES');
            return;
          }

          recognitionWorked = true; // Mark that Speech Recognition is working

          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];

            // ALWAYS capture first alternative even if confidence is low
            const text = result[0]?.transcript || '';
            const conf = result[0]?.confidence || 0;

            onDebug?.(`GOT:"${text.substring(0,20)}"(${(conf*100).toFixed(0)}%)`);

            if (result.isFinal) {
              final += text;
              onDebug?.('FINAL');
            } else {
              interim += text;
              onDebug?.('INTERIM');
            }
          }

          // Update full transcript with final results
          if (final) {
            transcript += ' ' + final;
            onDebug?.(`T="${transcript.substring(0,20)}"`);
          }

          // Store latest interim for use when stopping
          interimTranscript = interim;

          const display = (transcript + ' ' + interim).trim();
          if (display) {
            onTranscriptChange?.(display);
          }
        };

        recognition.onnomatch = () => {
          onDebug?.('NO_MATCH');
          onTranscriptChange?.('Heard but no match');
        };

        recognition.onerror = (event: any) => {
          onDebug?.(`ERR:${event.error}`);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            onTranscriptChange?.('Speech not allowed');
          } else if (event.error === 'no-speech') {
            onTranscriptChange?.('No speech detected (timeout)');
          } else if (event.error === 'network') {
            onTranscriptChange?.('Network error - check connection');
          } else {
            onTranscriptChange?.(`Error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          onDebug?.('END');
          // Speech recognition stopped unexpectedly, restart if still recording
          if (state === 'recording' && !isProcessing) {
            try {
              recognition?.start();
              onDebug?.('RESTART');
            } catch (e) {
              onDebug?.('RESTART_FAIL');
            }
          }
        };

        try {
          onDebug?.('6b:START_CALL');
          recognition.start();
          onDebug?.('6c:START_OK');
          onTranscriptChange?.('Waiting for recognition...');
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : String(e);
          onDebug?.(`START_ERR:${errorMsg}`);
          onTranscriptChange?.(`Error: ${errorMsg}`);
        }
      } else {
        onDebug?.('NO_RECOG');
        onTranscriptChange?.('Speech recognition unavailable');
      }

      setState('recording');
    } catch (err) {
      console.error('Error starting recording:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Could not access microphone: ${errorMessage}\n\nPlease grant microphone permission in your browser settings.`);
    }
  }

  async function stop() {
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

    // Stop recording and wait for blob to be ready
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // Wait for MediaRecorder to finish and save the blob
      await new Promise<void>((resolve) => {
        if (!mediaRecorder) {
          resolve();
          return;
        }

        const currentRecorder = mediaRecorder;
        const originalOnStop = currentRecorder.onstop;

        currentRecorder.onstop = (ev) => {
          // Call original handler to save blob
          if (originalOnStop) originalOnStop.call(currentRecorder, ev);
          resolve();
        };

        currentRecorder.stop();
      });

      onDebug?.('REC_STOPPED');
    }

    // Release stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // Combine final transcript with any interim results
    let fullTranscript = (transcript + ' ' + interimTranscript).trim();

    onDebug?.(`STOP:${fullTranscript ? 'HAS_TEXT' : 'EMPTY'}`);

    // Debug: Check Whisper trigger conditions
    onDebug?.(`CHK:T=${!!fullTranscript} R=${recognitionWorked} B=${!!recordedBlob}`);

    // If Speech Recognition didn't work but we have audio, try Whisper
    if (!fullTranscript && !recognitionWorked && recordedBlob) {
      onDebug?.('TRY_WHISPER');
      onTranscriptChange?.('Using browser AI to transcribe...');

      try {
        fullTranscript = await transcribeAudio(recordedBlob);
        onDebug?.(`WHISPER:"${fullTranscript.substring(0,20)}"`);
        onTranscriptChange?.(`You said: ${fullTranscript}`);
      } catch (err) {
        onDebug?.(`WHISPER_ERR:${err instanceof Error ? err.message : 'unknown'}`);
        onTranscriptChange?.('AI transcription failed - try again');
      }
    } else {
      onDebug?.('SKIP_WHISPER');
    }

    // Process the transcript through the game engine
    if (fullTranscript) {
      onDebug?.(`PROC:"${fullTranscript}"`);
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
      onDebug?.('RESP_OK');
    } else {
      onDebug?.('NO_TRANSCRIPT');
      onTranscriptChange?.('No speech captured - try again');
    }

    // Reset transcripts for next recording
    transcript = '';
    interimTranscript = '';
    recognitionWorked = false;
    recordedBlob = null;

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
