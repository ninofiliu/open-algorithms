import { x } from "../shared";
import fragmentSource from "./fragment.glsl?raw";
import vertexSource from "./vertex.glsl?raw";

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const width = innerWidth;
const height = innerHeight;

const img = document.createElement("img");
img.src = "/lib/13020f767a6b963ac8f65e0f02cfdca4.jpg";
await img.decode();

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
document.body.append(canvas);
const gl = x(canvas.getContext("webgl2"));

const compile = (type: number, source: string) => {
  const shader = x(gl.createShader(type));
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile error");
  }
  return shader;
};

const vertex = compile(gl.VERTEX_SHADER, vertexSource);
const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);

const program = x(gl.createProgram());
gl.attachShader(program, vertex);
gl.attachShader(program, fragment);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program) ?? "program link error");
}
gl.useProgram(program);

const locations = {
  resolution: x(gl.getUniformLocation(program, "resolution")),
  step: x(gl.getUniformLocation(program, "step")),
  tex: x(gl.getUniformLocation(program, "tex")),
  previous: x(gl.getUniformLocation(program, "previous")),
};

gl.uniform2f(locations.resolution, width, height);
gl.viewport(0, 0, width, height);

const createTexture = (
  unit: number,
  location: WebGLUniformLocation,
  upload: () => void,
) => {
  const texture = x(gl.createTexture());
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  upload();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(location, unit);
  return texture;
};

createTexture(0, locations.tex, () => {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
});

createTexture(1, locations.previous, () => {
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
});

let step = 0;
const frame = () => {
  gl.uniform1i(locations.step, step++);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  // copy what was just drawn on the canvas into the "previous" texture
  gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, width, height, 0);
  requestAnimationFrame(frame);
};
frame();
