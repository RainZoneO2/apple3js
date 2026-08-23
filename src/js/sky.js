import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import { scene } from './scene.js'
import { renderer } from './renderer.js'
import { gui } from './debug-gui.js'
import { CONFIG } from './config.js'

/**
 * Sky
 */
const sky = new Sky()
sky.scale.setScalar(1000)
scene.add(sky)

export const skyEffectController = {
    turbidity: CONFIG.sky.turbidity,
    rayleigh: CONFIG.sky.rayleigh,
    mieCoefficient: CONFIG.sky.mieCoefficient,
    mieDirectionalG: CONFIG.sky.mieDirectionalG,
    elevation: CONFIG.sky.elevation,
    azimuth: CONFIG.sky.azimuth,
    exposure: renderer.toneMappingExposure,
}

export function updateSun() {
    const uniforms = sky.material.uniforms
    const phi = THREE.MathUtils.degToRad(90 - skyEffectController.elevation)
    const theta = THREE.MathUtils.degToRad(skyEffectController.azimuth)
    const sun = new THREE.Vector3()
    sun.setFromSphericalCoords(1, phi, theta)
    uniforms['sunPosition'].value.copy(sun)
    renderer.toneMappingExposure = skyEffectController.exposure
}

const skyFolder = gui && gui.addFolder('Sky')
if (skyFolder) {
    skyFolder.add(skyEffectController, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSun)
    skyFolder.add(skyEffectController, 'rayleigh', 0.0, 4, 0.001).onChange(updateSun)
    skyFolder.add(skyEffectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSun)
    skyFolder.add(skyEffectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSun)
    skyFolder.add(skyEffectController, 'elevation', 0, 90, 0.1).onChange(updateSun)
    skyFolder.add(skyEffectController, 'azimuth', -180, 180, 0.1).onChange(updateSun)
    skyFolder.add(skyEffectController, 'exposure', 0, 2, 0.001).onChange(updateSun)
    skyFolder.close()
}

updateSun()
