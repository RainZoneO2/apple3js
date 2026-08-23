import * as THREE from 'three'
import { scene } from './scene.js'
import { sizes } from './sizes.js'
import { canvas } from './renderer.js'

export const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    // Far plane must clear the sky dome (radius 900 -> corners ~866 units away)
    2000,
)
camera.position.set(1, 6, 16)
scene.add(camera)

export const updateCameraAspect = () => {
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
}

/**
 * Spring-arm follow rig orbiting the player apple.
 * Drag orbits, wheel zooms; the pivot eases toward the apple every frame so
 * hops feel springy instead of rigidly locked.
 */
const rig = { yaw: 0, pitch: 0.34, distance: 8 }
const MIN_PITCH = 0.07
const MAX_PITCH = 1.15
const MIN_DISTANCE = 3.5
const MAX_DISTANCE = 14

const pivot = new THREE.Vector3(0, 2, 9)

export const updateCameraRig = (targetPosition, deltaTime) => {
    // Frame-rate independent smoothing
    const smooth = 1 - Math.exp(-9 * deltaTime)
    pivot.lerp(targetPosition, smooth)

    const cosPitch = Math.cos(rig.pitch)
    camera.position.set(
        pivot.x + Math.sin(rig.yaw) * cosPitch * rig.distance,
        pivot.y + Math.sin(rig.pitch) * rig.distance,
        pivot.z + Math.cos(rig.yaw) * cosPitch * rig.distance,
    )
    camera.lookAt(pivot)
}

// Used by the tour and deep links to frame a panel after moving the apple
export const setCameraYaw = (yaw) => {
    rig.yaw = yaw
}

// Drag to orbit, wheel to zoom (taps are handled by the gallery interaction)
let dragging = false
let lastX = 0
let lastY = 0

canvas.addEventListener('pointerdown', (event) => {
    dragging = true
    lastX = event.clientX
    lastY = event.clientY

    // Drop lingering HUD focus so keys always steer the player
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
})

window.addEventListener('pointermove', (event) => {
    if (!dragging) return
    rig.yaw -= (event.clientX - lastX) * 0.005
    rig.pitch = THREE.MathUtils.clamp(
        rig.pitch + (event.clientY - lastY) * 0.004,
        MIN_PITCH,
        MAX_PITCH,
    )
    lastX = event.clientX
    lastY = event.clientY
})

window.addEventListener('pointerup', () => {
    dragging = false
})

canvas.addEventListener(
    'wheel',
    (event) => {
        event.preventDefault()
        rig.distance = THREE.MathUtils.clamp(
            rig.distance + event.deltaY * 0.008,
            MIN_DISTANCE,
            MAX_DISTANCE,
        )
    },
    { passive: false },
)
