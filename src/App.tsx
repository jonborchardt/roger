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
    let startDot: ReturnType<typeof makeDot>;
    let stopDot: ReturnType<typeof makeDot>;
    let speakDot: ReturnType<typeof makeDot>;

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
      bg.scale.set(0.5);
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

      // Debug display (shows browser capabilities) - LARGE TEXT for mobile
      const debugText = new Text({
        text: '',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 16,
          fill: 0xffff00,
          align: 'left',
          wordWrap: true,
          wordWrapWidth: 700,
          fontWeight: 'bold',
        },
      });
      debugText.anchor.set(0, 0);
      stage.addChild(debugText);

      // Check browser capabilities and display
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasSpeechRecognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      const hasSpeechSynthesis = !!('speechSynthesis' in window);

      let debugInfo = `APIs: Media=${hasGetUserMedia?'Y':'N'} Speech=${hasSpeechRecognition?'Y':'N'} TTS=${hasSpeechSynthesis?'Y':'N'} HTTPS=${window.location.protocol==='https:'?'Y':'N'}`;
      debugText.text = debugInfo;

      // Control dots
      startDot = makeDot(20, 0x00ff00); // Green: start recording
      stopDot = makeDot(20, 0xff0000);  // Red: stop recording
      speakDot = makeDot(20, 0x00ffff); // Cyan: speak last response

      stage.addChild(startDot);
      stage.addChild(stopDot);
      stage.addChild(speakDot);

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
            statusText.text = 'Press green to record';
          } else if (state === 'recording') {
            statusText.text = 'Recording... (press red to stop)';
          } else if (state === 'recorded') {
            statusText.text = 'Press green to record again';
          }
        },
        onDebug: (msg) => {
          debugText.text = `${debugInfo} | ${msg}`;
        },
      });

      // Wire up dot click handlers
      startDot.on('pointertap', () => {
        recorder.start();
      });

      stopDot.on('pointertap', () => {
        recorder.stop();
      });

      speakDot.on('pointertap', () => {
        recorder.speakLastResponse();
      });

      // Layout function
      function updateLayout() {
        const w = app.renderer.width;
        const h = app.renderer.height;

        bg.position.set(w / 2, h / 2);

        const topMargin = 20;
        titleText.position.set(w / 2, topMargin);
        statusText.position.set(w / 2, topMargin + 30);

        transcriptText.position.set(20, topMargin + 60);
        responseText.position.set(20, topMargin + 90);
        debugText.position.set(20, topMargin + 120);

        const dotY = h - 40;
        startDot.position.set(w / 2 - 60, dotY);
        stopDot.position.set(w / 2, dotY);
        speakDot.position.set(w / 2 + 60, dotY);
      }

      updateLayout();
      window.addEventListener('resize', updateLayout);

      // Animation loop
      app.ticker.add(() => {
        const t = Date.now() * 0.001;
        startDot.rotation = Math.sin(t) * 0.1;
        stopDot.rotation = Math.sin(t + 1) * 0.1;
        speakDot.rotation = Math.sin(t + 2) * 0.1;

        // Update dot colors based on state
        const state: RecordingState = recorder.getState();
        if (state === 'idle') {
          repaintDot(startDot, 20, 0x00ff00);
          repaintDot(stopDot, 20, 0x555555);
          repaintDot(speakDot, 20, 0x00ffff);
        } else if (state === 'recording') {
          repaintDot(startDot, 20, 0x555555);
          repaintDot(stopDot, 20, 0xff0000);
          repaintDot(speakDot, 20, 0x555555);
        } else {
          repaintDot(startDot, 20, 0x00ff00);
          repaintDot(stopDot, 20, 0x555555);
          repaintDot(speakDot, 20, 0x00ffff);
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
      <header className="header">
        <h1>Hello World</h1>
        <p>React + Vite + Pixi + PWA (service worker) + Capacitor</p>
      </header>
      <main className="main">
        <div className="canvasHost" ref={hostRef} />
      </main>
    </div>
  );
}
