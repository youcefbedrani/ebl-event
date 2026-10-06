import { useEffect, useRef } from 'react';

const COLORS = [[251, 85, 33], [255, 140, 90], [96, 140, 190]];

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    let W, H, DPR, raf = 0;
    let parts = [];

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.width = window.innerWidth * DPR;
      H = cv.height = window.innerHeight * DPR;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
    }

    function initParticles() {
      const n = reduce ? 40 : Math.min(110, Math.round(window.innerWidth / 14));
      parts = [];
      for (let k = 0; k < n; k++) {
        const c = COLORS[(Math.random() * COLORS.length) | 0];
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.5 * DPR,
          vy: (Math.random() - 0.5) * 0.5 * DPR,
          r: (Math.random() * 1.8 + 1.2) * DPR,
          c: c.join(','),
          a: Math.random() * 0.4 + 0.5
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      const link = 150 * DPR;
      let i, j, p, q, dx, dy, d;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (!reduce) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      ctx.lineWidth = DPR;
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        for (j = i + 1; j < parts.length; j++) {
          q = parts[j];
          dx = p.x - q.x;
          dy = p.y - q.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) {
            ctx.strokeStyle = 'rgba(' + p.c + ',' + 0.28 * (1 - d / link) + ')';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    function onResize() {
      resize();
      initParticles();
    }

    window.addEventListener('resize', onResize);
    resize();
    initParticles();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas id="particles" ref={canvasRef} />;
}
