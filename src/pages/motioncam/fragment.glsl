#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D currentCamFrame;
uniform sampler2D previousCamFrame;
out vec4 color;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;

  vec3 diff = texture(currentCamFrame, uv).rgb - texture(previousCamFrame, uv).rgb;

  // boost and center the (tiny) frame-to-frame difference so motion is visible
  color = vec4(abs(diff) * 6.0, 1.0);
}
