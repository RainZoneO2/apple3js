import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { scene } from './scene.js'
import { sizes } from './sizes.js'
import { canvas } from './renderer.js'

export const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    // Far plane must clear the Sky mesh (scale 1000 -> corners ~866 units away)
    2000,
)
camera.position.set(1, 6, 7)
scene.add(camera)

// Controls
export const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

controls.target.set(0, 0.2, 0)
controls.minDistance = 2
controls.maxDistance = 60
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI / 2

export const updateCameraAspect = () => {
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
}
