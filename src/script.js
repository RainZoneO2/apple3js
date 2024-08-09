import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as CANNON from "cannon-es"
import CannonDebugger from "cannon-es-debugger"

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {}
debugObject.reset = () => {
  console.log('Dispose')
}
gui.add(debugObject, 'reset')


/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const audioLoader = new THREE.AudioLoader()
const audioListener = new THREE.AudioListener()

const audioSource = new THREE.Audio( audioListener )

audioLoader.load('sounds/the_love_cycle.mp3', function(buffer) {
    audioSource.setBuffer(buffer)
    audioSource.setLoop(true)
    audioSource.setVolume(0.5)
    audioSource.play()
})

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader()
// const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Utils
 */
const objectsToUpdate = []


/**
 * Physics
 */
// World
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, -9.81, 0)

// Materials
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7
  }
)

world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
  new CANNON.Vec3(- 1, 0, 0), 
  Math.PI * 0.5
)

world.addBody(floorBody)

/**
 * Fonts
 */
const fontLoader = new FontLoader()

fontLoader.load(
    'fonts/helvetiker_regular.typeface.json',
    (font) => {
        const text = 'HAPPY BIRTHDAY, ZHANYM'

        // Material
        const textMaterial = new THREE.MeshNormalMaterial()
        
        let offsetX = 0
        let totalWidth = 0

        for (let i = 0; i < text.length; i++) {
            const letter = text[i]
            if (letter.trim() === '') {
                offsetX += 0.2
                continue
            }

            const letterGeometry = new TextGeometry(letter, {
                font: font,
                size: 0.5,
                depth: 0.2,
                curveSegments: 6,
                bevelEnabled: true,
                bevelSize: 0.02,
                bevelThickness: 0.03,
                bevelOffset: 0,
                bevelSegments: 4
            })

            letterGeometry.center()
            letterGeometry.computeBoundingBox()
            const letterBoundingBox = letterGeometry.boundingBox

            const letterWidth = letterBoundingBox.max.x - letterBoundingBox.min.x;
            const letterHeight = letterBoundingBox.max.y - letterBoundingBox.min.y;
            const letterDepth = letterBoundingBox.max.z - letterBoundingBox.min.z;
            
            totalWidth += letterWidth + 0.08

            const letterMesh = new THREE.Mesh(letterGeometry, textMaterial)
            letterMesh.position.x = offsetX
            letterMesh.position.y = letterHeight / 2
            scene.add(letterMesh)

            const shape = new CANNON.Box(new CANNON.Vec3(letterWidth / 2, letterHeight / 2, letterDepth / 2))
            const body = new CANNON.Body({ 
                mass: 1
            })
            body.addShape(shape)
            body.position.set(letterMesh.position.x, letterHeight / 2, 0)
            world.addBody(body)
            
            objectsToUpdate.push({
                mesh: letterMesh,
                body: body
            })
            
            offsetX += letterWidth + 0.08
        }

        const centerOffsetX = -totalWidth / 2
        objectsToUpdate.forEach(obj => {
            obj.mesh.position.x += centerOffsetX
            obj.body.position.x += centerOffsetX
        })
    },
    undefined,
    (error) => {
        console.error('An error occurred: ', error)
    }
)

const cannonDebugger = new CannonDebugger(scene, world)

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    color: "#23423b",
    metalness: 0.3,
    roughness: 0.4,
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

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(1, 1, 2)
scene.add(camera)

// Add audioListener to camera
camera.add( audioListener )

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // Update physics world
  world.step(1/60, deltaTime, 3)

  objectsToUpdate.forEach(obj => {
    obj.mesh.position.copy(obj.body.position)
    obj.mesh.quaternion.copy(obj.body.quaternion)
  })

  // Update cannon debugger
//   cannonDebugger.update()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
