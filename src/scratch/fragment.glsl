#version 300 es
precision highp float;
uniform vec2 resolution;
uniform int step;
uniform sampler2D tex;
uniform sampler2D previous;
out vec4 color;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  color = texture(tex, uv);
  // keeps `step` and `previous` active (not optimised out) until they are really used
  if (step < 0) color = texture(previous, uv);
}