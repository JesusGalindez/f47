uniform float uTime;
uniform float uRadarMode;
uniform vec3 uCyanColor;
uniform vec3 uBaseColor;
uniform float uScanlineIntensity;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vFresnel;

void main() {
  // Smoother Fresnel for a soft rim glow
  float edgeGlow = pow(vFresnel, 4.0) * 1.0;
  
  // Tactical grid pattern - much fainter
  float gridX = abs(fract(vWorldPosition.x * 3.0) - 0.5);
  float gridZ = abs(fract(vWorldPosition.z * 3.0) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.08, min(gridX, gridZ));
  grid *= 0.15;

  // Scanlines - softer and more subtle
  float scan = sin(vWorldPosition.y * 60.0 - uTime * 2.0) * 0.5 + 0.5;
  scan = pow(scan, 20.0) * uScanlineIntensity * 0.5;

  // Combine colors with lower intensity
  vec3 neonColor = uCyanColor * (edgeGlow + grid + scan);
  
  // Very subtle base fill for visibility
  vec3 baseFill = uBaseColor * 0.05;
  
  vec3 finalColor = baseFill + neonColor;

  // Slower, softer pulse
  float pulse = 0.9 + sin(uTime * 1.5) * 0.1;
  finalColor *= pulse;

  // Softer alpha for natural transparency
  float alpha = (edgeGlow * 0.4 + grid * 0.3 + scan * 0.8 + 0.02) * pulse;
  
  // Radar mode: controlled intensity bump
  if (uRadarMode > 0.0) {
    vec3 activeColor = neonColor * 1.5;
    finalColor = mix(finalColor, activeColor, uRadarMode);
    alpha = mix(alpha, clamp(alpha * 1.3, 0.0, 0.7), uRadarMode);
  }

  gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
