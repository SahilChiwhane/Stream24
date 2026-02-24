import { useEffect, useRef } from "react";

export default function DissolveCanvas({ image, onComplete }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const particles = [];

      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const i = (y * canvas.width + x) * 4;
          const alpha = imageData.data[i + 3];
          if (alpha > 0) {
            particles.push({
              x,
              y,
              vx: (Math.random() - 0.5) * 3,
              vy: Math.random() * -3,
              life: 1,
            });
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015;

          if (p.life > 0) {
            ctx.fillStyle = `rgba(255,255,255,${p.life})`;
            ctx.fillRect(p.x, p.y, 2, 2);
          }
        });

        if (particles.some(p => p.life > 0)) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      }

      animate();
    };
  }, [image]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-50"
    />
  );
}
