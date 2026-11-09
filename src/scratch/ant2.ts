// Langton's ant with several ants

import { x } from "../shared";

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const scale = 5;
const width = Math.floor(innerWidth / scale);
const height = Math.floor(innerHeight / scale);

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.imageRendering = "pixelated";
document.body.append(canvas);
const ctx = x(canvas.getContext("2d"));

ctx.fillStyle = "black";
ctx.fillRect(0, 0, width, height);

const ants = Array(5)
  .fill(null)
  .map((_, i) => ({
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
    d: Math.floor(Math.random() * 4),
    color: ["lime", "white", "yellow", "grey", "red"][i],
  }));
let step = 0;

while (true) {
  for (const ant of ants) {
    const pixels = ctx.getImageData(ant.x, ant.y, 1, 1);
    const white = !!(pixels.data[0] + pixels.data[1] + pixels.data[2]);
    // const white = pixels.data[0] >= 128;

    if (white) {
      ctx.fillStyle = "black";
      ant.d++;
    } else {
      ctx.fillStyle = ant.color;
      ant.d--;
    }
    ctx.fillRect(ant.x, ant.y, 1, 1);
    ant.d = (ant.d + 4) % 4;
    ant.x = (ant.x + [1, 0, -1, 0][ant.d] + width) % width;
    ant.y = (ant.y + [0, 1, 0, -1][ant.d] + height) % height;
    if (Math.random() < 0.03) {
      if (ant.x > width / 2) ant.x--;
      else ant.x++;
      if (ant.y > height / 2) ant.y--;
      else ant.y++;
    }
  }

  step++;
  if (step % 50 == 0) await new Promise((r) => requestAnimationFrame(r));
}
