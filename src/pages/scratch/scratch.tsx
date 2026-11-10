import { useEffect, useRef, useState } from "react";
import { x } from "../../shared";
import { createSpiral } from "./lib";
import { FileInput } from "../../components/FileInput";

export const Scratch = () => {
  const [file, setFile] = useState(null as File | null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      if (!file) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = x(canvas.getContext("2d"));

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await img.decode();

      // canvas.width = img.width;
      // canvas.height = img.height;
      canvas.width = Math.min(innerWidth / 2, img.width);
      canvas.height = (canvas.width * img.height) / img.width;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const imd = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = getComputedStyle(canvas)
        .getPropertyValue("--accent")
        .trim();
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spiral = createSpiral({
        ctx,
        id: imd,
        channel: 0,
        stopAt: 0.6,
        kind: "compressed",
        divider: 10,
        multiplier: 3,
        quality: 5,
      });
      const loop = () => {
        for (let i = 0; i < 200; i++) {
          const r = imd.data[4 * (canvas.width * spiral.y + spiral.x) + 0];
          const g = imd.data[4 * (canvas.width * spiral.y + spiral.x) + 1];
          const b = imd.data[4 * (canvas.width * spiral.y + spiral.x) + 2];
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(spiral.x, spiral.y, 1, 1);
          spiral.move();
          if (spiral.done) return;
        }
        requestAnimationFrame(loop);
      };
      loop();
    })();
  }, [file]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FileInput onChange={setFile} />
      <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />
    </div>
  );
};
