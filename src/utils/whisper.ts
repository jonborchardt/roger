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
  if (!whisperPipeline) {
    await initWhisper();
  }

  try {
    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Whisper expects audio at 16kHz sample rate
    // We need to convert the audio to the right format
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Extract audio data as Float32Array
    const audioData = audioBuffer.getChannelData(0);

    // Run transcription
    const result = await whisperPipeline(audioData, {
      chunk_length_s: 30, // Process in 30-second chunks
      stride_length_s: 5,  // 5-second stride between chunks
      return_timestamps: false, // We don't need timestamps
    });

    const text = result.text?.trim() || '';
    console.log('[Whisper] Transcribed:', text);
    return text;

  } catch (error) {
    console.error('[Whisper] Transcription failed:', error);
    throw error;
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
