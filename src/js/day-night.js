import * as THREE from 'three'
import { scene } from './scene.js'
import { gui } from './debug-gui.js'
import { CONFIG } from './config.js'
import { skyEffectController, updateSun } from './sky.js'
import { directionalLight } from './environment.js'

/**
 * Day/night cycle: the sun's elevation slowly oscillates, dragging the
 * directional light and fog color along with it.
 */
const state = {
    enabled: true,
    cycleSeconds: 90,
}

const NIGHT_ELEVATION = -6
const DAY_ELEVATION = 55
const NIGHT_FOG = new THREE.Color('#43104a')
const DAY_FOG = new THREE.Color('#c487ae')
const fogColor = new THREE.Color()

// Scratch values reused each frame

export const updateDayNight = (elapsedTime) => {
    if (!state.enabled) return

    const phase = Math.sin((elapsedTime / state.cycleSeconds) * Math.PI * 2)
    const elevation = THREE.MathUtils.mapLinear(
        phase,
        -1,
        1,
        NIGHT_ELEVATION,
        DAY_ELEVATION
    )

    skyEffectController.elevation = elevation
    updateSun()

    // Daylight ramps from night to full sun across the sunrise/sunset band
    const daylight = THREE.MathUtils.clamp(elevation / 30, 0, 1)

    directionalLight.intensity = Math.max(
        0.25,
        CONFIG.theme.directionalIntensity * daylight
    )

    fogColor.copy(NIGHT_FOG).lerp(DAY_FOG, daylight)
    scene.fog.color.copy(fogColor)
}

if (gui) {
    const folder = gui.addFolder('Day/Night')
    folder.add(state, 'enabled')
    folder.add(state, 'cycleSeconds', 20, 300, 1)
    folder.close()
}
