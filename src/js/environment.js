import * as THREE from 'three'
import { scene } from './scene.js'
import { textureLoader } from './loaders.js'
import { gui } from './debug-gui.js'
import { renderer } from './renderer.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CONFIG } from './config.js'

/**
 * Ground textures
 */
const groundColorTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_diff_1k.avif')
const groundARMTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_arm_1k.avif')
const groundNormalTexture = textureLoader.load(
    '/floor/stone_tiles_1k/avif/stone_tiles_nor_gl_1k.avif',
)
const groundDisplacementTexture = textureLoader.load(
    '/floor/stone_tiles_1k/avif/stone_tiles_disp_1k.avif',
)
const groundAlphaTexture = textureLoader.load('/floor/floorAlpha.webp')

groundColorTexture.colorSpace = THREE.SRGBColorSpace

const groundTextures = [
    groundColorTexture,
    groundARMTexture,
    groundNormalTexture,
    groundDisplacementTexture,
]

groundTextures.forEach((texture) => {
    texture.repeat.set(10, 10)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
})

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 128, 128),
    new THREE.MeshStandardMaterial({
        color: CONFIG.theme.floorColor,
        map: groundColorTexture,
        aoMap: groundARMTexture,
        roughnessMap: groundARMTexture,
        metalnessMap: groundARMTexture,
        alphaMap: groundAlphaTexture,
        // Opaque (alpha-tested) so the floor writes depth in the opaque pass;
        // transparent floors get sorted against the memory cards and can
        // paint over them at certain viewing angles.
        alphaTest: 0.45,
        normalMap: groundNormalTexture,
        // Tile relief from the heightmap; needs dense geometry segments above
        displacementMap: groundDisplacementTexture,
        displacementScale: 0.35,
        normalScale: new THREE.Vector2(0.8, 0.8),
        // Soft galaxy sheen via the PMREM room environment below
        envMapIntensity: 0.3,
    }),
)
// Environment map gives standard materials soft reflections
const pmremGenerator = new THREE.PMREMGenerator(renderer)
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture
pmremGenerator.dispose()

floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, CONFIG.theme.ambientIntensity)
scene.add(ambientLight)

export const directionalLight = new THREE.DirectionalLight(
    CONFIG.theme.directionalColor,
    CONFIG.theme.directionalIntensity,
)
directionalLight.position.set(10, 10, 10)
scene.add(directionalLight)

// Cast and receive
directionalLight.castShadow = true

// Shadow frustum sized to cover the greeting text row (widened in
// greeting-text.js once the text width is known)
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 40
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7

/**
 * Fog
 */
scene.fog = new THREE.FogExp2(CONFIG.theme.fogColor, CONFIG.theme.fogDensity)

const fogFolder = gui && gui.addFolder('Fog')
if (fogFolder) {
    fogFolder.close()
    fogFolder.add(scene.fog, 'density').min(0).max(0.5).step(0.001)
}
