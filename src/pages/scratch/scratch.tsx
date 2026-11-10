import { useEffect, useRef, useState } from "react";
import { x } from "../../shared";
import { createSpiral } from "./lib";
import { FileInput } from "../../components/FileInput";
import { NumberInput } from "../../components/NumberInput";

export const Scratch = () => {
  const [file, setFile] = useState(null as File | null);
  const [divider, setDivider] = useState(7);
  const [multiplier, setMultiplier] = useState(3);
  const [quality, setQuality] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    (async () => {
      if (!file) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = x(canvas.getContext("2d"));

      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      img.src = url;
      await img.decode();
      URL.revokeObjectURL(url);
      if (cancelled) return;

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
        divider,
        multiplier,
        quality,
      });
      const loop = () => {
        if (cancelled) return;
        for (let i = 0; i < 200; i++) {
          if (spiral.done) return;
          const r = imd.data[4 * (canvas.width * spiral.y + spiral.x) + 0];
          const g = imd.data[4 * (canvas.width * spiral.y + spiral.x) + 1];
          const b = imd.data[4 * (canvas.width * spiral.y + spiral.x) + 2];
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(spiral.x, spiral.y, 1, 1);
          spiral.move();
        }
        frame = requestAnimationFrame(loop);
      };
      loop();
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [file, divider, multiplier, quality]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FileInput onChange={setFile} />
      <NumberInput label="Divider" value={divider} onChange={setDivider} />
      <NumberInput
        label="Multiplier"
        value={multiplier}
        onChange={setMultiplier}
      />
      <NumberInput label="Compression" value={quality} onChange={setQuality} />
      <canvas ref={canvasRef} style={{ imageRendering: "pixelated" }} />
    </div>
  );
};
