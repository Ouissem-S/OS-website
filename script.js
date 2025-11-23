// Soft AI "neural network" background (pastel nodes + connecting lines)
window.addEventListener("load", () => {
    const canvas = document.getElementById("network") || (() => {
        const c = document.createElement("canvas");
        c.id = "network";
        document.body.appendChild(c);
        return c;
    })();
    const ctx = canvas.getContext("2d");

    // DPI + resize
    const dpi = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    let W = 0,
        H = 0;

    function resize() {
        W = innerWidth;
        H = innerHeight;
        canvas.width = W * dpi;
        canvas.height = H * dpi;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
        makeNodes();
    }
    addEventListener("resize", resize);

    // Nodes
    let NODES = 90; // density (try 70–140)
    const MAX_LINK = 120; // link distance in px
    const SPEED = 0.25; // slow & elegant
    let nodes = [];

    function makeNodes() {
        NODES = Math.round((W * H) / 16000); // auto-scale with screen
        NODES = Math.max(60, Math.min(NODES, 140));
        nodes = Array.from({ length: NODES }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
            r: 1.6 + Math.random() * 1.1, // dot radius
        }));
    }

    resize();

    function step() {
        // clear with very light white—to keep the page white
        ctx.clearRect(0, 0, W, H);

        // draw links
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d = Math.hypot(dx, dy);
                if (d < MAX_LINK) {
                    const a = 1 - d / MAX_LINK; // fade with distance
                    ctx.strokeStyle = `rgba(255, 143, 175, ${0.18 * a})`; // pastel pink
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // draw nodes + move
        for (const n of nodes) {
            ctx.fillStyle = "rgba(255, 95, 143, 0.9)"; // pink nodes
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();

            n.x += n.vx;
            n.y += n.vy;

            // bounce at edges (soft)
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
        }

        requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
});