#version 300 es
precision highp float;

uniform vec2 resolution;
uniform int step;
uniform sampler2D img1;
uniform sampler2D img2;
uniform sampler2D previous;
uniform int maxStep;
uniform float force;
uniform float compression;
uniform float dist;
out vec4 color;

float quant(float value, float nb) {
  return round(value*nb)/nb;
}
vec2 quant(vec2 value, float nb) {
  return vec2(quant(value.x, nb), quant(value.y, nb));
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  if (step==0) {
    color = texture(img1, uv);
    return;
  }

  if (step > maxStep) {
    color = texture(previous, uv);
    return;
  }

  vec2 shift = texture(img2, uv).xy-0.5;
  shift = quant(shift*force, compression);

  color = texture(previous, uv + dist*shift);

  // keeps `step`, `img2` and `previous` active (not optimised out) until they are really used
  if (step < 0) {
    color = texture(previous, uv);
    color = texture(img2, uv);
  }
}