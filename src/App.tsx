import React, { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';

export default function App() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isDestroyed = false;

    async function start() {
      if (!hostRef.current) {
        return;
      }

      const app = new Application();
      await app.init({
        background: '#0b1020',
        resizeTo: hostRef.current
      });

      hostRef.current.appendChild(app.canvas);

      const stage = new Container();
      app.stage.addChild(stage);

      const label = new Text({
        text: 'Hello, Pixi!',
        style: {
          fill: '#ffffff',
          fontSize: 48,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
        }
      });
      label.anchor.set(0.5);
      stage.addChild(label);

      const dot = new Graphics();
      dot.circle(0, 0, 10);
      dot.fill('#7dd3fc');
      stage.addChild(dot);

      const updateLayout = () => {
        const w = app.renderer.width;
        const h = app.renderer.height;
        label.position.set(w / 2, h / 2);
        dot.position.set(w / 2, h / 2 + 60);
      };

      updateLayout();

      const onResize = () => {
        updateLayout();
      };

      window.addEventListener('resize', onResize);

      app.ticker.add(() => {
        dot.rotation += 0.05;
      });

      return () => {
        window.removeEventListener('resize', onResize);
        app.destroy(true);
      };
    }

    let cleanup: undefined | (() => void);

    start()
      .then((maybeCleanup) => {
        if (typeof maybeCleanup === 'function') {
          cleanup = maybeCleanup;
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });

    return () => {
      isDestroyed = true;
      if (isDestroyed && cleanup) {
        cleanup();
      }
    };
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
