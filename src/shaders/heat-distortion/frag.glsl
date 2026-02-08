uniform float uTime;
uniform float uIntensity;
uniform vec3 uHeatColor;

varying vec2 vUv;
varying vec3 vPosition;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 distortedUv = vUv;
  
  // Multi-layered turbulence
  float n1 = noise(vUv * 8.0 + uTime * 1.5);
  float n2 = noise(vUv * 16.0 - uTime * 2.0) * 0.5;
  float n3 = noise(vUv * 32.0 + uTime * 3.0) * 0.25;
  float turbulence = n1 + n2 + n3;
  
  // Vertical fade (stronger at bottom/exhaust)
  float verticalFade = smoothstep(0.0, 0.7, 1.0 - vUv.y);
  
  // Heat shimmer
  float shimmer = turbulence * uIntensity * verticalFade;
  
  // Color: from transparent to orange-white hot
  vec3 coolColor = vec3(0.0);
  vec3 hotColor = uHeatColor;
  vec3 whiteHot = vec3(1.0, 0.95, 0.9);
  
  float heatMask = shimmer * 2.0;
  vec3 color = mix(coolColor, hotColor, smoothstep(0.0, 0.5, heatMask));
  color = mix(color, whiteHot, smoothstep(0.7, 1.0, heatMask));
  
  float alpha = smoothstep(0.05, 0.3, heatMask) * verticalFade * 0.8;
  
  gl_FragColor = vec4(color, alpha);
}
