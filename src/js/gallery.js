import * as THREE from "three"
import * as CANNON from "cannon-es"
import { gsap } from 'gsap'
import { scene, revealScene } from "./scene.js"
import { textureLoader } from "./loaders.js"
import { world, cameraBody } from "./physics.js"

/**
 * Memories - Images
 */
const memoryAlphaTexture = textureLoader.load('/memories/memoryAlpha.webp')

// Mesh array for referencing in tick()
const planeObjects = []

const memoryFolderPrefix = 'memories/textures/webp/'
const manifestUrl = '/manifest.json'

const memoryTextures = []

const loadMemoryTextures = async () => {
    let galleryFiles

    try {
        const response = await fetch(manifestUrl)
        const imageFiles = await response.json()
        galleryFiles = imageFiles.filter(file => file.startsWith(memoryFolderPrefix))
    } catch (error) {
        console.error('Error fetching manifest:', error)
        revealScene()
        return
    }

    if (galleryFiles.length === 0) {
        console.warn(`No images found in folder: ${memoryFolderPrefix}`)
        revealScene()
        return
    }

    // Load in manifest order so panel indexes stay stable; one failure must not block the scene
    const results = await Promise.allSettled(
        galleryFiles.map(file => textureLoader.loadAsync(`/${file}`))
    )

    results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
            console.error(`Failed to load ${galleryFiles[index]}:`, result.reason)
            return
        }

        const texture = result.value
        texture.colorSpace = THREE.SRGBColorSpace
        texture.generateMipmaps = false
        // generateMipmaps is off, so the default mip-mapped minFilter must go too
        texture.minFilter = THREE.LinearFilter
        memoryTextures[index] = texture
    })

    if (!memoryTextures.some(Boolean)) {
        console.error('All memory textures failed to load')
        revealScene()
        return
    }

    revealScene()
    generateMemoryPanels()
}

// Only one memory is shown at a time; cannon-es fires 'collide' on every
// step while overlapping, so state guards keep the tweens from churning.
let activePanelIndex = -1

const showPanel = (index) => {
    if (activePanelIndex === index) return
    activePanelIndex = index
    updateSpriteMaterial(index)
}

const hidePanel = () => {
    if (activePanelIndex === -1) return
    activePanelIndex = -1
    updateSpriteMaterial(-1)
}

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
            if (event.body === cameraBody) showPanel(index)
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
        if (!planeObject) return

        // Only hide if the panel being left is the one currently shown,
        // so a late endContact can't dismiss a panel just entered.
        const planeIndex = planeObjects.indexOf(planeObject)
        if (planeIndex === activePanelIndex) hidePanel()
    }
})

const spriteMaterial = new THREE.SpriteMaterial()
const sprite = new THREE.Sprite(spriteMaterial)
sprite.scale.set(3, 3, 1)
sprite.visible = false
scene.add(sprite)

// Utils (scratch objects reused every frame to avoid GC churn)
const cameraDirection = new THREE.Vector3()
const spritePosition = new THREE.Vector3()
const distanceFromCamera = 2 // Distance from the camera

const updateSpriteMaterial = (textureIndex) => {
    gsap.killTweensOf(sprite.scale)

    if (textureIndex === -1) {
        gsap.to(sprite.scale, { duration: 0.5, x: 0, y: 0, z: 0, onComplete: () => sprite.visible = false })
    } else {
        sprite.visible = true
        gsap.to(sprite.scale, { duration: 0.5, x: 3, y: 3, z: 3, onStart: () => {
            sprite.material.map = memoryTextures[textureIndex];
            sprite.material.needsUpdate = true;
        }})
    }
}

const updateSpritePosition = (camera) => {
    // Position the sprite in front of the camera
    camera.getWorldDirection(cameraDirection)
    spritePosition.copy(camera.position).addScaledVector(cameraDirection, distanceFromCamera)
    sprite.position.copy(spritePosition)
}

loadMemoryTextures()

// Called from the render loop
export const updateGallery = (camera) => {
    // Billboard every memory panel toward the camera
    planeObjects.forEach(obj => {
        obj.mesh.lookAt(camera.position)
    })

    updateSpritePosition(camera)
}
