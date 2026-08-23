import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { scene } from './scene.js'
import { sizes } from './sizes.js'
import { renderer } from './renderer.js'
import { camera } from './camera.js'
import { gui } from './debug-gui.js'

export const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.35, // strength
    0.7, // radius
    0.85, // threshold
)
composer.addPass(bloomPass)

// OutputPass applies tone mapping and the sRGB conversion at the end
composer.addPass(new OutputPass())

if (gui) {
    const bloomFolder = gui.addFolder('Bloom')
    bloomFolder.add(bloomPass, 'strength', 0, 2, 0.01)
    bloomFolder.add(bloomPass, 'radius', 0, 1, 0.01)
    bloomFolder.add(bloomPass, 'threshold', 0, 1, 0.01)
    bloomFolder.close()
}

export const setComposerSize = () => {
    composer.setSize(sizes.width, sizes.height)
}
