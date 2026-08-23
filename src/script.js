import * as THREE from 'three'
import './js/loaders.js'
import { scene } from './js/scene.js'
import { sizes } from './js/sizes.js'
import { renderer, updateRendererSize } from './js/renderer.js'
import { camera, controls, updateCameraAspect } from './js/camera.js'
import { stepWorld, syncMeshes, moveCameraCollider } from './js/physics.js'
import { updatePhysicsDebugger } from './js/debug-gui.js'
import './js/sky.js'
import './js/environment.js'
import './js/greeting-text.js'
import { updateGallery } from './js/gallery.js'
import { requestAudioStart, attachAudioListener } from './js/sounds.js'

// Add audioListener to camera
attachAudioListener(camera)

/**
 * Start screen
 */
const startScreen = document.querySelector('#start-screen')

document.querySelector('#start-button').addEventListener('click', () => {
    requestAudioStart()
    startScreen.classList.add('hidden')
})

/**
 * Resize
 */
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    updateCameraAspect()

    // Update renderer
    updateRendererSize()
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    updateGallery(camera)

    // Update physics world
    stepWorld(deltaTime)

    syncMeshes()

    // Update camera body
    moveCameraCollider(camera)

    // Update cannonDebugger
    updatePhysicsDebugger()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
