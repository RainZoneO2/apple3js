import * as THREE from 'three'
import { sizes } from './sizes.js'
import { CONFIG } from './config.js'

// Canvas
export const canvas = document.querySelector('canvas.webgl')

/**
 * Renderer
 */
export const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = CONFIG.theme.toneMappingExposure

export const updateRendererSize = () => {
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
