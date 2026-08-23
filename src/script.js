import * as THREE from 'three'
import './js/loaders.js'
import './js/scene.js'
import { sizes } from './js/sizes.js'
import { canvas, updateRendererSize } from './js/renderer.js'
import { camera, controls, updateCameraAspect } from './js/camera.js'
import { stepWorld, syncMeshes, moveCameraCollider } from './js/physics.js'
import { updatePhysicsDebugger } from './js/debug-gui.js'
import './js/sky.js'
import './js/environment.js'
import './js/greeting-text.js'
import { updateGallery } from './js/gallery.js'
import { requestAudioStart, attachAudioListener, toggleMute, nextTrack } from './js/sounds.js'
import { onLoadProgress } from './js/loading.js'
import { CONFIG } from './js/config.js'
import { composer, setComposerSize } from './js/postprocessing.js'
import { updateAtmosphere } from './js/atmosphere.js'
import { initModal } from './js/modal.js'
import { initGalleryInteraction, onPanelsReady, getPanelCount, getPanelPosition, getPanelSource, focusPanel, unfocusPanel } from './js/gallery.js'
import { throwApple } from './js/apples.js'
import { flyToPanel, startTour, stopTour, isTourActive } from './js/tour.js'
import { openMemory, currentHashMemory } from './js/modal.js'
import { updateDayNight } from './js/day-night.js'

// Add audioListener to camera
attachAudioListener(camera)

/**
 * Start screen
 */
document.querySelector('.start-title').textContent = CONFIG.title
const startScreen = document.querySelector('#start-screen')
const startButton = document.querySelector('#start-button')
const progressFill = document.querySelector('#progress-fill')

onLoadProgress(({ loaded, total }) => {
    const percent = total === 0 ? 0 : Math.round((loaded / total) * 100)
    progressFill.style.width = `${percent}%`

    if (loaded >= total) {
        startButton.disabled = false
        startButton.textContent = 'Click to begin'
    }
})

// A #memory-N hash requests a direct flight to that memory after entering
const requestedMemory = currentHashMemory()

const visitMemory = (index) => {
    if (index === null || index >= getPanelCount()) return
    flyToPanel(getPanelPosition(index))
    focusPanel(index)
    openMemory({ url: getPanelSource(index), index })
}

startButton.addEventListener('click', () => {
    requestAudioStart()
    startScreen.classList.add('hidden')

    if (requestedMemory !== null) {
        onPanelsReady(() => visitMemory(requestedMemory))
    }
})

/**
 * Auto-tour
 */
const tourToggle = document.querySelector('#tour-toggle')

tourToggle.addEventListener('click', () => {
    const starting = !isTourActive()

    if (starting) {
        startTour(getPanelCount(), getPanelPosition, focusPanel)
    } else {
        stopTour()
        unfocusPanel()
    }

    tourToggle.textContent = starting ? 'Stop tour' : 'Start tour'
})

initModal()
initGalleryInteraction(camera, canvas)

/**
 * Audio controls
 */
const muteToggle = document.querySelector('#mute-toggle')

muteToggle.addEventListener('click', () => {
    muteToggle.textContent = toggleMute() ? 'Sound: Off' : 'Sound: On'
})

document.querySelector('#next-track').addEventListener('click', () => {
    nextTrack()
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

    // Update renderer and post-processing
    updateRendererSize()
    setComposerSize()
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
    updateDayNight(elapsedTime)
    updateAtmosphere(elapsedTime)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

/**
 * Throw apples
 */
let lastThrowTime = 0

window.addEventListener('keydown', (event) => {
    if (event.code !== 'KeyF' && event.code !== 'Space') return
    event.preventDefault()

    const now = performance.now()
    if (now - lastThrowTime < 150) return
    lastThrowTime = now

    throwApple()
})

tick()
