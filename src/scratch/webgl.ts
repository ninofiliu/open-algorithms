import { x } from "../shared";
import fragmentSource from "./fragment.glsl?raw";
import vertexSource from "./vertex.glsl?raw";

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

const width = innerWidth;
const height = innerHeight;

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

gl.uniform2f(gl.getUniformLocation(program, "resolution"), width, height);
gl.viewport(0, 0, width, height);

const stepLocation = gl.getUniformLocation(program, "step");
let step = 0;
const frame = () => {
  gl.uniform1i(stepLocation, step++);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(frame);
};
frame();
