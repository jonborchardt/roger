/**
 * Browser-based speech recognition using Transformers.js Whisper
 * Fallback for platforms where Web Speech API doesn't work (iOS, some Android)
 */

import { pipeline, type PipelineType } from '@xenova/transformers';

let whisperPipeline: any = null;
let isInitializing = false;

/**
 * Initialize Whisper model (lazy loaded)
 * Uses tiny model for faster loading on mobile
 */
export async function initWhisper(): Promise<void> {
  if (whisperPipeline || isInitializing) return;

  isInitializing = true;
  try {
    // Use Whisper tiny model - best balance of speed/accuracy for mobile
    whisperPipeline = await pipeline(
      'automatic-speech-recognition' as PipelineType,
      'Xenova/whisper-tiny.en',
      {
        // Enable quantization for smaller model size
        quantized: true,
      }
    );
    console.log('[Whisper] Model loaded successfully');
  } catch (error) {
    console.error('[Whisper] Failed to load model:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Transcribe audio blob to text using Whisper
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Validate input
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Invalid audio blob: empty or null');
  }

  if (!whisperPipeline) {
    await initWhisper();
  }

  if (!whisperPipeline) {
    throw new Error('Whisper model failed to initialize');
  }

  let audioContext: AudioContext | null = null;

  try {
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new Error('Audio blob is empty');
    }

    // Whisper expects audio at 16kHz sample rate
    // Create audio context with target sample rate
    audioContext = new AudioContext({ sampleRate: 16000 });

    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (decodeError) {
      throw new Error(`Failed to decode audio: ${decodeError instanceof Error ? decodeError.message : 'unknown'}`);
    }

    // Check if audio has content
    if (audioBuffer.length === 0 || audioBuffer.numberOfChannels === 0) {
      throw new Error('Decoded audio is empty');
    }

    // Extract audio data as Float32Array (use first channel)
    const audioData = audioBuffer.getChannelData(0);

    if (audioData.length === 0) {
      throw new Error('Audio data is empty');
    }

    // Run transcription with timeout protection
    const transcriptionPromise = whisperPipeline(audioData, {
      chunk_length_s: 30, // Process in 30-second chunks
      stride_length_s: 5,  // 5-second stride between chunks
      return_timestamps: false, // We don't need timestamps
    });

    // Add 60-second timeout for transcription
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Transcription timeout (60s)')), 60000);
    });

    const result = await Promise.race([transcriptionPromise, timeoutPromise]);

    const text = result?.text?.trim() || '';

    if (!text) {
      console.warn('[Whisper] Transcription returned empty text');
    } else {
      console.log('[Whisper] Transcribed:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));
    }

    return text;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'unknown error';
    console.error('[Whisper] Transcription failed:', errorMsg);
    throw new Error(`Whisper transcription failed: ${errorMsg}`);
  } finally {
    // Clean up audio context
    if (audioContext && audioContext.state !== 'closed') {
      try {
        await audioContext.close();
      } catch (e) {
        console.warn('[Whisper] Failed to close AudioContext:', e);
      }
    }
  }
}

/**
 * Check if Whisper is available
 */
export function isWhisperAvailable(): boolean {
  return whisperPipeline !== null;
}

/**
 * Clean up Whisper resources
 */
export async function destroyWhisper(): Promise<void> {
  if (whisperPipeline) {
    // Transformers.js will handle cleanup automatically
    whisperPipeline = null;
    console.log('[Whisper] Cleaned up');
  }
}
