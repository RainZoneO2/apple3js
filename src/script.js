import * as THREE from 'three'
import './js/loaders.js'
import './js/scene.js'
import { sizes } from './js/sizes.js'
import { canvas, updateRendererSize } from './js/renderer.js'
import { camera, updateCameraAspect, updateCameraRig } from './js/camera.js'
import { stepWorld, syncMeshes } from './js/physics.js'
import { updatePhysicsDebugger } from './js/debug-gui.js'
import './js/environment.js'
import './js/greeting-text.js'
import { updateGallery } from './js/gallery.js'
import { requestAudioStart, attachAudioListener, toggleMute } from './js/sounds.js'
import { onLoadProgress } from './js/loading.js'
import { CONFIG } from './js/config.js'
import { composer, setComposerSize } from './js/postprocessing.js'
import { updateAtmosphere } from './js/atmosphere.js'
import { initModal } from './js/modal.js'
import {
    initGalleryInteraction,
    onPanelsReady,
    getPanelCount,
    getPanelPosition,
    getPanelSource,
    focusPanel,
    unfocusPanel,
} from './js/gallery.js'
import { throwApple } from './js/apples.js'
import { updatePlayer, getPlayerPosition } from './js/player.js'
import { flyToPanel, startTour, stopTour, isTourActive } from './js/tour.js'
import { openMemory, currentHashMemory } from './js/modal.js'
import { updateGalaxySky } from './js/galaxy-sky.js'

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

    // Drive the player avatar (after syncMeshes so squash/stretch applies on top)
    updatePlayer(deltaTime)

    // Spring-arm follow camera orbits the apple
    updateCameraRig(getPlayerPosition(), deltaTime)

    // Update cannonDebugger
    updatePhysicsDebugger()

    // Render
    updateGalaxySky(elapsedTime)
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
    if (event.code !== 'KeyF') return
    event.preventDefault()

    const now = performance.now()
    if (now - lastThrowTime < 150) return
    lastThrowTime = now

    throwApple()
})

tick()
