// Langton's ant with different init parameters

import { x } from "../shared";

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const width = innerWidth;
const height = innerHeight;

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
canvas.style.imageRendering = "pixelated";
document.body.append(canvas);
const ctx = x(canvas.getContext("2d"));

const ant = {
  x: Math.floor(width / 2),
  y: Math.floor(height / 2),
  d: 0,
};
let step = 0;

// init all black
// ctx.fillStyle = "black";
// ctx.fillRect(0, 0, width, height);

// init with image
// const img = document.createElement("img");
// img.src = "/lib/fffe08c8af25726a001f73ce900596a9.jpg";
// await img.decode();
// ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

// init random
const imd = ctx.getImageData(0, 0, width, height);
for (let i = 0; i < imd.data.length / 4; i++) {
  if (Math.random() < 0.005) {
    imd.data[4 * i + 0] = 0;
  } else {
    imd.data[4 * i + 0] = 255;
  }
  imd.data[4 * i + 3] = 255;
}
ctx.putImageData(imd, 0, 0);

while (true) {
  const pixels = ctx.getImageData(ant.x, ant.y, 1, 1);
  // const white = !!pixels.data[0];
  const white = pixels.data[0] >= 128;

  if (white) {
    ctx.fillStyle = "black";
    ant.d++;
  } else {
    ctx.fillStyle = "white";
    ant.d--;
  }
  ctx.fillRect(ant.x, ant.y, 1, 1);
  ant.d = (ant.d + 4) % 4;
  ant.x = (ant.x + [1, 0, -1, 0][ant.d] + width) % width;
  ant.y = (ant.y + [0, 1, 0, -1][ant.d] + height) % height;

  step++;
  if (step % 100 == 0) await new Promise((r) => requestAnimationFrame(r));
}
