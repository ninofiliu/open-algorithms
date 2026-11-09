#version 300 es
precision highp float;
uniform vec2 resolution;
uniform int step;
uniform sampler2D tex;
out vec4 color;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  color = texture(tex, uv);
}