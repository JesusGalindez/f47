varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vFresnel;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  
  vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
  vFresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
