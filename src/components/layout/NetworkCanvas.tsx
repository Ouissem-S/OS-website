import { useEffect, useRef } from "react";

type NodePoint = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpi = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const maxLink = 120;
    const speed = 0.25;
    let width = 0;
    let height = 0;
    let nodes: NodePoint[] = [];
    let frame = 0;

    const makeNodes = () => {
      const count = Math.max(60, Math.min(Math.round((width * height) / 16000), 140));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: 1.6 + Math.random() * 1.1
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpi;
      canvas.height = height * dpi;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
      makeNodes();
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < maxLink) {
            const alpha = 1 - d / maxLink;
            ctx.strokeStyle = `rgba(255, 143, 175, ${0.18 * alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.fillStyle = "rgba(255, 95, 143, 0.9)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      frame = window.requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas id="network" ref={canvasRef} />;
}
