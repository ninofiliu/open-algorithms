#version 300 es
precision highp float;
uniform vec2 resolution;
uniform int step;
out vec4 color;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  color = vec4(uv, 0.5 + 0.5 * sin(float(step) * 0.05), 1);
}