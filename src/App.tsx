import React, { useEffect, useRef } from 'react';
import {
  Application,
  Assets,
  Container,
  Sprite,
  Text,
} from 'pixi.js';

import { Game } from './game/Game';
import { createRecorderController } from './utils/audio';
import { makeDot, repaintDot } from './utils/pixi';
import type { RecordingState } from './types';

const game = new Game();

export default function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const app = new Application();

    // State refs for PixiJS display
    let transcriptText: Text;
    let responseText: Text;
    let recordButton: ReturnType<typeof makeDot>;

    (async () => {
      await app.init({
        background: '#0b1020',
        resizeTo: host,
      });

      host.appendChild(app.canvas);

      const stage = new Container();
      app.stage.addChild(stage);

      // Load background
      const bgTexture = await Assets.load(game.getBackgroundPath());
      const bg = new Sprite(bgTexture);
      bg.anchor.set(0.5, 0.5);
      stage.addChild(bg);

      // Title text
      const titleText = new Text({
        text: 'Roger (Space Junk Bay)',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 18,
          fill: 0xffffff,
          align: 'center',
        },
      });
      titleText.anchor.set(0.5, 0);
      stage.addChild(titleText);

      // Status text (shows if recording, speaking, etc.)
      const statusText = new Text({
        text: 'Press green to record',
        style: {
          fontFamily: 'monospace',
          fontSize: 14,
          fill: 0x00ff00,
          align: 'center',
        },
      });
      statusText.anchor.set(0.5, 0);
      stage.addChild(statusText);

      // Transcript display (what you said)
      transcriptText = new Text({
        text: '',
        style: {
          fontFamily: 'monospace',
          fontSize: 12,
          fill: 0xaaaaaa,
          align: 'left',
          wordWrap: true,
          wordWrapWidth: 500,
        },
      });
      transcriptText.anchor.set(0, 0);
      stage.addChild(transcriptText);

      // Response display (game response)
      responseText = new Text({
        text: '',
        style: {
          fontFamily: 'monospace',
          fontSize: 12,
          fill: 0xffffff,
          align: 'left',
          wordWrap: true,
          wordWrapWidth: 500,
        },
      });
      responseText.anchor.set(0, 0);
      stage.addChild(responseText);

      // Debug display - shows last 13 events
      const debugText = new Text({
        text: '',
        style: {
          fontFamily: 'Courier New, monospace',
          fontSize: 20,
          fill: 0xffff00,
          align: 'left',
          wordWrap: true,
          wordWrapWidth: 800,
          fontWeight: 'bold',
        },
      });
      debugText.anchor.set(0, 0);
      stage.addChild(debugText);

      // Always show build timestamp
      const DEBUG_MODE = false;

      // Check browser capabilities and display
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasSpeechRecognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      const hasSpeechSynthesis = !!('speechSynthesis' in window);

      // Build timestamp for cache verification
      const buildTime = import.meta.env.VITE_BUILD_TIME || 'dev';

      let debugInfo = `Build:${buildTime} APIs:M=${hasGetUserMedia?'Y':'N'} S=${hasSpeechRecognition?'Y':'N'} T=${hasSpeechSynthesis?'Y':'N'} H=${window.location.protocol==='https:'?'Y':'N'}`;

      // Event history buffer (keep last 8 events)
      const eventHistory: string[] = [];
      const addEvent = (event: string) => {
        if (!DEBUG_MODE) return; // Skip if debug disabled
        eventHistory.push(event);
        if (eventHistory.length > 13) {
          eventHistory.shift(); // Remove oldest
        }
        debugText.text = `${debugInfo}\n${eventHistory.join('\n')}`;
      };

      // Hide debug text if disabled
      debugText.visible = DEBUG_MODE;

      addEvent('Ready');

      // Single toggle button for record/stop
      recordButton = makeDot(30, 0x00ff00); // Green when idle, red when recording

      stage.addChild(recordButton);

      // Track if game is processing response
      let isGameProcessing = false;

      // Create recorder controller
      const recorder = createRecorderController({
        processCommand: (input) => game.processCommand(input),
        onTranscriptChange: (text) => {
          transcriptText.text = `You: ${text}`;
        },
        onResponseText: (text) => {
          responseText.text = `Game: ${text}`;
        },
        onStateChange: (state) => {
          if (state === 'idle') {
            statusText.text = 'Tap to speak';
          } else if (state === 'recording') {
            statusText.text = 'Listening... tap to stop';
          }
        },
        onDebug: (msg) => {
          addEvent(msg);
        },
        onProcessingComplete: () => {
          isGameProcessing = false;
          addEvent('PROC_DONE');
        },
      });

      // Wire up single toggle button with debouncing
      let isProcessingClick = false;

      recordButton.on('pointertap', async () => {
        // Ignore clicks while processing
        if (isProcessingClick || isGameProcessing) {
          addEvent('CLICK_IGNORED');
          return;
        }

        const state = recorder.getState();
        if (state === 'idle') {
          isProcessingClick = true;
          recordButton.interactive = false; // Disable during recording
          await recorder.start();
          recordButton.interactive = true; // Re-enable after start completes
          isProcessingClick = false;
        } else if (state === 'recording') {
          isProcessingClick = true;
          isGameProcessing = true; // Mark that game will process response
          recordButton.interactive = false; // Disable during processing
          recorder.stop();
          // Button will re-enable when onProcessingComplete fires
          isProcessingClick = false;
        }
      });

      // Layout function
      function updateLayout() {
        const w = app.renderer.width;
        const h = app.renderer.height;

        // Scale background to cover entire screen while maintaining aspect ratio
        // Get original texture dimensions
        const texW = bgTexture.width;
        const texH = bgTexture.height;

        // Calculate scale for both dimensions
        const scaleX = w / texW;
        const scaleY = h / texH;

        // Use Math.max to ensure background covers entire screen (like CSS background-size: cover)
        const scale = Math.max(scaleX, scaleY);

        // Apply uniform scale to maintain aspect ratio
        bg.scale.set(scale, scale);

        // Center the background (anchor is 0.5, 0.5)
        bg.position.set(w / 2, h / 2);

        const topMargin = 20;
        titleText.position.set(w / 2, topMargin);
        statusText.position.set(w / 2, topMargin + 30);

        transcriptText.position.set(20, topMargin + 60);
        responseText.position.set(20, topMargin + 90);
        debugText.position.set(20, topMargin + 120);

        const dotY = h - 50;
        recordButton.position.set(w / 2, dotY);
      }

      updateLayout();
      window.addEventListener('resize', updateLayout);

      // Animation loop
      app.ticker.add(() => {
        const t = Date.now() * 0.001;
        recordButton.rotation = Math.sin(t) * 0.1;

        // Update button color and interactivity based on state
        const state: RecordingState = recorder.getState();
        if (state === 'idle') {
          // Green microphone icon when idle - ready to record
          repaintDot(recordButton, 30, 0x00ff00);
          if (!isProcessingClick && !isGameProcessing) {
            recordButton.interactive = true;
            recordButton.alpha = 1.0;
          }
        } else if (state === 'recording') {
          // Red stop icon when recording
          repaintDot(recordButton, 30, 0xff0000);
          if (!isProcessingClick && !isGameProcessing) {
            recordButton.interactive = true;
            recordButton.alpha = 1.0;
          }
        }

        // Show disabled state when processing or button is disabled
        if (!recordButton.interactive || isGameProcessing) {
          recordButton.interactive = false;
          recordButton.alpha = 0.5;
        }
      });

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', updateLayout);
        recorder.destroy();
        app.destroy(true, { children: true, texture: true });
      };
    })();
  }, []);

  return (
    <div className="app">
      <div className="canvasHost" ref={hostRef} />
    </div>
  );
}
