'use client'

import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '@/shaders/stealth/vert.glsl'
import fragmentShader from '@/shaders/stealth/frag.glsl'

const StealthShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uRadarMode: 0,
    uCyanColor: new THREE.Color(0x00f0ff),
    uBaseColor: new THREE.Color(0x1a1a2e),
    uScanlineIntensity: 0.3,
  },
  vertexShader,
  fragmentShader,
  (mat) => {
    if (mat) {
      mat.transparent = true
      mat.blending = THREE.AdditiveBlending
      mat.depthWrite = false
    }
  }
)

extend({ StealthShaderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    stealthShaderMaterial: React.JSX.IntrinsicElements['shaderMaterial'] & {
      uTime?: number
      uRadarMode?: number
      uCyanColor?: THREE.Color
      uBaseColor?: THREE.Color
      uScanlineIntensity?: number
    }
  }
}

export { StealthShaderMaterial }
