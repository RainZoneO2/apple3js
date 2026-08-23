import { scene } from './scene.js'
import { renderer, updateRendererSize } from './renderer.js'
import { directionalLight } from './environment.js'
import { setOrchardShadows } from './orchard.js'
import { setVolume } from './sounds.js'
import { qualityState } from './quality-state.js'

/**
 * Graphics-quality presets and the persisted volume slider.
 *
 * low    - no shadows at all, pixel ratio capped at 1 for weak GPUs
 * medium - the classic look: letters and thrown apples cast, 1024 map
 * high   - orchard trees cast too, 2048 map
 */
const PRESETS = {
    low: { shadows: false, orchardShadows: false, shadowMapSize: 1024, pixelRatioCap: 1 },
    medium: { shadows: true, orchardShadows: false, shadowMapSize: 1024, pixelRatioCap: 2 },
    high: { shadows: true, orchardShadows: true, shadowMapSize: 2048, pixelRatioCap: 2 },
}

const QUALITY_KEY = 'apple3js:quality'
const VOLUME_KEY = 'apple3js:volume'

let currentQuality = localStorage.getItem(QUALITY_KEY) || 'medium'
if (!PRESETS[currentQuality]) currentQuality = 'medium'

const applyQuality = (name) => {
    const preset = PRESETS[name]
    if (!preset) return

    renderer.shadowMap.enabled = preset.shadows
    setOrchardShadows(preset.orchardShadows)
    qualityState.pixelRatioCap = preset.pixelRatioCap

    const shadow = directionalLight.shadow
    if (shadow.mapSize.x !== preset.shadowMapSize) {
        shadow.mapSize.set(preset.shadowMapSize, preset.shadowMapSize)
        // Force three.js to drop and recreate the depth texture at the new size
        if (shadow.map) {
            shadow.map.dispose()
            shadow.map = null
        }
    }

    updateRendererSize()

    // Flipping shadow rendering after materials have compiled needs a refresh
    scene.traverse((object) => {
        if (!object.material) return
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
            material.needsUpdate = true
        })
    })
}

applyQuality(currentQuality)

// Volume: restore the saved level before playback ever starts
const savedVolume = Number(localStorage.getItem(VOLUME_KEY))
if (!Number.isNaN(savedVolume)) setVolume(savedVolume / 100)

/**
 * HUD wiring
 */
const qualityButtons = document.querySelectorAll('#quality-buttons button')
const volumeSlider = document.querySelector('#volume-slider')

const markActiveButton = () => {
    qualityButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.quality === currentQuality)
    })
}

markActiveButton()
if (savedVolume >= 0 && savedVolume <= 100) volumeSlider.value = String(savedVolume)

qualityButtons.forEach((button) => {
    button.addEventListener('click', () => {
        currentQuality = button.dataset.quality
        localStorage.setItem(QUALITY_KEY, currentQuality)
        applyQuality(currentQuality)
        markActiveButton()
        // Release focus so Space/arrows keep driving the player, not the HUD
        button.blur()
    })
})

volumeSlider.addEventListener('input', () => {
    const value = Number(volumeSlider.value)
    setVolume(value / 100)
    localStorage.setItem(VOLUME_KEY, String(value))
})

volumeSlider.addEventListener('change', () => {
    volumeSlider.blur()
})
