import * as THREE from "three"
import { scene } from "./scene.js"
import { textureLoader } from "./loaders.js"
import { gui } from "./debug-gui.js"

/**
 * Ground textures
 */
const groundColorTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_diff_1k.avif')
const groundARMTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_arm_1k.avif')
const groundNormalTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_nor_gl_1k.avif')
const groundDisplacementTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_disp_1k.avif')
const groundAlphaTexture = textureLoader.load('/floor/floorAlpha.webp')

groundColorTexture.colorSpace = THREE.SRGBColorSpace

const groundTextures = [
    groundColorTexture,
    groundARMTexture,
    groundNormalTexture,
    groundDisplacementTexture,
]

groundTextures.forEach(texture => {
    texture.repeat.set(48, 48)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
})

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 10, 10),
  new THREE.MeshStandardMaterial({
    color: "#324c8c",
    map: groundColorTexture,
    aoMap: groundARMTexture,
    roughnessMap: groundARMTexture,
    metalnessMap: groundARMTexture,
    alphaMap: groundAlphaTexture,
    transparent: true,
    // displacementMap: groundDisplacementTexture,
    // displacementBias: 0,
    normalMap: groundNormalTexture,
  })
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

export const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6)
directionalLight.position.set(10, 10, 10)
scene.add(directionalLight)

// Cast and receive
directionalLight.castShadow = true

// Mapping
directionalLight.shadow.mapSize.set(512, 512)
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7

/**
 * Fog
 */
scene.fog = new THREE.FogExp2('#871769', 0.035)

const fogFolder = gui && gui.addFolder('Fog')
if (fogFolder) {
    fogFolder.close()
    fogFolder.add(scene.fog, 'density').min(0).max(0.5).step(0.001)
}
