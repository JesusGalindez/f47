'use client'

import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '@/shaders/heat-distortion/vert.glsl'
import fragmentShader from '@/shaders/heat-distortion/frag.glsl'

const HeatShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 1.0,
    uHeatColor: new THREE.Color(0xff6a00),
  },
  vertexShader,
  fragmentShader
)

extend({ HeatShaderMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    heatShaderMaterial: React.JSX.IntrinsicElements['shaderMaterial'] & {
      uTime?: number
      uIntensity?: number
      uHeatColor?: THREE.Color
      transparent?: boolean
    }
  }
}

export { HeatShaderMaterial }
