import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as CANNON from "cannon-es"
import CannonDebugger from "cannon-es-debugger"
import { Sky } from "three/addons/objects/Sky.js"
import { gsap } from 'gsap'

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        console.log('loaded')
    },
    // Progress
    () => {
        console.log('progress')
    }
)
const textureLoader = new THREE.TextureLoader(loadingManager)

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {}
debugObject.reset = () => {
  console.log('Dispose')
}
gui.add(debugObject, 'reset')

debugObject.physicsDebugger = false
gui.add(debugObject, 'physicsDebugger')


/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: 
    {
        uAlpha: { value: 1}
    },
    vertexShader: `
        void main() 
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,

})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

overlay.renderOrder = 2

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

// Ground
const groundColorTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_diff_1k.avif')
const groundARMTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_arm_1k.avif')
const groundNormalTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_nor_gl_1k.avif')
const groundDisplacementTexture = textureLoader.load('/floor/stone_tiles_1k/avif/stone_tiles_disp_1k.avif')
const groundAlphaTexture = textureLoader.load('floor/floorAlpha.webp')

groundColorTexture.colorSpace = THREE.SRGBColorSpace

groundColorTexture.repeat.set(48, 48)
groundARMTexture.repeat.set(48, 48)
groundNormalTexture.repeat.set(48, 48)
groundDisplacementTexture.repeat.set(48, 48)

groundColorTexture.wrapS = THREE.RepeatWrapping
groundARMTexture.wrapS = THREE.RepeatWrapping
groundNormalTexture.wrapS = THREE.RepeatWrapping
groundDisplacementTexture.wrapS = THREE.RepeatWrapping

groundColorTexture.wrapT = THREE.RepeatWrapping
groundARMTexture.wrapT = THREE.RepeatWrapping
groundNormalTexture.wrapT = THREE.RepeatWrapping
groundDisplacementTexture.wrapT = THREE.RepeatWrapping


// Memories - Images
const memoryAlphaTexture = textureLoader.load('memories/memoryAlpha.webp')

const memoryTextures = []

const memoryFolderPath = 'memories/textures/webp/'
const manifestUrl = '/manifest.json'

fetch(manifestUrl)
    .then(response => response.json())
    .then(imageFiles => {
        const filteredImages = imageFiles.filter(file => file.startsWith(memoryFolderPath))
        
        let loadedTextures = 0

        filteredImages.forEach(file => {
            const imageUrl = `${file}`
            
            textureLoader.load(imageUrl, texture => {
                memoryTextures.push(texture)
                loadedTextures++
                
                // console.log('Loaded texture:', imageUrl)
            
                // Check if all textures have been loaded
                if (loadedTextures === filteredImages.length) {
                    memoryTextures.forEach(texture => {
                        texture.colorSpace = THREE.SRGBColorSpace
                        texture.generateMipmaps = false
                        console.log('Color space set to SRGB for texture & Mipmaps turned off')
                    })
                    console.log('All textures loaded:', memoryTextures.length)
                    
                    gsap.to(overlayMaterial.uniforms.uAlpha, { duration:3, value: 0})
                    

                    generateMemoryPanels()
                }
            })
        })

        if (filteredImages.length === 0) {
            console.log(`No images found in target folder: ${memoryFolderPath}`)
        }
    })
    .catch(error => {
        console.error('Error fetching manifest or images:', error)
    })

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
        const text = 'HAPPY BIRTHDAY , ZHANYM'

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

            const letterWidth = letterBoundingBox.max.x - letterBoundingBox.min.x
            const letterHeight = letterBoundingBox.max.y - letterBoundingBox.min.y
            const letterDepth = letterBoundingBox.max.z - letterBoundingBox.min.z
            
            totalWidth += letterWidth + 0.08

            const letterMesh = new THREE.Mesh(letterGeometry, textMaterial)
            letterMesh.position.x = offsetX
            letterMesh.position.y = letterHeight / 2 + 3
            scene.add(letterMesh)

            const shape = new CANNON.Box(new CANNON.Vec3(letterWidth / 2, letterHeight / 2, letterDepth / 2))
            const body = new CANNON.Body({ 
                mass: 1
            })

            body.addShape(shape)
            body.position.set(letterMesh.position.x, letterMesh.position.y, 0)
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

const cannonDebugger = new CannonDebugger(scene, world, {
    onUpdate(body, mesh) {
        if (debugObject.physicsDebugger)
            mesh.visible = true
        else if (!debugObject.physicsDebugger) {
            mesh.visible = false
        }
    }
})

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 1000, 1000),
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

// CAMERA Body
// Body
const cameraBody = new CANNON.Body({
    position: new CANNON.Vec3(0,5,0),
    shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4)),
    linearDamping: 0,
    angularDamping: 0,

    mass: 0.1
})
world.addBody(cameraBody)

// Utils

const moveCameraCollider = () => {
    // Set the body position directly
    cameraBody.position.copy(camera.position);
    
    // Optional: Set velocity to zero to avoid unintended movements
    cameraBody.velocity.set(0, 0, 0);
    cameraBody.angularVelocity.set(0, 0, 0);
}

/**
 * Memories - Images
 */

// Mesh array for referencing in tick()
const planeObjects = []

const generateMemoryPanels = () => {
    // Calculate number of rows and columns based on length of memoryTextures
    const numColumns = Math.ceil(Math.sqrt(memoryTextures.length))
    const numRows = Math.ceil(memoryTextures.length / numColumns)

    // Spacing between planes
    const spacing = 3.5
    
    // Size of square plane
    const planeSize = 6

    // Geometry
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize)

    // Body Geometry
    const boxShape = new CANNON.Box(new CANNON.Vec3(planeSize * 0.5, 3, planeSize * 0.5))

    memoryTextures.forEach((texture, index) => {
        // Material
        const planeMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaMap: memoryAlphaTexture,
            depthWrite: false,
        })

        // Mesh
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

        // Get the current row
        const row = Math.floor(index / numColumns)
        // Get the current column
        const column = index % numColumns

        // Calculate x and z based on row and column
        const x = ((planeSize + spacing) * (2 * column - numColumns)) / 2
        const z = ((planeSize + spacing) * (2 * row - numRows)) / 2

        planeMesh.position.set(x, 4, z)

        scene.add(planeMesh)

        // Trigger zone for panel
        const triggerBody = new CANNON.Body({ isTrigger: true })
        triggerBody.addShape(boxShape)
        triggerBody.position.set(x, 3, z)

        world.addBody(triggerBody)

        triggerBody.addEventListener('collide', (event) => {
            if (event.body === cameraBody) {
                movePanel(index, 1)
                console.log('test')
            }
        })
        
        planeObjects.push({
            mesh: planeMesh,
            body: triggerBody,
        })

    })
}

// Global event listeners for endContact on the world
world.addEventListener('endContact', (event) => {
    const bodyA = event.bodyA
    const bodyB = event.bodyB
    if (bodyA === cameraBody || bodyB === cameraBody) {
        const otherBody = bodyA === cameraBody ? bodyB : bodyA
        const planeObject = planeObjects.find((obj) => obj.body === otherBody)
        if (planeObject) {
            const planeIndex = planeObjects.indexOf(planeObject)
            movePanel(planeIndex, 0)
        }
    }
})

const spriteMaterial = new THREE.SpriteMaterial()
const sprite = new THREE.Sprite(spriteMaterial)
sprite.scale.set(3, 3, 1)
sprite.visible = false
scene.add(sprite)


// Utils
const cameraDirection = new THREE.Vector3()
const distanceFromCamera = 2 // Distance from the camera
let newPosition

let currentTextureIndex = -1
let currentAnimation = null

const updateSpriteMaterial = (textureIndex) => {
    if (currentAnimation) {
        gsap.killTweensOf(sprite.scale)
        gsap.killTweensOf(sprite)
    }

    currentTextureIndex = textureIndex

    if (textureIndex === -1) {
        currentAnimation = gsap.to(sprite.scale, { duration: 0.5, x:0, y:0, z: 0, onComplete: () => sprite.visible = false})
    } else {
        sprite.visible = true
        currentAnimation = gsap.to(sprite.scale, {duration: 0.5, x:3, y:3, z: 3, onStart: () => {
            sprite.material.map = memoryTextures[textureIndex];
            sprite.material.needsUpdate = true;
        }})
    }
}

const updateSpritePosition = () => {
    // Calculate the position in front of the camera
    camera.getWorldDirection(cameraDirection)

    newPosition = new THREE.Vector3().copy(camera.position).add(cameraDirection.multiplyScalar(distanceFromCamera))

    // Update the sprite's position
    sprite.position.copy(newPosition)
}

const movePanel = (index, directionFlag) => {
    if (directionFlag === 1) {
        updateSpriteMaterial(index)
    } else if (directionFlag === 0) {
        updateSpriteMaterial(-1)
    }
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.6)
directionalLight.position.set(10, 10, 10)
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
camera.position.set(1, 6, 7)
scene.add(camera)

// Add audioListener to camera
camera.add( audioListener )

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

controls.minDistance = 0.1
controls.maxDistance = 60


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1

/**
 * Shadows
 */
// Cast and receive
directionalLight.castShadow = true
floor.receiveShadow = true

// Mapping
directionalLight.shadow.mapSize.set(512, 512)
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7

/**
 * Sky
 */
const sky = new Sky()
sky.scale.setScalar(1000)
scene.add(sky)

const skyEffectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure
}

function updateSun() {
    const uniforms = sky.material.uniforms
    const phi = THREE.MathUtils.degToRad(90 - skyEffectController.elevation)
    const theta = THREE.MathUtils.degToRad(skyEffectController.azimuth)
    const sun = new THREE.Vector3()
    sun.setFromSphericalCoords(1, phi, theta)
    uniforms['sunPosition'].value.copy(sun)
    renderer.toneMappingExposure = skyEffectController.exposure
}

const skyFolder = gui.addFolder('Sky')
skyFolder.add(skyEffectController, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSun)
skyFolder.add(skyEffectController, 'rayleigh', 0.0, 4, 0.001).onChange(updateSun)
skyFolder.add(skyEffectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSun)
skyFolder.add(skyEffectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSun)
skyFolder.add(skyEffectController, 'elevation', 0, 90, 0.1).onChange(updateSun)
skyFolder.add(skyEffectController, 'azimuth', -180, 180, 0.1).onChange(updateSun)
skyFolder.add(skyEffectController, 'exposure', 0, 1, 0.0001).onChange(updateSun)
skyFolder.close()

updateSun()

/**
 * Fog
 */
scene.fog = new THREE.FogExp2('#871769', 0.08)

const fogFolder = gui.addFolder('Fog')
fogFolder.close()

fogFolder.add(scene.fog, 'density').min(0).max(0.5).step(0.001)

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // Update memory planes
  planeObjects.forEach(obj => {
    obj.mesh.lookAt(camera.position)
  })

  // Update sprite
  updateSpritePosition()
 
  // Update physics world
  world.step(1/60, deltaTime, 3)

  objectsToUpdate.forEach(obj => {
    obj.mesh.position.copy(obj.body.position)
    obj.mesh.quaternion.copy(obj.body.quaternion)
  })

  // Update camera body
  moveCameraCollider()

  // Update cannonDebugger
  cannonDebugger.update()


  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
