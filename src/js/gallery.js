import * as THREE from 'three'
import { gsap } from 'gsap'
import { scene, revealScene } from './scene.js'
import { textureLoader } from './loaders.js'
import { registerAssets, markAssetLoaded } from './loading.js'
import { CONFIG } from './config.js'
import { openMemory, isModalOpen } from './modal.js'
import { setMemoryDucked } from './sounds.js'
import { getPlayerPosition } from './player.js'

/**
 * Memories - Images
 */
// Small glowing fruit dangling under each card, tying them to the orchard
const stemAppleGeometry = new THREE.SphereGeometry(0.26, 12, 10)
stemAppleGeometry.scale(1, 0.88, 1)
const stemAppleMaterial = new THREE.MeshStandardMaterial({
    color: '#c0392b',
    emissive: '#ff4433',
    emissiveIntensity: 0.8,
    roughness: 0.5,
})
const stemApples = []
const memoryAlphaTexture = textureLoader.load('/memories/memoryAlpha.webp')

// Mesh array for referencing in tick()
const planeObjects = []

const memoryFolderPrefix = CONFIG.gallery.folderPrefix
const manifestUrl = CONFIG.gallery.manifestUrl

const memoryTextures = []
const panelSources = []

const loadMemoryTextures = async () => {
    let galleryFiles

    try {
        const response = await fetch(manifestUrl)
        const imageFiles = await response.json()
        galleryFiles = imageFiles.filter((file) => file.startsWith(memoryFolderPrefix))
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
    registerAssets(galleryFiles.length)
    const results = await Promise.allSettled(
        galleryFiles.map((file) => textureLoader.loadAsync(`/${file}`)),
    )

    results.forEach((result, index) => {
        markAssetLoaded()
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
        panelSources[index] = `/${galleryFiles[index]}`
    })

    if (!memoryTextures.some(Boolean)) {
        console.error('All memory textures failed to load')
        revealScene()
        return
    }

    revealScene()
    generateMemoryPanels()

    panelsReady = true
    readyCallbacks.forEach((callback) => callback())
}

// Only one memory is shown at a time; proximity uses hysteresis so a card
// doesn't flicker when the camera sits right on the boundary radius.
let activePanelIndex = -1

const showPanel = (index) => {
    if (activePanelIndex === index) return
    activePanelIndex = index
    updateSpriteMaterial(index)
    setMemoryDucked(true)
}

const hidePanel = () => {
    if (activePanelIndex === -1) return
    activePanelIndex = -1
    updateSpriteMaterial(-1)
    setMemoryDucked(false)
}

const generateMemoryPanels = () => {
    const planeSize = CONFIG.gallery.planeSize

    // Geometry shared by every card
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize)

    // Irrational multipliers give each card its own angle, radius band, and
    // height without clustering - an organic spiral through the grove
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

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

        const angle = index * GOLDEN_ANGLE
        const radiusBand = THREE.MathUtils.lerp(
            CONFIG.gallery.layoutRadiusMin,
            CONFIG.gallery.layoutRadiusMax,
            (index * 0.618033988749895) % 1,
        )
        const height = CONFIG.gallery.panelHeight + ((index * 0.7548776662466927) % 1) * 1.6

        planeMesh.position.set(Math.sin(angle) * radiusBand, height, Math.cos(angle) * radiusBand)

        scene.add(planeMesh)

        // Stem fruit hanging beneath the card, bobbing gently
        const stemApple = new THREE.Mesh(stemAppleGeometry, stemAppleMaterial)
        stemApple.position.copy(planeMesh.position)
        stemApple.position.y -= planeSize / 2 + 0.9
        scene.add(stemApple)
        stemApples.push({ mesh: stemApple, baseY: stemApple.position.y, phase: index * 1.7 })

        planeObjects.push({
            mesh: planeMesh,
        })
    })
}

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
        gsap.to(sprite.scale, {
            duration: 0.5,
            x: 0,
            y: 0,
            z: 0,
            onComplete: () => (sprite.visible = false),
        })
    } else {
        sprite.visible = true
        gsap.to(sprite.scale, {
            duration: 0.5,
            x: 3,
            y: 3,
            z: 3,
            onStart: () => {
                sprite.material.map = memoryTextures[textureIndex]
                sprite.material.needsUpdate = true
            },
        })
    }
}

const updateSpritePosition = (camera) => {
    // Position the sprite in front of the camera
    camera.getWorldDirection(cameraDirection)
    spritePosition.copy(camera.position).addScaledVector(cameraDirection, distanceFromCamera)
    sprite.position.copy(spritePosition)
}

// Resolved once panels exist; used by deep links and the tour mode
const readyCallbacks = []
let panelsReady = false

export const onPanelsReady = (callback) => {
    if (panelsReady) callback()
    else readyCallbacks.push(callback)
}

export const getPanelCount = () => planeObjects.length

export const getPanelPosition = (index) => planeObjects[index].mesh.position.clone()

// Forced focus (deep links, tour): while locked, proximity detection stays
// out of the way so it cannot close the card we deliberately opened.
let focusLocked = false

// Show a panel's card without needing camera proximity (deep links, tour)
export const focusPanel = (index) => {
    if (!planeObjects[index]) return
    focusLocked = true
    showPanel(index)
}

export const unfocusPanel = () => {
    focusLocked = false
    hidePanel()
}

export const getPanelSource = (index) => panelSources[index]

loadMemoryTextures()

// Called from the render loop
export const updateGallery = (camera, elapsedTime = 0) => {
    // Billboard every memory panel toward the camera
    planeObjects.forEach((obj) => {
        obj.mesh.lookAt(camera.position)
    })

    // Gentle bob on the stem fruit
    stemApples.forEach(({ mesh, baseY, phase }) => {
        mesh.position.y = baseY + Math.sin(elapsedTime * 1.6 + phase) * 0.18
    })

    updateSpritePosition(camera)

    // Distance-based proximity measured from the player apple: nearest panel
    // within the enter radius expands; the open card only collapses once the
    // apple leaves its larger exit radius. Distances are planar (XZ) so a
    // card's hanging height never distorts the radius. Skipped entirely while
    // a forced focus is active.
    if (planeObjects.length === 0 || focusLocked) return

    const playerPosition = getPlayerPosition()

    if (activePanelIndex === -1) {
        let nearestIndex = -1
        let nearestDistance = Infinity

        planeObjects.forEach((obj, index) => {
            const dx = playerPosition.x - obj.mesh.position.x
            const dz = playerPosition.z - obj.mesh.position.z
            const distance = Math.hypot(dx, dz)
            if (distance < nearestDistance) {
                nearestDistance = distance
                nearestIndex = index
            }
        })

        if (nearestIndex !== -1 && nearestDistance <= CONFIG.gallery.proximityEnter) {
            showPanel(nearestIndex)
        }
    } else {
        const activeMesh = planeObjects[activePanelIndex].mesh
        const dx = playerPosition.x - activeMesh.position.x
        const dz = playerPosition.z - activeMesh.position.z
        if (Math.hypot(dx, dz) > CONFIG.gallery.proximityExit) {
            hidePanel()
        }
    }
}

/**
 * Click-to-open: taps (not drags) on a panel open its fullscreen viewer.
 */
const raycaster = new THREE.Raycaster()
const pointerNDC = new THREE.Vector2()
let pointerDownInfo = null

const panelAtPointer = (event, camera, canvas) => {
    pointerNDC.x = (event.clientX / canvas.clientWidth) * 2 - 1
    pointerNDC.y = -(event.clientY / canvas.clientHeight) * 2 + 1

    raycaster.setFromCamera(pointerNDC, camera)
    const hits = raycaster.intersectObjects(
        planeObjects.map((obj) => obj.mesh),
        false,
    )

    if (hits.length === 0) return -1
    return planeObjects.findIndex((obj) => obj.mesh === hits[0].object)
}

export const initGalleryInteraction = (camera, canvas) => {
    canvas.addEventListener('pointerdown', (event) => {
        pointerDownInfo = { x: event.clientX, y: event.clientY, time: performance.now() }
    })

    canvas.addEventListener('pointerup', (event) => {
        if (!pointerDownInfo || isModalOpen()) {
            pointerDownInfo = null
            return
        }

        const dx = event.clientX - pointerDownInfo.x
        const dy = event.clientY - pointerDownInfo.y
        const elapsed = performance.now() - pointerDownInfo.time
        pointerDownInfo = null

        // Treat small, quick presses as taps so orbit drags never open panels
        if (dx * dx + dy * dy > 36 || elapsed > 400) return

        const panelIndex = panelAtPointer(event, camera, canvas)
        if (panelIndex !== -1 && memoryTextures[panelIndex]) {
            openMemory({ url: panelSources[panelIndex], index: panelIndex })
        }
    })

    canvas.addEventListener('pointermove', (event) => {
        canvas.style.cursor = panelAtPointer(event, camera, canvas) !== -1 ? 'pointer' : 'grab'
    })
}
