#version 300 es
precision highp float;

uniform vec2 resolution;
uniform int step;
uniform sampler2D tex;
uniform sampler2D previous;
out vec4 color;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  if (step==0) {
    color = texture(tex, uv);
    return;
  }

  vec2 shift = texture(previous, uv).xy-0.5;
  shift*=1.2;
  shift.x = round(shift.x);
  shift.y = round(shift.y);

  color = texture(previous, uv + 0.02*shift);


  // keeps `step` and `previous` active (not optimised out) until they are really used
  if (step < 0) {
    color = texture(previous, uv);
  }
}