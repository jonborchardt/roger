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

      // DEBUG MODE TOGGLE - Set to true to show debug info
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
        if (eventHistory.length > 8) {
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
      });

      // Wire up single toggle button
      recordButton.on('pointertap', () => {
        const state = recorder.getState();
        if (state === 'idle') {
          recorder.start();
        } else if (state === 'recording') {
          recorder.stop();
        }
      });

      // Layout function
      function updateLayout() {
        const w = app.renderer.width;
        const h = app.renderer.height;

        // Scale background to cover screen while maintaining aspect ratio
        const bgAspect = bgTexture.width / bgTexture.height;
        const screenAspect = w / h;

        if (screenAspect > bgAspect) {
          // Screen is wider than background - fit to width
          bg.width = w;
          bg.height = w / bgAspect;
        } else {
          // Screen is taller than background - fit to height
          bg.height = h;
          bg.width = h * bgAspect;
        }

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

        // Update button color based on state
        const state: RecordingState = recorder.getState();
        if (state === 'idle') {
          // Green microphone icon when idle
          repaintDot(recordButton, 30, 0x00ff00);
        } else if (state === 'recording') {
          // Red stop icon when recording
          repaintDot(recordButton, 30, 0xff0000);
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
